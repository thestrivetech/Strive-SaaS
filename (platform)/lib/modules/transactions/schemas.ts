import { z } from 'zod';
import {
  TransactionType,
  LoopStatus,
} from '@prisma/client';

/**
 * Schema for creating a new transaction loop
 */
export const CreateLoopSchema = z.object({
  propertyAddress: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address too long'),
  transactionType: z.nativeEnum(TransactionType),
  listingPrice: z
    .number()
    .positive('Price must be positive')
    .max(1000000000, 'Price exceeds maximum'),
  expectedClosing: z.date().optional(),
  notes: z.string().max(5000).optional(),
});

/**
 * Schema for updating an existing transaction loop
 */
export const UpdateLoopSchema = z.object({
  propertyAddress: z.string().min(5).max(500).optional(),
  transactionType: z.nativeEnum(TransactionType).optional(),
  listingPrice: z.number().positive().optional(),
  status: z.nativeEnum(LoopStatus).optional(),
  expectedClosing: z.date().optional(),
  actualClosing: z.date().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
});

/**
 * Schema for querying/filtering transaction loops
 */
export const QueryLoopsSchema = z.object({
  status: z.nativeEnum(LoopStatus).optional(),
  transactionType: z.nativeEnum(TransactionType).optional(),
  search: z.string().optional(), // Search in address
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'expectedClosing', 'progress']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type inference exports
 */
export type CreateLoopInput = z.infer<typeof CreateLoopSchema>;
export type UpdateLoopInput = z.infer<typeof UpdateLoopSchema>;
export type QueryLoopsInput = z.infer<typeof QueryLoopsSchema>;
