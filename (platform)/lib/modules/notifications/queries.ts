import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';

/**
 * Notifications Module - Query Functions
 *
 * SECURITY: All queries automatically filtered by organizationId and userId via tenant middleware.
 * Notifications are user-scoped within organizations.
 */

/**
 * Get unread notifications for the current user
 *
 * @param userId - User ID
 * @param limit - Number of notifications to fetch (default: 10)
 * @returns Array of unread notifications
 */
export async function getUnreadNotifications(
  userId: string,
  limit: number = 10
) {
  return withTenantContext(async () => {
    try {
      return await prisma.notifications.findMany({
        where: {
          userId,
          read: false,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[Notifications] Error fetching unread:', error);
      throw new Error('Failed to fetch unread notifications');
    }
  });
}

/**
 * Get all notifications for the current user with pagination
 *
 * @param userId - User ID
 * @param options - Pagination and filter options
 * @returns Paginated notifications with metadata
 */
export async function getNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    readFilter?: 'all' | 'read' | 'unread';
  } = {}
) {
  const { limit = 25, offset = 0, readFilter = 'all' } = options;

  return withTenantContext(async () => {
    try {
      const where: any = {
        userId,
      };

      if (readFilter === 'read') {
        where.read = true;
      } else if (readFilter === 'unread') {
        where.read = false;
      }

      const [notifications, count] = await Promise.all([
        prisma.notifications.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.notifications.count({ where }),
      ]);

      return {
        notifications,
        count,
        hasMore: offset + notifications.length < count,
      };
    } catch (error) {
      console.error('[Notifications] Error fetching:', error);
      throw new Error('Failed to fetch notifications');
    }
  });
}

/**
 * Get unread notification count for the current user
 *
 * @param userId - User ID
 * @returns Number of unread notifications
 */
export async function getUnreadCount(userId: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.notifications.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      console.error('[Notifications] Error fetching unread count:', error);
      return 0;
    }
  });
}

/**
 * Get a single notification by ID for the current user
 *
 * @param notificationId - Notification ID
 * @param userId - User ID
 * @returns Notification or null
 */
export async function getNotificationById(
  notificationId: string,
  userId: string
) {
  return withTenantContext(async () => {
    try {
      return await prisma.notifications.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });
    } catch (error) {
      console.error('[Notifications] Error fetching notification:', error);
      return null;
    }
  });
}
