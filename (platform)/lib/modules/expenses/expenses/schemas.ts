import { z } from 'zod';
import { ExpenseStatus } from '@prisma/client';

/**
 * Expense Schema - Create/Update Validation
 *
 * Validates expense data for creation and updates.
 * Ensures all required fields are present and valid.
 *
 * Note: organizationId and userId are NOT included here as they
 * are automatically added from the authenticated user session.
 */
export const ExpenseSchema = z.object({
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  merchant: z
    .string()
    .min(1, 'Merchant name is required')
    .max(255, 'Merchant name must be less than 255 characters')
    .trim(),
  categoryId: z
    .string({ required_error: 'Category is required' })
    .uuid('Invalid category ID'),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(9999999.99, 'Amount is too large'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
  listingId: z.string().uuid('Invalid listing ID').optional().nullable(),
  isDeductible: z.boolean().default(true),
  deductionPercent: z
    .number()
    .int()
    .min(0, 'Deduction percent must be at least 0')
    .max(100, 'Deduction percent must be at most 100')
    .default(100),
  // Optional mileage tracking fields
  mileageStart: z.string().max(500).optional().nullable(),
  mileageEnd: z.string().max(500).optional().nullable(),
  mileageDistance: z.number().positive().optional().nullable(),
  mileagePurpose: z.string().max(500).optional().nullable(),
});

/**
 * Expense Update Schema
 *
 * Same as create but with optional fields for partial updates
 */
export const ExpenseUpdateSchema = ExpenseSchema.partial().extend({
  id: z.string().uuid('Invalid expense ID'),
});

/**
 * Expense Filter Schema
 *
 * Validates query parameters for filtering expenses
 */
export const ExpenseFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  listingId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isDeductible: z.boolean().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  search: z.string().max(100).optional(), // Search merchant names
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  sortBy: z.enum(['date', 'amount', 'merchant', 'category_id']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * TypeScript Types
 */
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;
