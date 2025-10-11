import { z } from 'zod';
import { TaxReportType, TaxReportStatus } from '@prisma/client';

/**
 * Tax Report Schema - Create Validation
 *
 * Validates tax report data for creation.
 * Ensures all required fields are present and valid.
 *
 * Note: organizationId and userId are NOT included here as they
 * are automatically added from the authenticated user session.
 */
export const TaxReportSchema = z.object({
  name: z
    .string()
    .min(1, 'Report name is required')
    .max(255, 'Report name must be less than 255 characters')
    .trim(),
  template_type: z.nativeEnum(TaxReportType, {
    required_error: 'Report type is required',
  }),
  tax_year: z
    .number()
    .int('Tax year must be an integer')
    .min(2000, 'Tax year must be 2000 or later')
    .max(2100, 'Tax year must be 2100 or earlier'),
  period_start: z.date().optional().nullable(),
  period_end: z.date().optional().nullable(),
  status: z.nativeEnum(TaxReportStatus).default('GENERATING'),
  file_url: z.string().url().optional().nullable(),
  file_format: z.string().max(10).optional().nullable(),
  file_size_bytes: z.bigint().optional().nullable(),
  total_income: z.number().optional().nullable(),
  total_expenses: z.number().optional().nullable(),
  total_deductions: z.number().optional().nullable(),
  categories_count: z.number().int().optional().nullable(),
  expenses_count: z.number().int().optional().nullable(),
  is_shared: z.boolean().default(false),
  shared_with: z.any().optional().nullable(), // JSON field
  share_expires_at: z.date().optional().nullable(),
  quickbooks_id: z.string().optional().nullable(),
  quickbooks_synced: z.date().optional().nullable(),
  generated_at: z.date().optional().nullable(),
  generation_time_ms: z.number().int().optional().nullable(),
  template_version: z.string().max(10).default('1.0'),
});

/**
 * Tax Report Update Schema
 *
 * Same as create but with optional fields for partial updates
 */
export const TaxReportUpdateSchema = TaxReportSchema.partial().extend({
  id: z.string().uuid('Invalid report ID'),
});

/**
 * Simplified Tax Report Input (for most use cases)
 *
 * Minimal fields needed to create a tax report
 */
export const SimpleTaxReportSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  reportType: z.nativeEnum(TaxReportType),
  startDate: z.date(),
  endDate: z.date(),
  categories: z.array(z.string()).default([]),
  listings: z.array(z.string()).default([]),
  merchants: z.array(z.string()).default([]),
});

/**
 * TypeScript Types
 */
export type TaxReportInput = z.infer<typeof TaxReportSchema>;
export type TaxReportUpdate = z.infer<typeof TaxReportUpdateSchema>;
export type SimpleTaxReportInput = z.infer<typeof SimpleTaxReportSchema>;
