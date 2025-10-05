/**
 * Workflows Module
 *
 * Provides workflow template management and application functionality
 * for transaction loops.
 *
 * @module workflows
 */

// Actions
export {
  createWorkflowTemplate,
  applyWorkflowToLoop,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
} from './actions';

// Queries
export {
  getWorkflowTemplates,
  getWorkflowTemplateById,
  getWorkflowsByLoopId,
} from './queries';

// Schemas
export {
  WorkflowStepSchema,
  CreateWorkflowTemplateSchema,
  ApplyWorkflowSchema,
  UpdateWorkflowTemplateSchema,
  QueryWorkflowTemplatesSchema,
} from './schemas';

// Types
export type {
  WorkflowStep,
  CreateWorkflowTemplateInput,
  ApplyWorkflowInput,
  UpdateWorkflowTemplateInput,
  QueryWorkflowTemplatesInput,
} from './schemas';
