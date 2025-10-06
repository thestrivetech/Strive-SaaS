import { z } from 'zod';

/**
 * Expense Report Schemas
 *
 * Zod validation schemas for expense reporting
 *
 * Features:
 * - Report generation validation
 * - Date range validation
 * - Filter validation
 */

/**
 * Expense report creation schema
 */
export const ExpenseReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  reportType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM', 'TAX_SUMMARY']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  categories: z.array(z.string()).default([]),
  listings: z.array(z.string().uuid()).default([]),
  merchants: z.array(z.string()).default([]),
  organizationId: z.string().uuid(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
);

/**
 * Report filter schema (for queries)
 */
export const ReportFiltersSchema = z.object({
  reportType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM', 'TAX_SUMMARY']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Type exports
export type ExpenseReportInput = z.infer<typeof ExpenseReportSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
