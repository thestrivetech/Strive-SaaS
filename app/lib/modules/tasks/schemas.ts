import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  assignedToId: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema for updating an existing task
 */
export const updateTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Schema for filtering tasks
 */
export const taskFiltersSchema = z.object({
  projectId: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().positive().max(100).optional().default(50),
  offset: z.number().nonnegative().optional().default(0),
});

export type TaskFilters = z.infer<typeof taskFiltersSchema>;