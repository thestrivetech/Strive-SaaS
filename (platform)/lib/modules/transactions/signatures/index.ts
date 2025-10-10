/**
 * Signatures Module - Public API
 *
 * Provides e-signature request and verification functionality for transaction documents.
 *
 * Features:
 * - Create signature requests (sequential/parallel)
 * - Sign documents with audit trail
 * - Decline signature requests
 * - Query signature status
 * - Email notifications to signers
 *
 * @module signatures
 */

// Actions
export {
  createSignatureRequest,
  signDocument,
  declineSignature,
} from './actions';

// Queries
export {
  getSignatureRequest,
  getSignatureRequestsByLoop,
  getPendingSignatures,
  getSignatureById,
  getSignatureStats,
} from './queries';

// Re-export Prisma types for convenience
export type {
  signature_requests as SignatureRequest,
  document_signatures as DocumentSignature,
  SignatureStatus,
  SigningOrder,
} from '@prisma/client';
