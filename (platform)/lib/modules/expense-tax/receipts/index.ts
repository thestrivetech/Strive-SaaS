/**
 * Receipt Upload Module - Public API
 *
 * Receipt file management with Supabase Storage integration
 *
 * Features:
 * - Receipt file upload to Supabase Storage
 * - Receipt deletion with cleanup
 * - Multi-tenant file organization
 * - File validation (type, size)
 * - OCR placeholder (future enhancement)
 *
 * SECURITY:
 * - All operations require authentication
 * - Multi-tenancy enforced via organizationId
 * - Files organized by org-id/expense-id
 * - Input validation with Zod schemas
 */

// Actions
export { uploadReceipt, deleteReceipt, getReceiptById } from './actions';

// Storage helpers
export {
  uploadReceiptToStorage,
  deleteReceiptFromStorage,
  getReceiptUrl,
} from './storage';

// Schemas
export { ReceiptUploadSchema } from './schemas';

// Types
export type { ReceiptUploadInput } from './schemas';

// Prisma types
export type { receipts } from '@prisma/client';
