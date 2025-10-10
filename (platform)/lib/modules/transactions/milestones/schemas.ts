/**
 * Milestone schemas for transaction milestone management
 * Provides Zod validation schemas for milestone operations
 */

import { z } from 'zod';

/**
 * Milestone status enum
 */
export const MilestoneStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']);

/**
 * Milestone schema for creation/updates
 */
export const MilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  status: MilestoneStatus.default('PENDING'),
  loopId: z.string().uuid('Invalid loop ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  assigneeId: z.string().uuid().optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Milestone update schema (all fields optional except ID)
 */
export const UpdateMilestoneSchema = MilestoneSchema.partial().extend({
  id: z.string().uuid('Invalid milestone ID'),
});

/**
 * Milestone query parameters schema
 */
export const MilestoneQuerySchema = z.object({
  loopId: z.string().uuid().optional(),
  status: MilestoneStatus.optional(),
  assigneeId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Type exports
 */
export type MilestoneInput = z.infer<typeof MilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
export type MilestoneQuery = z.infer<typeof MilestoneQuerySchema>;
export type MilestoneStatusType = z.infer<typeof MilestoneStatus>;
