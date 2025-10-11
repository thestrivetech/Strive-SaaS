/**
 * AI Hub Workflows Module - Public API
 *
 * Backend module for automation workflow management
 * Database table: automation_workflows (AI automation workflows)
 *
 * Multi-tenancy: ALL queries filtered by organizationId
 * RBAC: AI Hub access required (GROWTH tier minimum)
 */

// Export Server Actions
export {
  createWorkflow,
  updateWorkflow,
  executeWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus,
} from './actions';

// Export Data Queries
export {
  getWorkflows,
  getWorkflowById,
  getWorkflowStats,
} from './queries';

// Export Schemas and Types
export {
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowFiltersSchema,
  executeWorkflowSchema,
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
  type WorkflowFilters,
  type ExecuteWorkflowInput,
  type ExecutionLog,
} from './schemas';

// Export Utilities
export {
  topologicalSort,
  validateWorkflowDefinition,
} from './utils';

// Re-export Prisma types
export type { automation_workflows as Workflow } from '@prisma/client';
