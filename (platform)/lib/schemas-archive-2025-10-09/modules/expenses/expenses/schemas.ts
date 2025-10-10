import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

/**
 * Expense Schema - Create/Update Validation
 *
 * Validates expense data for creation and updates.
 * Ensures all required fields are present and valid.
 */
export const ExpenseSchema = z.object({
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  merchant: z
    .string()
    .min(1, 'Merchant name is required')
    .max(100, 'Merchant name must be less than 100 characters')
    .trim(),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(999999.99, 'Amount is too large'),
  listingId: z.string().uuid('Invalid listing ID').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
  isDeductible: z.boolean().default(true),
  taxCategory: z.string().max(50).optional().nullable(),
  organizationId: z.string().uuid('Invalid organization ID'),
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
  category: z.nativeEnum(ExpenseCategory).optional(),
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
  sortBy: z.enum(['date', 'amount', 'merchant', 'category']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * TypeScript Types
 */
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;
