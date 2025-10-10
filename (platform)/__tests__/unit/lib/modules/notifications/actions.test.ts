/**
 * Notification Actions Test Suite
 * Tests for notification CRUD operations
 */

import { NotificationType } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  bulkMarkNotificationsRead,
  deleteNotification,
} from '@/lib/modules/notifications/actions';

// Mock getCurrentUser
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

jest.mock('@/lib/auth/auth-helpers', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Notification Actions', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe('createNotification', () => {
    it('should create notification with all fields', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const input = {
        userId: user.id,
        organizationId: organization.id,
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test notification',
        actionUrl: '/projects/123',
        entityType: 'PROJECT',
        entityId: '123',
      };

      const result = await createNotification(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Notification');
      expect(result.data?.read).toBe(false);

      // Verify in database
      const dbNotification = await testPrisma.notifications.findUnique({
        where: { id: result.data?.id },
      });
      expect(dbNotification).toBeDefined();
      expect(dbNotification?.message).toBe('This is a test notification');
    });

    it('should create notification with minimal fields', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const input = {
        userId: user.id,
        organizationId: organization.id,
        type: NotificationType.SUCCESS,
        title: 'Success',
        message: 'Operation completed',
      };

      const result = await createNotification(input);

      expect(result.success).toBe(true);
      expect(result.data?.action_url).toBeUndefined();
      expect(result.data?.entity_type).toBeUndefined();
    });

    it('should validate notification type', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const invalidInput = {
        userId: user.id,
        organizationId: organization.id,
        type: 'INVALID_TYPE' as any,
        title: 'Test',
        message: 'Test',
      };

      const result = await createNotification(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should support all notification types', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const types = [
        NotificationType.INFO,
        NotificationType.SUCCESS,
        NotificationType.WARNING,
        NotificationType.ERROR,
      ];

      for (const type of types) {
        const result = await createNotification({
          userId: user.id,
          organizationId: organization.id,
          type,
          title: `${type} notification`,
          message: 'Test message',
        });

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe(type);
      }
    });
  });

  describe('markNotificationRead', () => {
    it('should mark notification as read', async () => {
      const { organization, user } = await createTestOrgWithUser();

      // Create notification
      const notification = await testPrisma.notifications.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'Test',
          message: 'Test',
          read: false,
        },
      });

      // Mock getCurrentUser
      (getCurrentUser as jest.Mock).mockResolvedValueOnce({
        ...user,
        organizationId: organization.id,
      });

      const result = await markNotificationRead({
        notificationId: notification.id,
      });

      expect(result.success).toBe(true);

      // Verify in database
      const updated = await testPrisma.notifications.findUnique({
        where: { id: notification.id },
      });
      expect(updated?.read).toBe(true);
    });

    it('should be idempotent (can mark read multiple times)', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const notification = await testPrisma.notifications.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'Test',
          message: 'Test',
          read: false,
        },
      });

      getCurrentUser.mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      // Mark as read twice
      const result1 = await markNotificationRead({
        notificationId: notification.id,
      });
      const result2 = await markNotificationRead({
        notificationId: notification.id,
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should reject unauthorized access', async () => {
      getCurrentUser.mockResolvedValueOnce(null);

      const result = await markNotificationRead({
        notificationId: 'some-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should reject marking other users notifications', async () => {
      const { organization, user } = await createTestOrgWithUser();
      const { user: otherUser } = await createTestOrgWithUser();

      // Create notification for user1
      const notification = await testPrisma.notifications.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'Test',
          message: 'Test',
          read: false,
        },
      });

      // Try to mark as user2
      getCurrentUser.mockResolvedValueOnce({
        ...otherUser,
        organizationId: organization.id,
      });

      const result = await markNotificationRead({
        notificationId: notification.id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Notification not found');
    });
  });

  describe('markAllNotificationsRead', () => {
    it('should mark all user notifications as read', async () => {
      const { organization, user } = await createTestOrgWithUser();

      // Create multiple unread notifications
      await testPrisma.notifications.createMany({
        data: [
          {
            id: `notif-${Date.now()}-1`,
            user_id: user.id,
            organization_id: organization.id,
            type: NotificationType.INFO,
            title: 'Notification 1',
            message: 'Message 1',
            read: false,
            updated_at: new Date(),
          },
          {
            id: `notif-${Date.now()}-2`,
            user_id: user.id,
            organization_id: organization.id,
            type: NotificationType.SUCCESS,
            title: 'Notification 2',
            message: 'Message 2',
            read: false,
            updated_at: new Date(),
          },
          {
            id: `notif-${Date.now()}-3`,
            user_id: user.id,
            organization_id: organization.id,
            type: NotificationType.WARNING,
            title: 'Notification 3',
            message: 'Message 3',
            read: false,
            updated_at: new Date(),
          },
        ],
      });

      getCurrentUser.mockResolvedValueOnce({
        ...user,
        organizationId: organization.id,
      });

      const result = await markAllNotificationsRead();

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(3);

      // Verify all marked as read
      const unreadCount = await testPrisma.notifications.count({
        where: {
          user_id: user.id,
          read: false,
        },
      });
      expect(unreadCount).toBe(0);
    });

    it('should only mark current user notifications', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      // Create notifications for both users
      await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-1`,
          user_id: user1.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'User 1 notification',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-2`,
          user_id: user2.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'User 2 notification',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      // Mark all for user1
      getCurrentUser.mockResolvedValueOnce({
        ...user1,
        organizationId: organization.id,
      });

      const result = await markAllNotificationsRead();

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(1);

      // User2's notification should still be unread
      const user2Unread = await testPrisma.notifications.count({
        where: {
          user_id: user2.id,
          read: false,
        },
      });
      expect(user2Unread).toBe(1);
    });
  });

  describe('bulkMarkNotificationsRead', () => {
    it('should mark multiple notifications as read', async () => {
      const { organization, user } = await createTestOrgWithUser();

      // Create notifications
      const n1 = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-n1`,
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'N1',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      const n2 = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-n2`,
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'N2',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      getCurrentUser.mockResolvedValueOnce({
        ...user,
        organizationId: organization.id,
      });

      const result = await bulkMarkNotificationsRead({
        notificationIds: [n1.id, n2.id],
      });

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(2);
    });

    it('should reject if not all notifications belong to user', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const n1 = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-n1-user1`,
          user_id: user1.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'N1',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      const n2 = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-n2-user2`,
          user_id: user2.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'N2',
          message: 'Message',
          read: false,
          updated_at: new Date(),
        },
      });

      getCurrentUser.mockResolvedValueOnce({
        ...user1,
        organizationId: organization.id,
      });

      const result = await bulkMarkNotificationsRead({
        notificationIds: [n1.id, n2.id], // n2 belongs to user2
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found or you do not have permission');
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const notification = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-delete`,
          user_id: user.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'Test',
          message: 'Test',
          read: false,
          updated_at: new Date(),
        },
      });

      getCurrentUser.mockResolvedValueOnce({
        ...user,
        organizationId: organization.id,
      });

      const result = await deleteNotification({
        notificationId: notification.id,
      });

      expect(result.success).toBe(true);

      // Verify deleted
      const deleted = await testPrisma.notifications.findUnique({
        where: { id: notification.id },
      });
      expect(deleted).toBeNull();
    });

    it('should reject deleting other users notifications', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const notification = await testPrisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-delete-reject`,
          user_id: user1.id,
          organization_id: organization.id,
          type: NotificationType.INFO,
          title: 'Test',
          message: 'Test',
          read: false,
          updated_at: new Date(),
        },
      });

      getCurrentUser.mockResolvedValueOnce({
        ...user2,
        organizationId: organization.id,
      });

      const result = await deleteNotification({
        notificationId: notification.id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Notification not found');

      // Verify not deleted
      const stillExists = await testPrisma.notifications.findUnique({
        where: { id: notification.id },
      });
      expect(stillExists).toBeDefined();
    });
  });
});
