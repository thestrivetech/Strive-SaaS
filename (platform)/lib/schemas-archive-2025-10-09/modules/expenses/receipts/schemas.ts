import { z } from 'zod';

/**
 * Receipt Upload Schema
 *
 * Validates receipt file upload data
 */
export const ReceiptUploadSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z
    .string()
    .refine(
      (type) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];
        return allowedTypes.includes(type);
      },
      { message: 'Only images (JPEG, PNG, WEBP) and PDFs are allowed' }
    ),
  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

/**
 * TypeScript Types
 */
export type ReceiptUpload = z.infer<typeof ReceiptUploadSchema>;
