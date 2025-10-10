import { z } from 'zod';

/**
 * Schema for uploading an attachment
 */
export const uploadAttachmentSchema = z.object({
  entityType: z.enum(['task', 'project', 'customer']),
  entityId: z.string().uuid('Invalid entity ID'),
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  fileSize: z.number().positive('File size must be positive').max(10 * 1024 * 1024, 'File size exceeds 10MB'),
  mimeType: z.string().min(1, 'MIME type is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;

/**
 * Schema for deleting an attachment
 */
export const deleteAttachmentSchema = z.object({
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;

/**
 * Schema for getting attachments by entity
 */
export const getAttachmentsSchema = z.object({
  entityType: z.enum(['task', 'project', 'customer']),
  entityId: z.string().uuid('Invalid entity ID'),
});

export type GetAttachmentsInput = z.infer<typeof getAttachmentsSchema>;
