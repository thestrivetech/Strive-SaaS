import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

/**
 * Schema for creating a new transaction task
 */
export const CreateTransactionTaskSchema = z.object({
  loopId: z.string().uuid('Invalid loop ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.nativeEnum(TaskPriority, {
    errorMap: () => ({ message: 'Invalid priority' }),
  }).optional().default('MEDIUM'),
  dueDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().uuid('Invalid party ID').optional().nullable(), // Party ID
});

export type CreateTransactionTaskInput = z.infer<typeof CreateTransactionTaskSchema>;

/**
 * Schema for updating an existing transaction task
 */
export const UpdateTransactionTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().uuid('Invalid party ID').optional().nullable(),
});

export type UpdateTransactionTaskInput = z.infer<typeof UpdateTransactionTaskSchema>;

/**
 * Schema for querying transaction tasks
 */
export const QueryTransactionTasksSchema = z.object({
  loopId: z.string().uuid('Invalid loop ID'),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedTo: z.string().uuid().optional(),
});

export type QueryTransactionTasksInput = z.infer<typeof QueryTransactionTasksSchema>;
