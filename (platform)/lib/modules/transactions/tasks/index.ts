/**
 * Transaction Tasks Module
 *
 * Public API for managing transaction loop tasks with:
 * - Task creation and assignment to parties
 * - Task completion workflow
 * - Email notifications for assignments
 * - RBAC enforcement
 * - Multi-tenancy via organization isolation
 * - Audit logging
 */

// Actions - Mutations
export {
  createTransactionTask,
  updateTransactionTask,
  completeTransactionTask,
  deleteTransactionTask,
} from './actions';

// Queries - Data fetching
export {
  getTasksByLoop,
  getTaskById,
  getTaskStats,
  type TaskWithDetails,
  type TaskDetail,
  type TaskStats,
} from './queries';

// Schemas & Types
export {
  CreateTransactionTaskSchema,
  UpdateTransactionTaskSchema,
  QueryTransactionTasksSchema,
  type CreateTransactionTaskInput,
  type UpdateTransactionTaskInput,
  type QueryTransactionTasksInput,
} from './schemas';
