/**
 * Workflow schemas for transaction workflow management
 * Provides Zod validation schemas for workflow operations
 */

import { z } from 'zod';

/**
 * Workflow status enum
 */
export const WorkflowStatus = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED'
]);

/**
 * Workflow step schema
 */
export const WorkflowStepSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Step name is required'),
  description: z.string().optional(),
  order: z.number().int().min(0),
  dueOffset: z.number().int().optional(), // Days from workflow start
  assigneeRole: z.string().optional(),
  required: z.boolean().default(true),
  template: z.string().optional(),
});

/**
 * Workflow schema for creation/updates
 */
export const WorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  status: WorkflowStatus.default('DRAFT'),
  organizationId: z.string().uuid('Invalid organization ID'),
  industry: z.string().optional(),
  transactionType: z.string().optional(),
  steps: z.array(WorkflowStepSchema).min(1, 'At least one step required'),
  isTemplate: z.boolean().default(false),
});

/**
 * Workflow update schema
 */
export const UpdateWorkflowSchema = WorkflowSchema.partial().extend({
  id: z.string().uuid('Invalid workflow ID'),
});

/**
 * Workflow execution schema (applying workflow to a transaction)
 */
export const WorkflowExecutionSchema = z.object({
  workflowId: z.string().uuid('Invalid workflow ID'),
  loopId: z.string().uuid('Invalid loop ID'),
  startDate: z.date().optional(),
  assignees: z.record(z.string(), z.string().uuid()).optional(), // role -> userId mapping
});

/**
 * Workflow query parameters schema
 */
export const WorkflowQuerySchema = z.object({
  status: WorkflowStatus.optional(),
  industry: z.string().optional(),
  transactionType: z.string().optional(),
  isTemplate: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Type exports
 */
export type WorkflowInput = z.infer<typeof WorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>;
export type WorkflowStepInput = z.infer<typeof WorkflowStepSchema>;
export type WorkflowExecutionInput = z.infer<typeof WorkflowExecutionSchema>;
export type WorkflowQuery = z.infer<typeof WorkflowQuerySchema>;
export type WorkflowStatusType = z.infer<typeof WorkflowStatus>;
