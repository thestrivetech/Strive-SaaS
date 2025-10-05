/**
 * Transaction Management Module
 *
 * Public API for managing transaction loops with:
 * - CRUD operations via Server Actions
 * - RBAC permission enforcement
 * - Multi-tenancy via organization isolation
 * - Input validation with Zod
 * - Audit logging
 */

// Queries - Data fetching
export {
  getLoops,
  getLoopById,
  getLoopStats,
} from './queries';

// Actions - Mutations
export {
  createLoop,
  updateLoop,
  deleteLoop,
  updateLoopProgress,
} from './actions';

// Schemas & Types
export {
  CreateLoopSchema,
  UpdateLoopSchema,
  QueryLoopsSchema,
  type CreateLoopInput,
  type UpdateLoopInput,
  type QueryLoopsInput,
} from './schemas';

// Permissions
export {
  TRANSACTION_PERMISSIONS,
  hasTransactionPermission,
  canModifyLoop,
  type TransactionPermission,
} from './permissions';
