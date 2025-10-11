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
