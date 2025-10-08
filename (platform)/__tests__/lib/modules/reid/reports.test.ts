/**
 * REID Reports Module Test Suite
 * Tests for market reports generation with multi-tenant isolation
 *
 * Coverage: createMarketReport, generateReportData, getMarketReports
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createMarketReport,
  deleteMarketReport,
} from '@/lib/modules/reid/reports/actions';
import { getMarketReports } from '@/lib/modules/reid/reports/queries';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    market_reports: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
    subscriptionTier: 'ELITE',
  }),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessREID: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock report generator
jest.mock('@/lib/modules/reid/reports/generator', () => ({
  generateMarketAnalysis: jest.fn(() => ({
    summary: 'Market is showing strong growth',
    keyFindings: ['Finding 1', 'Finding 2'],
    recommendations: ['Recommendation 1', 'Recommendation 2'],
  })),
}));

describe('REID Reports Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMarketReport', () => {
    it('creates report with proper organization isolation', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const mockReport = {
        id: 'report-123',
        title: 'Q1 2024 Market Report',
        organization_id: 'org-123',
        created_by_id: 'user-123',
        created_at: new Date(),
      };

      prisma.market_reports.create.mockResolvedValue(mockReport);

      const result = await createMarketReport({
        title: 'Q1 2024 Market Report',
        reportType: 'QUARTERLY',
        areaCodes: ['94110', '94103'],
        includeInsights: true,
        includeAlerts: true,
        includeForecast: true,
      });

      expect(result.organization_id).toBe('org-123');
      expect(result.created_by_id).toBe('user-123');
      expect(prisma.market_reports.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-123',
            created_by_id: 'user-123',
            title: 'Q1 2024 Market Report',
          }),
        })
      );
    });

    it('validates required fields', async () => {
      await expect(
        createMarketReport({
          title: '', // Invalid: empty string
          reportType: 'QUARTERLY',
          areaCodes: ['94110'],
        } as any)
      ).rejects.toThrow();
    });

    it('checks REID access permission', async () => {
      const { canAccessREID } = require('@/lib/auth/rbac');
      canAccessREID.mockReturnValue(false);

      await expect(
        createMarketReport({
          title: 'Test Report',
          reportType: 'QUARTERLY',
          areaCodes: ['94110'],
        })
      ).rejects.toThrow('Unauthorized: REID access required');

      canAccessREID.mockReturnValue(true);
    });

    it('generates report data using insights', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const { generateMarketAnalysis } = require('@/lib/modules/reid/reports/generator');

      prisma.market_reports.create.mockResolvedValue({
        id: 'report-123',
        title: 'Test Report',
        organization_id: 'org-123',
      });

      await createMarketReport({
        title: 'Test Report',
        reportType: 'QUARTERLY',
        areaCodes: ['94110'],
        includeInsights: true,
      });

      expect(generateMarketAnalysis).toHaveBeenCalled();
    });

    it('revalidates cache paths', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const { revalidatePath } = require('next/cache');

      prisma.market_reports.create.mockResolvedValue({
        id: 'report-123',
        title: 'Test Report',
        organization_id: 'org-123',
      });

      await createMarketReport({
        title: 'Test Report',
        reportType: 'QUARTERLY',
        areaCodes: ['94110'],
      });

      expect(revalidatePath).toHaveBeenCalledWith('/real-estate/reid/reports');
    });
  });

  describe('deleteMarketReport', () => {
    it('deletes report successfully', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const mockReport = {
        id: 'report-123',
        organization_id: 'org-123',
      };

      prisma.market_reports.findFirst.mockResolvedValue(mockReport);
      prisma.market_reports.delete.mockResolvedValue(mockReport);

      await deleteMarketReport('report-123');

      expect(prisma.market_reports.delete).toHaveBeenCalledWith({
        where: { id: 'report-123' },
      });
    });

    it('verifies organization ownership before delete', async () => {
      const { prisma } = require('@/lib/database/prisma');
      prisma.market_reports.findFirst.mockResolvedValue(null);

      await expect(deleteMarketReport('report-123')).rejects.toThrow('Report not found');

      expect(prisma.market_reports.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'report-123',
            organization_id: 'org-123',
          }),
        })
      );
    });

    it('prevents deleting report from another organization', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const { requireAuth } = require('@/lib/auth/middleware');

      // User from org-123 trying to delete report from org-456
      requireAuth.mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      prisma.market_reports.findFirst.mockResolvedValue(null);

      await expect(deleteMarketReport('report-456')).rejects.toThrow('Report not found');
    });
  });

  describe('getMarketReports', () => {
    it('filters by organization ID', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const mockReports = [
        { id: 'report-1', title: 'Report 1', organization_id: 'org-123' },
        { id: 'report-2', title: 'Report 2', organization_id: 'org-123' },
      ];

      prisma.market_reports.findMany.mockResolvedValue(mockReports);

      const result = await getMarketReports();

      expect(prisma.market_reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-123',
          }),
        })
      );
      expect(result).toHaveLength(2);
    });

    it('filters by report type', async () => {
      const { prisma } = require('@/lib/database/prisma');
      prisma.market_reports.findMany.mockResolvedValue([]);

      await getMarketReports({
        reportType: 'QUARTERLY',
      });

      expect(prisma.market_reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            report_type: 'QUARTERLY',
          }),
        })
      );
    });

    it('filters by date range', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');

      prisma.market_reports.findMany.mockResolvedValue([]);

      await getMarketReports({
        startDate,
        endDate,
      });

      expect(prisma.market_reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });

    it('checks REID access permission', async () => {
      const { canAccessREID } = require('@/lib/auth/rbac');
      canAccessREID.mockReturnValue(false);

      await expect(getMarketReports()).rejects.toThrow(
        'Unauthorized: REID access required'
      );

      canAccessREID.mockReturnValue(true);
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('prevents accessing reports from other organizations', async () => {
      const { prisma } = require('@/lib/database/prisma');
      const { requireAuth } = require('@/lib/auth/middleware');

      // User from org-123
      requireAuth.mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      // Reports from both orgs in database
      const allReports = [
        { id: 'report-1', organization_id: 'org-123' },
        { id: 'report-2', organization_id: 'org-456' },
      ];

      // Prisma should only return org-123's reports
      prisma.market_reports.findMany.mockImplementation((args) => {
        return allReports.filter(
          (r) => r.organization_id === args.where.organization_id
        );
      });

      const result = await getMarketReports();

      // Should only get reports from org-123
      expect(result).toHaveLength(1);
      expect(result[0].organization_id).toBe('org-123');
    });
  });
});
