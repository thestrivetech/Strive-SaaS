'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import {
  CreateNotificationSchema,
  MarkNotificationReadSchema,
  BulkMarkReadSchema,
  DeleteNotificationSchema,
  type CreateNotificationInput,
} from './schemas';
import { revalidatePath } from 'next/cache';

/**
 * Create a notification (internal use)
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const validated = CreateNotificationSchema.parse(input);

    const notification = await prisma.notification.create({
      data: {
        userId: validated.userId,
        organizationId: validated.organizationId,
        type: validated.type,
        title: validated.title,
        message: validated.message,
        actionUrl: validated.actionUrl,
        entityType: validated.entityType,
        entityId: validated.entityId,
        read: false,
      },
    });

    revalidatePath('/');

    return { success: true, data: notification };
  } catch (error) {
    console.error('Create notification error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create notification' };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const validated = MarkNotificationReadSchema.parse(input);

    // Verify ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id: validated.notificationId,
        userId: user.id,
        organizationId,
      },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found' };
    }

    await prisma.notification.update({
      where: { id: validated.notificationId },
      data: { read: true },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Mark notification read error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to mark notification as read' };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        organizationId,
        read: false,
      },
      data: { read: true },
    });

    revalidatePath('/');

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Mark all notifications read error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

/**
 * Bulk mark notifications as read
 */
export async function bulkMarkNotificationsRead(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const validated = BulkMarkReadSchema.parse(input);

    // Verify ownership of all notifications
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: validated.notificationIds },
        userId: user.id,
        organizationId,
      },
      select: { id: true },
    });

    if (notifications.length !== validated.notificationIds.length) {
      return {
        success: false,
        error: 'Some notifications not found or you do not have permission',
      };
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: validated.notificationIds },
      },
      data: { read: true },
    });

    revalidatePath('/');

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Bulk mark notifications read error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to mark notifications as read' };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const validated = DeleteNotificationSchema.parse(input);

    // Verify ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id: validated.notificationId,
        userId: user.id,
        organizationId,
      },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found' };
    }

    await prisma.notification.delete({
      where: { id: validated.notificationId },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to delete notification' };
  }
}