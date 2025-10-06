import { z } from 'zod';

/**
 * Tax Estimate Schemas
 *
 * Zod validation schemas for tax estimation
 *
 * Features:
 * - Tax estimate input validation
 * - Update schema with partial fields
 * - Year and quarter validation
 */

/**
 * Tax estimate creation schema
 */
export const TaxEstimateSchema = z.object({
  year: z.number().int().min(2020).max(2050),
  quarter: z.number().int().min(1).max(4).optional(),

  // Income
  totalIncome: z.number().nonnegative(),
  businessIncome: z.number().nonnegative(),
  otherIncome: z.number().nonnegative(),

  // Deductions
  totalDeductions: z.number().nonnegative(),
  businessDeductions: z.number().nonnegative(),
  standardDeduction: z.number().nonnegative(),

  // Tax info
  taxRate: z.number().min(0).max(1), // 0-1 (0% to 100%)

  organizationId: z.string().uuid(),
});

/**
 * Tax estimate update schema
 */
export const UpdateTaxEstimateSchema = TaxEstimateSchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports
export type TaxEstimateInput = z.infer<typeof TaxEstimateSchema>;
export type UpdateTaxEstimateInput = z.infer<typeof UpdateTaxEstimateSchema>;
