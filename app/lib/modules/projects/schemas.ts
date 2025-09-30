import { z } from 'zod';
import { ProjectStatus, Priority } from '@prisma/client';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  customerId: z.string().optional(),
  projectManagerId: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(Priority),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  budget: z.number().positive().optional(),
  organizationId: z.string().min(1),
});

export const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  customerId: z.string().optional().nullable(),
  projectManagerId: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
});

export const projectFiltersSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  customerId: z.string().optional(),
  projectManagerId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().positive().max(100).optional(),
  offset: z.number().nonnegative().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;