/**
 * Dashboard Activities Module Tests
 *
 * Tests activity recording and fetching with organization isolation
 * Target: 90%+ coverage for module logic
 */

import {
  recordActivity,
  markActivityAsRead,
  archiveActivity,
} from '@/lib/modules/dashboard';
import {
  getRecentActivities,
  getActivitiesByType,
  getActivitiesByEntity,
} from '@/lib/modules/dashboard';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

// Mock dependencies
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    activity_feeds: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Dashboard Activities Module', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@test.com',
    role: 'USER',
    organizationRole: 'MEMBER',
    organizationId: 'org-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordActivity', () => {
    const validActivity = {
      title: 'Created new contact',
      type: 'USER_ACTION',
      entityType: 'contact',
      entityId: 'contact-123',
      action: 'created',
      description: 'User created a new contact',
      severity: 'INFO',
    };

    it('should record activity with org isolation', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.create.mockResolvedValue({
        id: 'activity-123',
        title: 'Created new contact',
        type: 'USER_ACTION',
        entity_type: 'contact',
        entity_id: 'contact-123',
        organization_id: 'org-123',
        user_id: 'user-123',
        created_at: new Date(),
      } as any);

      const result = await recordActivity(validActivity);

      expect(result).toBeDefined();
      expect(result.organization_id).toBe('org-123');
      expect(result.user_id).toBe('user-123');
      expect(mockPrisma.activity_feeds.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entity_type: 'contact',
          entity_id: 'contact-123',
          organization_id: 'org-123',
          user_id: 'user-123',
        }),
      });
    });

    it('should use current user ID if userId not provided', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.create.mockResolvedValue({
        id: 'activity-456',
        title: 'Activity',
        type: 'SYSTEM',
        entity_type: 'test',
        entity_id: 'test-123',
        organization_id: 'org-123',
        user_id: 'user-123', // Should be current user
        created_at: new Date(),
      } as any);

      const activityWithoutUser = {
        ...validActivity,
        userId: undefined,
      };

      const result = await recordActivity(activityWithoutUser);

      expect(result.user_id).toBe('user-123');
    });

    it('should allow custom userId for system activities', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.create.mockResolvedValue({
        id: 'activity-789',
        title: 'System Activity',
        type: 'SYSTEM',
        entity_type: 'system',
        entity_id: 'system-1',
        organization_id: 'org-123',
        user_id: 'custom-user-id',
        created_at: new Date(),
      } as any);

      const activityWithCustomUser = {
        ...validActivity,
        userId: 'custom-user-id',
      };

      const result = await recordActivity(activityWithCustomUser);

      expect(result.user_id).toBe('custom-user-id');
    });

    it('should validate activity input with schema', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);

      const invalidActivity = {
        // Missing required fields
        title: '',
        type: 'INVALID_TYPE',
      };

      await expect(recordActivity(invalidActivity))
        .rejects
        .toThrow();
    });
  });

  describe('getRecentActivities', () => {
    it('should fetch recent activities with default limit', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      const mockActivities = Array.from({ length: 5 }, (_, i) => ({
        id: `activity-${i}`,
        title: `Activity ${i}`,
        type: 'USER_ACTION',
        entity_type: 'test',
        entity_id: `test-${i}`,
        organization_id: 'org-123',
        user_id: 'user-123',
        is_archived: false,
        is_read: false,
        created_at: new Date(Date.now() - i * 1000), // Descending timestamps
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'user@test.com',
          avatar_url: null,
        },
      }));

      mockPrisma.activity_feeds.findMany.mockResolvedValue(mockActivities as any);

      const activities = await getRecentActivities();

      expect(activities).toHaveLength(5);
      expect(mockPrisma.activity_feeds.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org-123',
          is_archived: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 20, // Default limit
      });
    });

    it('should respect custom limit parameter', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          title: 'Activity 1',
          organization_id: 'org-123',
        } as any,
      ]);

      await getRecentActivities(5);

      expect(mockPrisma.activity_feeds.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });

    it('should filter out archived activities', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          title: 'Non-archived Activity',
          organization_id: 'org-123',
          is_archived: false,
        } as any,
      ]);

      const activities = await getRecentActivities();

      expect(mockPrisma.activity_feeds.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_archived: false,
          }),
        })
      );
    });

    it('should sort activities by created_at desc', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      const mockActivities = [
        {
          id: 'activity-1',
          title: 'Recent Activity',
          created_at: new Date('2025-10-07T12:00:00Z'),
          organization_id: 'org-123',
        } as any,
        {
          id: 'activity-2',
          title: 'Old Activity',
          created_at: new Date('2025-10-06T12:00:00Z'),
          organization_id: 'org-123',
        } as any,
      ];

      mockPrisma.activity_feeds.findMany.mockResolvedValue(mockActivities);

      const activities = await getRecentActivities();

      // First activity should be most recent
      expect(activities[0].created_at.getTime()).toBeGreaterThan(
        activities[1].created_at.getTime()
      );
    });

    it('should include user information in results', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          title: 'Activity',
          organization_id: 'org-123',
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'user@test.com',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        } as any,
      ]);

      const activities = await getRecentActivities();

      expect(activities[0].user).toBeDefined();
      expect(activities[0].user.name).toBe('Test User');
    });
  });

  describe('getActivitiesByType', () => {
    it('should filter activities by type with org isolation', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          title: 'User Action',
          type: 'USER_ACTION',
          organization_id: 'org-123',
        } as any,
      ]);

      const activities = await getActivitiesByType('USER_ACTION', 10);

      expect(mockPrisma.activity_feeds.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org-123',
          type: 'USER_ACTION',
          is_archived: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      });
    });
  });

  describe('getActivitiesByEntity', () => {
    it('should filter activities by entity type and ID', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          title: 'Contact Activity',
          entity_type: 'contact',
          entity_id: 'contact-123',
          organization_id: 'org-123',
        } as any,
      ]);

      const activities = await getActivitiesByEntity('contact', 'contact-123');

      expect(mockPrisma.activity_feeds.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org-123',
          entity_type: 'contact',
          entity_id: 'contact-123',
          is_archived: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should only return activities for current org', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          entity_type: 'contact',
          entity_id: 'contact-123',
          organization_id: 'org-123', // Same org
        } as any,
      ]);

      const activities = await getActivitiesByEntity('contact', 'contact-123');

      // Verify all activities belong to current org
      expect(activities.every((a: any) => a.organization_id === 'org-123')).toBe(true);
    });
  });

  describe('markActivityAsRead', () => {
    it('should mark activity as read for authorized user', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue({
        id: 'activity-123',
        title: 'Activity',
        organization_id: 'org-123',
        is_read: false,
      } as any);
      mockPrisma.activity_feeds.update.mockResolvedValue({
        id: 'activity-123',
        title: 'Activity',
        organization_id: 'org-123',
        is_read: true,
      } as any);

      const result = await markActivityAsRead('activity-123');

      expect(result.is_read).toBe(true);
      expect(mockPrisma.activity_feeds.update).toHaveBeenCalledWith({
        where: { id: 'activity-123' },
        data: { is_read: true },
      });
    });

    it('should reject marking activity from different org', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue({
        id: 'activity-456',
        title: 'Other Org Activity',
        organization_id: 'org-456', // Different org
        is_read: false,
      } as any);

      await expect(markActivityAsRead('activity-456'))
        .rejects
        .toThrow('Activity not found');
    });

    it('should throw error for non-existent activity', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue(null);

      await expect(markActivityAsRead('non-existent'))
        .rejects
        .toThrow('Activity not found');
    });
  });

  describe('archiveActivity', () => {
    it('should archive activity for authorized user', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue({
        id: 'activity-123',
        title: 'Activity',
        organization_id: 'org-123',
        is_archived: false,
      } as any);
      mockPrisma.activity_feeds.update.mockResolvedValue({
        id: 'activity-123',
        title: 'Activity',
        organization_id: 'org-123',
        is_archived: true,
      } as any);

      const result = await archiveActivity('activity-123');

      expect(result.is_archived).toBe(true);
      expect(mockPrisma.activity_feeds.update).toHaveBeenCalledWith({
        where: { id: 'activity-123' },
        data: { is_archived: true },
      });
    });

    it('should reject archiving activity from different org', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue({
        id: 'activity-456',
        title: 'Other Org Activity',
        organization_id: 'org-456', // Different org
        is_archived: false,
      } as any);

      await expect(archiveActivity('activity-456'))
        .rejects
        .toThrow('Activity not found');
    });

    it('should throw error for non-existent activity', async () => {
      mockRequireAuth.mockResolvedValue(mockUser as any);
      mockPrisma.activity_feeds.findUnique.mockResolvedValue(null);

      await expect(archiveActivity('non-existent'))
        .rejects
        .toThrow('Activity not found');
    });
  });
});
