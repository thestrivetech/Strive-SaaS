import { z } from 'zod';

/**
 * Receipt Upload Schemas
 *
 * Zod validation schemas for receipt file uploads
 *
 * Features:
 * - File type validation
 * - File size limits
 * - Multi-tenancy support
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Receipt upload schema
 */
export const ReceiptUploadSchema = z.object({
  expenseId: z.string().uuid(),
  file: z
    .custom<File>()
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      'File must be an image (JPEG, PNG, WEBP) or PDF'
    ),
});

// Type exports
export type ReceiptUploadInput = z.infer<typeof ReceiptUploadSchema>;
