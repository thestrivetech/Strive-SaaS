import { z } from 'zod';

/**
 * Schema for creating a notification
 */
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR'], {
    errorMap: () => ({ message: 'Type must be INFO, SUCCESS, WARNING, or ERROR' }),
  }),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be 500 characters or less'),
  actionUrl: z.string().url('Invalid URL').optional().nullable(),
  entityType: z.string().max(50).optional().nullable(),
  entityId: z.string().uuid().optional().nullable(),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

/**
 * Schema for marking a notification as read
 */
export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
});

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;

/**
 * Schema for bulk marking notifications as read
 */
export const BulkMarkReadSchema = z.object({
  notificationIds: z
    .array(z.string().uuid())
    .min(1, 'At least one notification ID required')
    .max(100, 'Maximum 100 notifications at once'),
});

export type BulkMarkReadInput = z.infer<typeof BulkMarkReadSchema>;

/**
 * Schema for deleting a notification
 */
export const DeleteNotificationSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
});

export type DeleteNotificationInput = z.infer<typeof DeleteNotificationSchema>;