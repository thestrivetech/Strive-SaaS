/**
 * Transaction Module - Client-Safe Actions Export
 *
 * SAFE FOR CLIENT COMPONENTS TO IMPORT
 *
 * This file ONLY exports Server Actions and types.
 * NO query functions, NO Prisma imports.
 *
 * Client components should import from this file:
 *   import { createLoop } from '@/lib/modules/transactions/actions'
 *
 * Server components can import from index.ts as usual.
 */

// ============================================================================
// CORE LOOP ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  createLoop,
  updateLoop,
  deleteLoop,
  updateLoopProgress,
} from './core/actions';

// ============================================================================
// TASK ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  createTransactionTask as createTask,
  updateTransactionTask as updateTask,
  deleteTransactionTask as deleteTask,
  completeTransactionTask as completeTask,
} from './tasks/actions';

// ============================================================================
// LISTING ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  createListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  bulkAssignListings,
  logPropertyActivity,
} from './listings/actions';

// ============================================================================
// PARTY ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  inviteParty as addParty,
  updateParty,
  removeParty,
} from './parties/actions';

// ============================================================================
// DOCUMENT ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  uploadDocument,
  createDocumentVersion,
  getDocumentDownloadUrl,
  updateDocument,
  deleteDocument,
} from './documents/actions';

// ============================================================================
// SIGNATURE ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  createSignatureRequest,
  signDocument,
  declineSignature,
} from './signatures/actions';

// ============================================================================
// WORKFLOW ACTIONS (Server Actions only - safe for client import)
// ============================================================================
export {
  createWorkflowTemplate as triggerWorkflow,
  applyWorkflowToLoop as updateWorkflowStatus,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
} from './workflows/actions';

// ============================================================================
// TYPES ONLY (Safe for client import - from @prisma/client)
// ============================================================================
export type {
  transaction_loops,
  transaction_tasks,
  transaction_audit_logs,
} from '@prisma/client';
