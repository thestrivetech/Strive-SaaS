import { z } from 'zod';
import { PartyRole } from '@prisma/client';

/**
 * Schema for a single workflow step
 */
export const WorkflowStepSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  order: z.number().int().min(0, 'Order must be non-negative'),
  estimatedDays: z.number().int().min(0).max(365).optional(),
  dependencies: z.array(z.string()).default([]), // Step IDs that must complete first
  autoAssignRole: z.nativeEnum(PartyRole, {
    errorMap: () => ({ message: 'Invalid party role' }),
  }).optional(),
  requiresDocument: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

/**
 * Schema for creating a new workflow template
 */
export const CreateWorkflowTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  transactionType: z.enum([
    'PURCHASE_AGREEMENT',
    'LISTING_AGREEMENT',
    'LEASE_AGREEMENT',
    'ALL'
  ], {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }),
  steps: z.array(WorkflowStepSchema).min(1, 'At least one step is required'),
});

export type CreateWorkflowTemplateInput = z.infer<typeof CreateWorkflowTemplateSchema>;

/**
 * Schema for applying a workflow template to a loop
 */
export const ApplyWorkflowSchema = z.object({
  loopId: z.string().uuid('Invalid loop ID'),
  templateId: z.string().uuid('Invalid template ID'),
  customizations: z.record(z.any()).optional(),
});

export type ApplyWorkflowInput = z.infer<typeof ApplyWorkflowSchema>;

/**
 * Schema for updating a workflow template
 */
export const UpdateWorkflowTemplateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  steps: z.array(WorkflowStepSchema).min(1).optional(),
});

export type UpdateWorkflowTemplateInput = z.infer<typeof UpdateWorkflowTemplateSchema>;

/**
 * Schema for querying workflow templates
 */
export const QueryWorkflowTemplatesSchema = z.object({
  transactionType: z.enum([
    'PURCHASE_AGREEMENT',
    'LISTING_AGREEMENT',
    'LEASE_AGREEMENT',
    'ALL'
  ]).optional(),
  isTemplate: z.boolean().default(true),
});

export type QueryWorkflowTemplatesInput = z.infer<typeof QueryWorkflowTemplatesSchema>;
