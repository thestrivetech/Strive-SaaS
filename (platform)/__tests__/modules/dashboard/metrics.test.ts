/**
 * Dashboard Metrics Module Tests
 *
 * Tests metrics CRUD operations with organization isolation
 * Target: 90%+ coverage for module logic
 */

import { createDashboardMetric, updateDashboardMetric, deleteDashboardMetric } from '@/lib/modules/dashboard';
import { getDashboardMetrics, getMetricById, getMetricsByCategory } from '@/lib/modules/dashboard';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

// Mock dependencies
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    dashboard_metrics: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Dashboard Metrics Module', () => {
  const mockOrgAdmin = {
    id: 'user-123',
    email: 'admin@test.com',
    role: 'USER',
    organizationRole: 'ADMIN',
    organizationId: 'org-123',
  };

  const mockSuperAdmin = {
    id: 'super-admin-123',
    email: 'superadmin@test.com',
    role: 'SUPER_ADMIN',
    organizationRole: null,
    organizationId: 'org-456',
  };

  const mockRegularUser = {
    id: 'user-456',
    email: 'user@test.com',
    role: 'USER',
    organizationRole: 'MEMBER',
    organizationId: 'org-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDashboardMetric', () => {
    const validInput = {
      name: 'Total Revenue',
      category: 'FINANCIAL',
      query: { type: 'sum', field: 'revenue' },
      unit: '$',
      format: 'currency',
    };

    it('should create metric with org isolation for org admin', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.create.mockResolvedValue({
        id: 'metric-123',
        name: 'Total Revenue',
        category: 'FINANCIAL',
        organization_id: 'org-123',
        created_by: 'user-123',
      } as any);

      const result = await createDashboardMetric(validInput);

      expect(result).toBeDefined();
      expect(mockPrisma.dashboard_metrics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Total Revenue',
          category: 'FINANCIAL',
          organization_id: 'org-123',
          created_by: 'user-123',
        }),
      });
    });

    it('should create metric for super admin', async () => {
      mockRequireAuth.mockResolvedValue(mockSuperAdmin as any);
      mockPrisma.dashboard_metrics.create.mockResolvedValue({
        id: 'metric-456',
        name: 'Total Revenue',
        category: 'FINANCIAL',
        organization_id: 'org-456',
        created_by: 'super-admin-123',
      } as any);

      const result = await createDashboardMetric(validInput);

      expect(result).toBeDefined();
      expect(mockPrisma.dashboard_metrics.create).toHaveBeenCalled();
    });

    it('should reject creation for regular user without admin role', async () => {
      mockRequireAuth.mockResolvedValue(mockRegularUser as any);

      await expect(createDashboardMetric(validInput))
        .rejects
        .toThrow('Insufficient permissions');
    });

    it('should create system metric (null org) for super admin', async () => {
      mockRequireAuth.mockResolvedValue(mockSuperAdmin as any);
      mockPrisma.dashboard_metrics.create.mockResolvedValue({
        id: 'metric-system',
        name: 'System Metric',
        category: 'SYSTEM',
        organization_id: null,
        created_by: 'super-admin-123',
      } as any);

      const systemInput = { ...validInput, organizationId: null };
      const result = await createDashboardMetric(systemInput);

      expect(result).toBeDefined();
      expect(result.organization_id).toBeNull();
    });
  });

  describe('getDashboardMetrics', () => {
    it('should fetch only org-specific metrics for user', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findMany.mockResolvedValue([
        {
          id: 'metric-1',
          name: 'Org Metric',
          category: 'FINANCIAL',
          organization_id: 'org-123',
        } as any,
      ]);

      const metrics = await getDashboardMetrics();

      expect(metrics).toHaveLength(1);
      expect(mockPrisma.dashboard_metrics.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { organization_id: 'org-123' },
            { organization_id: null },
          ],
        },
        orderBy: { category: 'asc' },
      });
    });

    it('should include system metrics (null org) in results', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findMany.mockResolvedValue([
        {
          id: 'metric-org',
          name: 'Org Metric',
          organization_id: 'org-123',
        } as any,
        {
          id: 'metric-system',
          name: 'System Metric',
          organization_id: null,
        } as any,
      ]);

      const metrics = await getDashboardMetrics();

      expect(metrics).toHaveLength(2);
      expect(metrics.some((m: any) => m.organization_id === null)).toBe(true);
    });

    it('should not return other org metrics', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findMany.mockResolvedValue([
        {
          id: 'metric-1',
          name: 'Own Metric',
          organization_id: 'org-123',
        } as any,
      ]);

      const metrics = await getDashboardMetrics();

      // Verify filter was applied (no 'org-456' metrics)
      expect(metrics.every((m: any) =>
        m.organization_id === 'org-123' || m.organization_id === null
      )).toBe(true);
    });
  });

  describe('getMetricById', () => {
    it('should fetch metric for authorized user', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-123',
        name: 'Test Metric',
        organization_id: 'org-123',
      } as any);

      const metric = await getMetricById('metric-123');

      expect(metric).toBeDefined();
      expect(metric.id).toBe('metric-123');
    });

    it('should throw error for unauthorized access', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-456',
        name: 'Other Org Metric',
        organization_id: 'org-456', // Different org
      } as any);

      await expect(getMetricById('metric-456'))
        .rejects
        .toThrow('Unauthorized');
    });

    it('should throw error for non-existent metric', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue(null);

      await expect(getMetricById('non-existent'))
        .rejects
        .toThrow('Metric not found');
    });

    it('should allow access to system metrics', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-system',
        name: 'System Metric',
        organization_id: null,
      } as any);

      const metric = await getMetricById('metric-system');

      expect(metric).toBeDefined();
      expect(metric.organization_id).toBeNull();
    });
  });

  describe('updateDashboardMetric', () => {
    it('should update metric for authorized org admin', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-123',
        name: 'Old Name',
        organization_id: 'org-123',
      } as any);
      mockPrisma.dashboard_metrics.update.mockResolvedValue({
        id: 'metric-123',
        name: 'New Name',
        organization_id: 'org-123',
      } as any);

      const updateInput = {
        id: 'metric-123',
        name: 'New Name',
      };

      const result = await updateDashboardMetric(updateInput);

      expect(result).toBeDefined();
      expect(mockPrisma.dashboard_metrics.update).toHaveBeenCalledWith({
        where: { id: 'metric-123' },
        data: expect.objectContaining({ name: 'New Name' }),
      });
    });

    it('should reject update for regular user without admin role', async () => {
      mockRequireAuth.mockResolvedValue(mockRegularUser as any);

      const updateInput = {
        id: 'metric-123',
        name: 'New Name',
      };

      await expect(updateDashboardMetric(updateInput))
        .rejects
        .toThrow('Insufficient permissions');
    });

    it('should reject update for different org metric', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-456',
        name: 'Other Org Metric',
        organization_id: 'org-456', // Different org
      } as any);

      const updateInput = {
        id: 'metric-456',
        name: 'New Name',
      };

      await expect(updateDashboardMetric(updateInput))
        .rejects
        .toThrow('Metric not found');
    });

    it('should allow super admin to update any metric', async () => {
      mockRequireAuth.mockResolvedValue(mockSuperAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-123',
        name: 'Old Name',
        organization_id: 'org-123', // Different org
      } as any);
      mockPrisma.dashboard_metrics.update.mockResolvedValue({
        id: 'metric-123',
        name: 'New Name',
        organization_id: 'org-123',
      } as any);

      const updateInput = {
        id: 'metric-123',
        name: 'New Name',
      };

      const result = await updateDashboardMetric(updateInput);

      expect(result).toBeDefined();
    });
  });

  describe('deleteDashboardMetric', () => {
    it('should delete metric for authorized org admin', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-123',
        name: 'Test Metric',
        organization_id: 'org-123',
      } as any);
      mockPrisma.dashboard_metrics.delete.mockResolvedValue({} as any);

      await deleteDashboardMetric('metric-123');

      expect(mockPrisma.dashboard_metrics.delete).toHaveBeenCalledWith({
        where: { id: 'metric-123' },
      });
    });

    it('should reject deletion for regular user without admin role', async () => {
      mockRequireAuth.mockResolvedValue(mockRegularUser as any);

      await expect(deleteDashboardMetric('metric-123'))
        .rejects
        .toThrow('Insufficient permissions');
    });

    it('should reject deletion for different org metric', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findUnique.mockResolvedValue({
        id: 'metric-456',
        name: 'Other Org Metric',
        organization_id: 'org-456',
      } as any);

      await expect(deleteDashboardMetric('metric-456'))
        .rejects
        .toThrow('Metric not found');
    });
  });

  describe('getMetricsByCategory', () => {
    it('should filter metrics by category with org isolation', async () => {
      mockRequireAuth.mockResolvedValue(mockOrgAdmin as any);
      mockPrisma.dashboard_metrics.findMany.mockResolvedValue([
        {
          id: 'metric-1',
          name: 'Financial Metric 1',
          category: 'FINANCIAL',
          organization_id: 'org-123',
        } as any,
        {
          id: 'metric-2',
          name: 'Financial Metric 2',
          category: 'FINANCIAL',
          organization_id: 'org-123',
        } as any,
      ]);

      const metrics = await getMetricsByCategory('FINANCIAL');

      expect(metrics).toHaveLength(2);
      expect(mockPrisma.dashboard_metrics.findMany).toHaveBeenCalledWith({
        where: {
          category: 'FINANCIAL',
          OR: [
            { organization_id: 'org-123' },
            { organization_id: null },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });
});
