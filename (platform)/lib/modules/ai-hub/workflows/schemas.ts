import { z } from 'zod';
import { ExecutionStatus } from '@prisma/client';

/**
 * Workflow Creation Schema
 * Validates all input when creating a new automation workflow
 */
export const createWorkflowSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(1000).optional(),

  // React Flow definitions
  nodes: z.any(), // React Flow nodes array
  edges: z.any(), // React Flow edges array
  variables: z.record(z.string(), z.any()).optional(),

  // Configuration
  isActive: z.boolean().default(true),
  version: z.string().default('1.0.0'),
  tags: z.array(z.string()).default([]),

  // Template source
  templateId: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organizationId: z.string().uuid(),
});

/**
 * Workflow Update Schema
 */
export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Workflow Filters Schema
 */
export const workflowFiltersSchema = z.object({
  // Status filters
  isActive: z.boolean().optional(),

  // Tag filtering
  tags: z.array(z.string()).optional(),

  // Template filter
  templateId: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Date range filters
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'execution_count']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Workflow Execution Input Schema
 */
export const executeWorkflowSchema = z.object({
  workflowId: z.string().uuid(),
  input: z.record(z.string(), z.any()).optional(),
});

/**
 * Execution Log Schema
 */
export const executionLogSchema = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  status: z.nativeEnum(ExecutionStatus),
  timestamp: z.date(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Export types
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type WorkflowFilters = z.infer<typeof workflowFiltersSchema>;
export type ExecuteWorkflowInput = z.infer<typeof executeWorkflowSchema>;
export type ExecutionLog = z.infer<typeof executionLogSchema>;
