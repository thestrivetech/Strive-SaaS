/**
 * Document Management Module
 *
 * This module provides secure document upload, versioning, and retrieval
 * for transaction loops with organization isolation and encryption.
 *
 * @module lib/modules/documents
 */

// Server Actions (mutations)
export {
  uploadDocument,
  createDocumentVersion,
  getDocumentDownloadUrl,
  updateDocument,
  deleteDocument,
} from './actions';

// Queries (data fetching)
export {
  getDocumentsByLoop,
  getDocumentById,
  getDocumentVersions,
  getDocumentStats,
} from './queries';

// Re-export Prisma types for convenience
export type { documents as Document, document_versions as DocumentVersion } from '@prisma/client';
