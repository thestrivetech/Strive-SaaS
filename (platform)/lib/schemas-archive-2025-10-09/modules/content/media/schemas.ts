/**
 * Media Library - Validation Schemas
 *
 * Zod schemas for media asset management, folder organization,
 * and file upload validation with comprehensive type safety.
 *
 * Session 3: Media Library - Upload & Management
 */

import { z } from 'zod';

// ============================================================================
// Media Asset Schema
// ============================================================================

export const MediaAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  originalName: z.string().min(1, 'Original name is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(50 * 1024 * 1024, 'File size exceeds 50MB limit'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  folderId: z.string().uuid().optional().nullable(),
  alt: z.string().max(255, 'Alt text too long').optional().nullable(),
  caption: z.string().max(500, 'Caption too long').optional().nullable(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type MediaAssetInput = z.infer<typeof MediaAssetSchema>;

// ============================================================================
// Media Folder Schema
// ============================================================================

export const MediaFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Folder name contains invalid characters'),
  parentId: z.string().uuid().optional().nullable(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type MediaFolderInput = z.infer<typeof MediaFolderSchema>;

// ============================================================================
// Media Filters Schema
// ============================================================================

export const MediaFiltersSchema = z.object({
  folderId: z.string().uuid().optional().nullable(),
  mimeType: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type MediaFilters = z.infer<typeof MediaFiltersSchema>;

// ============================================================================
// Supported File Types
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

// ============================================================================
// File Type Validation Helpers
// ============================================================================

export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

export function isAllowedVideoType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.includes(mimeType as any);
}

export function isAllowedDocumentType(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(mimeType as any);
}

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType as any);
}

// ============================================================================
// File Size Constants
// ============================================================================

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_WIDTH = 2000; // Max width before optimization
export const WEBP_QUALITY = 85; // WebP compression quality

// ============================================================================
// Update Schemas
// ============================================================================

export const UpdateMediaAssetSchema = z.object({
  id: z.string().uuid('Invalid asset ID'),
  name: z.string().min(1).max(255).optional(),
  alt: z.string().max(255).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  folderId: z.string().uuid().optional().nullable(),
});

export type UpdateMediaAssetInput = z.infer<typeof UpdateMediaAssetSchema>;
