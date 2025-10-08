import { z } from 'zod';

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

export const UpdateTaxEstimateSchema = TaxEstimateSchema.partial().extend({
  id: z.string().uuid(),
});

export type TaxEstimateInput = z.infer<typeof TaxEstimateSchema>;
export type UpdateTaxEstimateInput = z.infer<typeof UpdateTaxEstimateSchema>;
