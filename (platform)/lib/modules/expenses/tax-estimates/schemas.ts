import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

/**
 * Tax Estimate Schema - Create Validation
 *
 * Validates tax estimate data for creation.
 * Ensures all required fields are present and valid.
 *
 * Note: organizationId and userId are NOT included here as they
 * are automatically added from the authenticated user session.
 */
export const TaxEstimateSchema = z.object({
  tax_year: z
    .number()
    .int('Tax year must be an integer')
    .min(2000, 'Tax year must be 2000 or later')
    .max(2100, 'Tax year must be 2100 or earlier'),
  quarter: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .nullable(),
  period_start: z.date({
    required_error: 'Period start date is required',
  }),
  period_end: z.date({
    required_error: 'Period end date is required',
  }),
  total_income: z.number().nonnegative().default(0),
  total_expenses: z.number().nonnegative().default(0),
  total_deductions: z.number().nonnegative().default(0),
  net_income: z.number().default(0),
  estimated_tax_rate: z.number().min(0).max(100).default(0),
  federal_tax_estimated: z.number().nonnegative().default(0),
  state_tax_estimated: z.number().nonnegative().default(0),
  self_employment_tax: z.number().nonnegative().default(0),
  total_tax_estimated: z.number().nonnegative().default(0),
  amount_paid: z.number().nonnegative().default(0),
  payment_due_date: z.date().optional().nullable(),
  payment_status: z.nativeEnum(PaymentStatus).default('PENDING'),
  quickbooks_id: z.string().optional().nullable(),
  quickbooks_synced: z.date().optional().nullable(),
  calculation_method: z.string().max(50).default('STANDARD'),
  assumptions: z.any().optional().nullable(), // JSON field
});

/**
 * Tax Estimate Update Schema
 *
 * Same as create but with optional fields for partial updates
 */
export const TaxEstimateUpdateSchema = TaxEstimateSchema.partial().extend({
  id: z.string().uuid('Invalid tax estimate ID'),
});

/**
 * Simplified Tax Estimate Input (for most use cases)
 *
 * Minimal fields needed to create a tax estimate
 */
export const SimpleTaxEstimateSchema = z.object({
  year: z
    .number()
    .int()
    .min(2000)
    .max(2100),
  quarter: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .nullable(),
  totalIncome: z.number().optional(),
  businessIncome: z.number().optional(),
  otherIncome: z.number().optional(),
  totalDeductions: z.number().optional(),
  businessDeductions: z.number().optional(),
  standardDeduction: z.number().optional(),
  taxableIncome: z.number().optional(),
  estimatedTax: z.number().optional(),
  taxRate: z.number().optional(),
});

/**
 * Update Tax Estimate Input (simplified)
 */
export const UpdateSimpleTaxEstimateSchema = z.object({
  id: z.string().uuid(),
  year: z.number().int().min(2000).max(2100).optional(),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  totalIncome: z.number().optional(),
  businessIncome: z.number().optional(),
  otherIncome: z.number().optional(),
  totalDeductions: z.number().optional(),
  businessDeductions: z.number().optional(),
  standardDeduction: z.number().optional(),
  taxRate: z.number().optional(),
});

/**
 * TypeScript Types
 */
export type TaxEstimateInput = z.infer<typeof TaxEstimateSchema>;
export type TaxEstimateUpdate = z.infer<typeof TaxEstimateUpdateSchema>;
export type SimpleTaxEstimateInput = z.infer<typeof SimpleTaxEstimateSchema>;
export type UpdateTaxEstimateInput = z.infer<typeof UpdateSimpleTaxEstimateSchema>;
