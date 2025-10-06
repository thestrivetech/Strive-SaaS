import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

/**
 * Expense & Tax Schemas Module
 *
 * Zod validation schemas for expense tracking and tax management
 *
 * Features:
 * - Expense input validation
 * - Tax calculation schemas
 * - Expense filtering
 * - Multi-tenancy support
 */

/**
 * Expense creation schema
 */
export const ExpenseSchema = z.object({
  date: z.coerce.date(),
  merchant: z.string().min(1, 'Merchant is required').max(100),
  category: z.nativeEnum(ExpenseCategory),
  amount: z.number().positive('Amount must be positive'),
  listingId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isDeductible: z.boolean().default(true),
  taxCategory: z.string().optional(),
  organizationId: z.string().uuid(),
});

/**
 * Expense update schema
 */
export const UpdateExpenseSchema = ExpenseSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Expense filters schema
 */
export const ExpenseFiltersSchema = z.object({
  category: z.nativeEnum(ExpenseCategory).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  isDeductible: z.boolean().optional(),
  listingId: z.string().uuid().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

/**
 * Expense category schema
 */
export const ExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isDeductible: z.boolean().default(true),
  taxCode: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  organizationId: z.string().uuid().optional(), // Optional for system categories
});

/**
 * Tax estimate schema
 */
export const TaxEstimateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional(),
  totalIncome: z.number().nonnegative(),
  businessIncome: z.number().nonnegative(),
  otherIncome: z.number().nonnegative(),
  totalDeductions: z.number().nonnegative(),
  businessDeductions: z.number().nonnegative(),
  standardDeduction: z.number().nonnegative(),
  taxableIncome: z.number(),
  estimatedTax: z.number().nonnegative(),
  taxRate: z.number().min(0).max(1),
  paidAmount: z.number().nonnegative().default(0),
  dueDate: z.coerce.date().optional(),
  isPaid: z.boolean().default(false),
  organizationId: z.string().uuid(),
});

/**
 * Expense report schema
 */
export const ExpenseReportSchema = z.object({
  name: z.string().min(1).max(200),
  reportType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM', 'TAX_SUMMARY']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  categories: z.array(z.string()).default([]),
  listings: z.array(z.string()).default([]),
  merchants: z.array(z.string()).default([]),
  organizationId: z.string().uuid(),
});

// Type exports
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseFilters = z.infer<typeof ExpenseFiltersSchema>;
export type ExpenseCategoryInput = z.infer<typeof ExpenseCategorySchema>;
export type TaxEstimateInput = z.infer<typeof TaxEstimateSchema>;
export type ExpenseReportInput = z.infer<typeof ExpenseReportSchema>;
