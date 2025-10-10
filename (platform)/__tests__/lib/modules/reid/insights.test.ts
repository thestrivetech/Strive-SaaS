/**
 * REID Insights Module Test Suite
 * Tests for neighborhood insights CRUD operations with multi-tenant isolation and RBAC
 *
 * Coverage: createNeighborhoodInsight, updateNeighborhoodInsight, deleteNeighborhoodInsight, getNeighborhoodInsights
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createNeighborhoodInsight,
  updateNeighborhoodInsight,
  deleteNeighborhoodInsight,
} from '@/lib/modules/reid/insights/actions';
import { getNeighborhoodInsights } from '@/lib/modules/reid/insights/queries';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID, canAccessFeature } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    neighborhood_insights: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    id: 'user-123',
    organizationId: 'org-123',
    globalRole: 'USER',
    organizationRole: 'MEMBER',
    subscriptionTier: 'GROWTH',
  }),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessREID: jest.fn(() => true),
  canAccessFeature: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('REID Insights Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNeighborhoodInsight', () => {
    it('creates insight for current organization only', async () => {
      const mockInsight = {
        id: 'insight-123',
        area_code: '94110',
        area_name: 'Mission District',
        area_type: 'ZIP',
        organization_id: 'org-123',
        created_by_id: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      prisma.neighborhood_insights.create.mockResolvedValue(mockInsight);

      const result = await createNeighborhoodInsight({
        areaCode: '94110',
        areaName: 'Mission District',
        areaType: 'ZIP',
        medianPrice: 1200000,
        daysOnMarket: 30,
        inventory: 150,
      });

      expect(result.organization_id).toBe('org-123');
      expect(result.created_by_id).toBe('user-123');
      expect(prisma.neighborhood_insights.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-123',
            created_by_id: 'user-123',
            area_code: '94110',
            area_name: 'Mission District',
          }),
        })
      );
    });

    it('validates input with Zod schema', async () => {
      await expect(
        createNeighborhoodInsight({
          areaCode: '', // Invalid: empty string
          areaName: 'Test',
          areaType: 'ZIP',
        } as any)
      ).rejects.toThrow();
    });

    it('checks REID access permission', async () => {
      canAccessREID.mockReturnValue(false);

      await expect(
        createNeighborhoodInsight({
          areaCode: '94110',
          areaName: 'Mission District',
          areaType: 'ZIP',
        } as any)
      ).rejects.toThrow('Unauthorized: REID access required');

      canAccessREID.mockReturnValue(true);
    });

    it('checks feature tier permission', async () => {
      canAccessFeature.mockReturnValue(false);

      await expect(
        createNeighborhoodInsight({
          areaCode: '94110',
          areaName: 'Mission District',
          areaType: 'ZIP',
        } as any)
      ).rejects.toThrow('Upgrade required');

      canAccessFeature.mockReturnValue(true);
    });

    it('revalidates cache paths', async () => {
      prisma.neighborhood_insights.create.mockResolvedValue({
        id: 'insight-123',
        area_code: '94110',
        organization_id: 'org-123',
      });

      await createNeighborhoodInsight({
        areaCode: '94110',
        areaName: 'Mission District',
        areaType: 'ZIP',
      } as any);

      expect(revalidatePath).toHaveBeenCalledWith('/real-estate/reid/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/real-estate/reid/insights');
    });
  });

  describe('updateNeighborhoodInsight', () => {
    it('updates insight successfully', async () => {
      const mockExisting = {
        id: 'insight-123',
        area_code: '94110',
        organization_id: 'org-123',
      };
      const mockUpdated = {
        ...mockExisting,
        area_name: 'Updated Name',
        median_price: 1300000,
      };

      prisma.neighborhood_insights.findFirst.mockResolvedValue(mockExisting);
      prisma.neighborhood_insights.update.mockResolvedValue(mockUpdated);

      const result = await updateNeighborhoodInsight('insight-123', {
        areaName: 'Updated Name',
        medianPrice: 1300000,
      });

      expect(result.area_name).toBe('Updated Name');
      expect(prisma.neighborhood_insights.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'insight-123' },
          data: expect.objectContaining({
            area_name: 'Updated Name',
            median_price: 1300000,
          }),
        })
      );
    });

    it('verifies organization ownership before update', async () => {
      prisma.neighborhood_insights.findFirst.mockResolvedValue(null);

      await expect(
        updateNeighborhoodInsight('insight-123', {
          areaName: 'Updated Name',
        })
      ).rejects.toThrow('Neighborhood insight not found');

      expect(prisma.neighborhood_insights.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'insight-123',
            organization_id: 'org-123',
          }),
        })
      );
    });

    it('prevents updating insight from another organization', async () => {
      // User from org-123 trying to update insight from org-456
      requireAuth.mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      prisma.neighborhood_insights.findFirst.mockResolvedValue(null);

      await expect(
        updateNeighborhoodInsight('insight-456', {
          areaName: 'Hacked',
        })
      ).rejects.toThrow('Neighborhood insight not found');
    });
  });

  describe('deleteNeighborhoodInsight', () => {
    it('deletes insight successfully', async () => {
      const mockInsight = {
        id: 'insight-123',
        organization_id: 'org-123',
      };

      prisma.neighborhood_insights.findFirst.mockResolvedValue(mockInsight);
      prisma.neighborhood_insights.delete.mockResolvedValue(mockInsight);

      await deleteNeighborhoodInsight('insight-123');

      expect(prisma.neighborhood_insights.delete).toHaveBeenCalledWith({
        where: { id: 'insight-123' },
      });
    });

    it('verifies organization ownership before delete', async () => {
      prisma.neighborhood_insights.findFirst.mockResolvedValue(null);

      await expect(deleteNeighborhoodInsight('insight-123')).rejects.toThrow(
        'Neighborhood insight not found'
      );

      expect(prisma.neighborhood_insights.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'insight-123',
            organization_id: 'org-123',
          }),
        })
      );
    });

    it('checks REID access permission', async () => {
      canAccessREID.mockReturnValue(false);

      await expect(deleteNeighborhoodInsight('insight-123')).rejects.toThrow(
        'Unauthorized: REID access required'
      );

      canAccessREID.mockReturnValue(true);
    });
  });

  describe('getNeighborhoodInsights', () => {
    it('filters by organization ID', async () => {
      const mockInsights = [
        { id: 'insight-1', area_code: '94110', organization_id: 'org-123' },
        { id: 'insight-2', area_code: '94103', organization_id: 'org-123' },
      ];

      prisma.neighborhood_insights.findMany.mockResolvedValue(mockInsights);

      const result = await getNeighborhoodInsights();

      expect(prisma.neighborhood_insights.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-123',
          }),
        })
      );
      expect(result).toHaveLength(2);
    });

    it('applies area codes filter correctly', async () => {
      prisma.neighborhood_insights.findMany.mockResolvedValue([]);

      await getNeighborhoodInsights({
        areaCodes: ['94110', '94103'],
      });

      expect(prisma.neighborhood_insights.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            area_code: { in: ['94110', '94103'] },
          }),
        })
      );
    });

    it('applies price range filters correctly', async () => {
      prisma.neighborhood_insights.findMany.mockResolvedValue([]);

      await getNeighborhoodInsights({
        minPrice: 500000,
        maxPrice: 1500000,
      });

      expect(prisma.neighborhood_insights.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            median_price: {
              gte: 500000,
              lte: 1500000,
            },
          }),
        })
      );
    });

    it('applies area type filter correctly', async () => {
      prisma.neighborhood_insights.findMany.mockResolvedValue([]);

      await getNeighborhoodInsights({
        areaType: 'ZIP',
      });

      expect(prisma.neighborhood_insights.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            area_type: 'ZIP',
          }),
        })
      );
    });

    it('checks REID access permission', async () => {
      canAccessREID.mockReturnValue(false);

      await expect(getNeighborhoodInsights()).rejects.toThrow(
        'Unauthorized: REID access required'
      );

      canAccessREID.mockReturnValue(true);
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('prevents accessing insights from other organizations', async () => {
      // User from org-123
      requireAuth.mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      // Insights from both orgs in database
      const allInsights = [
        { id: 'insight-1', organization_id: 'org-123' },
        { id: 'insight-2', organization_id: 'org-456' },
      ];

      // Prisma should only return org-123's insights
      prisma.neighborhood_insights.findMany.mockImplementation((args) => {
        return allInsights.filter(
          (i) => i.organization_id === args.where.organization_id
        );
      });

      const result = await getNeighborhoodInsights();

      // Should only get insights from org-123
      expect(result).toHaveLength(1);
      expect(result[0].organization_id).toBe('org-123');
    });
  });
});
