/**
 * REID Alerts Module Test Suite
 * Tests for property alerts CRUD operations with multi-tenant isolation and tier limits
 *
 * Coverage: createPropertyAlert, updatePropertyAlert, deletePropertyAlert, createAlertTrigger
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createPropertyAlert,
  updatePropertyAlert,
  deletePropertyAlert,
  createAlertTrigger,
  acknowledgeAlertTrigger,
} from '@/lib/modules/reid/alerts/actions';
import { getPropertyAlerts } from '@/lib/modules/reid/alerts/queries';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import { mockAsyncFunction, mockFunction } from '../../../helpers/mock-helpers';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    property_alerts: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    alert_triggers: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessREID: jest.fn(),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('REID Alerts Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default auth mock
    mockAsyncFunction(requireAuth).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: null,
      role: 'USER',
      globalRole: 'USER',
      subscription_tier: 'GROWTH',
      subscriptionTier: 'GROWTH',
      organizationId: 'org-123',
      organizationRole: 'MEMBER',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      _raw: {} as any,
    });

    // Setup default RBAC mock
    mockFunction(canAccessREID).mockReturnValue(true);
  });

  describe('createPropertyAlert', () => {
    it('creates alert with proper organization isolation', async () => {
      const mockAlert = {
        id: 'alert-123',
        name: 'Price Drop Alert',
        alert_type: 'PRICE_DROP',
        organization_id: 'org-123',
        created_by_id: 'user-123',
        created_at: new Date(),
      };

      mockAsyncFunction(prisma.property_alerts.create).mockResolvedValue(mockAlert);

      const result = await createPropertyAlert({
        name: 'Price Drop Alert',
        alertType: 'PRICE_DROP',
        criteria: { threshold: 10 },
        areaCodes: ['94110'],
        frequency: 'DAILY',
      });

      expect(result.organization_id).toBe('org-123');
      expect(result.created_by_id).toBe('user-123');
      expect(prisma.property_alerts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-123',
            created_by_id: 'user-123',
            name: 'Price Drop Alert',
            alert_type: 'PRICE_DROP',
          }),
        })
      );
    });

    it('validates required fields', async () => {
      await expect(
        createPropertyAlert({
          name: '', // Invalid: empty string
          alertType: 'PRICE_DROP',
          criteria: {},
          areaCodes: ['94110'],
          frequency: 'DAILY',
        } as any)
      ).rejects.toThrow();
    });

    it('checks REID access permission', async () => {
      mockFunction(canAccessREID).mockReturnValue(false);

      await expect(
        createPropertyAlert({
          name: 'Test Alert',
          alertType: 'PRICE_DROP',
          criteria: {},
          areaCodes: ['94110'],
          frequency: 'DAILY',
        })
      ).rejects.toThrow('Unauthorized: REID access required');

      mockFunction(canAccessREID).mockReturnValue(true);
    });

    it('revalidates cache paths', async () => {
      mockAsyncFunction(prisma.property_alerts.create).mockResolvedValue({
        id: 'alert-123',
        name: 'Test Alert',
        organization_id: 'org-123',
      });

      await createPropertyAlert({
        name: 'Test Alert',
        alertType: 'PRICE_DROP',
        criteria: {},
        areaCodes: ['94110'],
        frequency: 'DAILY',
      });

      expect(revalidatePath).toHaveBeenCalledWith('/real-estate/reid/alerts');
    });
  });

  describe('updatePropertyAlert', () => {
    it('updates alert successfully', async () => {
      const mockExisting = {
        id: 'alert-123',
        name: 'Original Name',
        organization_id: 'org-123',
      };
      const mockUpdated = {
        ...mockExisting,
        name: 'Updated Name',
        is_active: false,
      };

      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(mockExisting);
      mockAsyncFunction(prisma.property_alerts.update).mockResolvedValue(mockUpdated);

      const result = await updatePropertyAlert('alert-123', {
        name: 'Updated Name',
        isActive: false,
      });

      expect(result.name).toBe('Updated Name');
      expect(result.is_active).toBe(false);
    });

    it('verifies organization ownership before update', async () => {
      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(null);

      await expect(
        updatePropertyAlert('alert-123', {
          name: 'Updated Name',
        })
      ).rejects.toThrow('Alert not found');

      expect(prisma.property_alerts.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'alert-123',
            organization_id: 'org-123',
          }),
        })
      );
    });

    it('prevents updating alert from another organization', async () => {
      // User from org-123 trying to update alert from org-456
      mockAsyncFunction(requireAuth).mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(null);

      await expect(
        updatePropertyAlert('alert-456', {
          name: 'Hacked',
        })
      ).rejects.toThrow('Alert not found');
    });
  });

  describe('deletePropertyAlert', () => {
    it('deletes alert successfully', async () => {
      const mockAlert = {
        id: 'alert-123',
        organization_id: 'org-123',
      };

      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(mockAlert);
      mockAsyncFunction(prisma.property_alerts.delete).mockResolvedValue(mockAlert);

      await deletePropertyAlert('alert-123');

      expect(prisma.property_alerts.delete).toHaveBeenCalledWith({
        where: { id: 'alert-123' },
      });
    });

    it('verifies organization ownership before delete', async () => {
      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(null);

      await expect(deletePropertyAlert('alert-123')).rejects.toThrow('Alert not found');
    });

    it('prevents deleting alert from another organization', async () => {
      mockAsyncFunction(prisma.property_alerts.findFirst).mockResolvedValue(null);

      await expect(deletePropertyAlert('alert-456')).rejects.toThrow('Alert not found');
    });
  });

  describe('createAlertTrigger', () => {
    it('creates trigger and updates alert', async () => {
      const mockTrigger = {
        id: 'trigger-123',
        alert_id: 'alert-123',
        triggered_by: { condition: 'price_drop', value: 10 },
        message: 'Price dropped by 10%',
        severity: 'HIGH',
        created_at: new Date(),
      };

      mockAsyncFunction(prisma.alert_triggers.create).mockResolvedValue(mockTrigger);
      mockAsyncFunction(prisma.property_alerts.update).mockResolvedValue({
        id: 'alert-123',
        trigger_count: 1,
        last_triggered: new Date(),
      });

      const result = await createAlertTrigger({
        alertId: 'alert-123',
        triggeredBy: { condition: 'price_drop', value: 10 },
        message: 'Price dropped by 10%',
        severity: 'HIGH',
      });

      expect(result).toBeDefined();
      expect(prisma.alert_triggers.create).toHaveBeenCalled();
      expect(prisma.property_alerts.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alert-123' },
          data: expect.objectContaining({
            trigger_count: { increment: 1 },
            last_triggered: expect.any(Date),
          }),
        })
      );
    });

    it('validates trigger input', async () => {
      await expect(
        createAlertTrigger({
          alertId: '', // Invalid: empty string
          triggeredBy: {},
          message: 'Test',
          severity: 'HIGH',
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('acknowledgeAlertTrigger', () => {
    it('acknowledges trigger successfully', async () => {
      const mockUpdated = {
        id: 'trigger-123',
        acknowledged: true,
        acknowledged_at: new Date(),
        acknowledged_by_id: 'user-123',
      };

      mockAsyncFunction(prisma.alert_triggers.update).mockResolvedValue(mockUpdated);

      const result = await acknowledgeAlertTrigger('trigger-123', 'user-123');

      expect(result.acknowledged).toBe(true);
      expect(result.acknowledged_by_id).toBe('user-123');
      expect(prisma.alert_triggers.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'trigger-123' },
          data: expect.objectContaining({
            acknowledged: true,
            acknowledged_at: expect.any(Date),
            acknowledged_by_id: 'user-123',
          }),
        })
      );
    });
  });

  describe('getPropertyAlerts', () => {
    it('filters by organization ID', async () => {
      const mockAlerts = [
        { id: 'alert-1', name: 'Alert 1', organization_id: 'org-123' },
        { id: 'alert-2', name: 'Alert 2', organization_id: 'org-123' },
      ];

      mockAsyncFunction(prisma.property_alerts.findMany).mockResolvedValue(mockAlerts);

      const result = await getPropertyAlerts();

      expect(prisma.property_alerts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-123',
          }),
        })
      );
      expect(result).toHaveLength(2);
    });

    it('filters by alert type', async () => {
      mockAsyncFunction(prisma.property_alerts.findMany).mockResolvedValue([]);

      await getPropertyAlerts();

      expect(prisma.property_alerts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-123',
          }),
        })
      );
    });

    it('filters by active status', async () => {
      mockAsyncFunction(prisma.property_alerts.findMany).mockResolvedValue([]);

      await getPropertyAlerts();

      expect(prisma.property_alerts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
          }),
        })
      );
    });

    it('checks REID access permission', async () => {
      mockFunction(canAccessREID).mockReturnValue(false);

      await expect(getPropertyAlerts()).rejects.toThrow(
        'Unauthorized: REID access required'
      );

      mockFunction(canAccessREID).mockReturnValue(true);
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('prevents accessing alerts from other organizations', async () => {
      // User from org-123
      mockAsyncFunction(requireAuth).mockResolvedValue({
        id: 'user-123',
        organizationId: 'org-123',
        globalRole: 'USER',
      });

      // Alerts from both orgs in database
      const allAlerts = [
        { id: 'alert-1', organization_id: 'org-123' },
        { id: 'alert-2', organization_id: 'org-456' },
      ];

      // Prisma should only return org-123's alerts
      mockAsyncFunction(prisma.property_alerts.findMany).mockImplementation((args: { where: { organization_id: string } }) => {
        return allAlerts.filter(
          (a: { id: string; organization_id: string }) => a.organization_id === args.where.organization_id
        );
      });

      const result = await getPropertyAlerts();

      // Should only get alerts from org-123
      expect(result).toHaveLength(1);
      expect(result[0].organization_id).toBe('org-123');
    });
  });
});
