import { prisma } from '@/lib/database/prisma';

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(
  userId: string,
  organizationId: string,
  limit: number = 10
) {
  try {
    return await prisma.notification.findMany({
      where: {
        userId,
        organizationId,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw new Error('Failed to fetch unread notifications');
  }
}

/**
 * Get all notifications with pagination
 */
export async function getNotifications(
  userId: string,
  organizationId: string,
  options: {
    limit?: number;
    offset?: number;
    readFilter?: 'all' | 'read' | 'unread';
  } = {}
) {
  const { limit = 25, offset = 0, readFilter = 'all' } = options;

  try {
    const where: any = {
      userId,
      organizationId,
    };

    if (readFilter === 'read') {
      where.read = true;
    } else if (readFilter === 'unread') {
      where.read = false;
    }

    const [notifications, count] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      count,
      hasMore: offset + notifications.length < count,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string, organizationId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        organizationId,
        read: false,
      },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(notificationId: string, userId: string) {
  try {
    return await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return null;
  }
}