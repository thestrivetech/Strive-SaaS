import { z } from 'zod';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/storage/validation';

/**
 * Document categories for transaction documents
 *
 * Used to organize and filter documents within a transaction loop.
 */
export const DOCUMENT_CATEGORIES = [
  'contract',
  'disclosure',
  'inspection',
  'appraisal',
  'title',
  'other',
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

/**
 * Zod schema for uploading a new document
 *
 * Validates metadata for document upload. The actual file is validated
 * separately using the file validation utilities.
 */
export const UploadDocumentSchema = z.object({
  loopId: z.string().uuid('Loop ID must be a valid UUID'),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;

/**
 * Zod schema for updating document metadata
 *
 * All fields are optional - only provided fields will be updated.
 */
export const UpdateDocumentSchema = z.object({
  filename: z.string().min(1, 'Filename cannot be empty').max(255, 'Filename must be 255 characters or less').optional(),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'REVIEWED', 'SIGNED', 'ARCHIVED']).optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
});

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;

/**
 * Zod schema for querying documents with filters
 */
export const QueryDocumentsSchema = z.object({
  loopId: z.string().uuid('Loop ID must be a valid UUID'),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'REVIEWED', 'SIGNED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
});

export type QueryDocumentsInput = z.infer<typeof QueryDocumentsSchema>;
