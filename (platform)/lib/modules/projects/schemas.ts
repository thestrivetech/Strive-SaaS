/**
 * Project schemas for project management
 * Provides Zod validation schemas for project operations
 */

import { z } from 'zod';

/**
 * Project status enum
 */
export const ProjectStatus = z.enum([
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED'
]);

/**
 * Project priority enum
 */
export const ProjectPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

/**
 * Project schema for creation
 */
export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  status: ProjectStatus.default('PLANNING'),
  priority: ProjectPriority.default('MEDIUM'),
  organizationId: z.string().uuid('Invalid organization ID'),
  ownerId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Project update schema
 */
export const UpdateProjectSchema = ProjectSchema.partial().extend({
  id: z.string().uuid('Invalid project ID'),
});

/**
 * Project query parameters schema
 */
export const ProjectQuerySchema = z.object({
  status: ProjectStatus.optional(),
  priority: ProjectPriority.optional(),
  ownerId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['name', 'startDate', 'endDate', 'priority', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type exports
 */
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectQuery = z.infer<typeof ProjectQuerySchema>;
export type ProjectStatusType = z.infer<typeof ProjectStatus>;
export type ProjectPriorityType = z.infer<typeof ProjectPriority>;
