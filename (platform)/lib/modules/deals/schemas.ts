import { z } from 'zod';
import { DealStage, DealStatus } from '@prisma/client';

/**
 * Deals Module - Validation Schemas
 *
 * All input validation schemas for deals management
 * Uses Zod for runtime type safety and validation
 */

/**
 * Create Deal Schema
 * For creating a new deal in the CRM
 */
export const createDealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  value: z.number().positive('Deal value must be positive'),
  stage: z.nativeEnum(DealStage).default('LEAD'),
  status: z.nativeEnum(DealStatus).default('ACTIVE'),
  probability: z.number().int().min(0).max(100).default(50),
  expected_close_date: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.unknown()).optional(),
  // Associations
  lead_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid().optional(),
  // Multi-tenancy (set automatically)
  organization_id: z.string().uuid(),
});

/**
 * Update Deal Schema
 * For updating an existing deal
 */
export const updateDealSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  value: z.number().positive().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  status: z.nativeEnum(DealStatus).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expected_close_date: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.unknown()).optional(),
  lead_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid().optional(),
});

/**
 * Update Deal Stage Schema
 * For moving deals through the pipeline
 */
export const updateDealStageSchema = z.object({
  id: z.string().uuid(),
  stage: z.nativeEnum(DealStage),
  probability: z.number().int().min(0).max(100),
});

/**
 * Close Deal Schema
 * For marking deals as won or lost
 */
export const closeDealSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['WON', 'LOST']),
  actual_close_date: z.coerce.date(),
  lost_reason: z.string().max(500).optional(),
});

/**
 * Deal Filters Schema
 * For filtering and searching deals
 */
export const dealFiltersSchema = z.object({
  search: z.string().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  status: z.nativeEnum(DealStatus).optional(),
  assigned_to_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  min_value: z.number().positive().optional(),
  max_value: z.number().positive().optional(),
  expected_close_before: z.coerce.date().optional(),
  expected_close_after: z.coerce.date().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'value', 'expected_close_date', 'probability']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().positive().max(100).default(25),
  offset: z.number().int().nonnegative().default(0),
});

/**
 * Bulk Update Deals Schema
 * For batch operations on multiple deals
 */
export const bulkUpdateDealsSchema = z.object({
  deal_ids: z.array(z.string().uuid()).min(1, 'Must select at least one deal'),
  updates: z.object({
    stage: z.nativeEnum(DealStage).optional(),
    status: z.nativeEnum(DealStatus).optional(),
    assigned_to_id: z.string().uuid().optional(),
    probability: z.number().int().min(0).max(100).optional(),
  }),
});

/**
 * Delete Deal Schema
 */
export const deleteDealSchema = z.object({
  id: z.string().uuid(),
});

/**
 * TypeScript Types (inferred from schemas)
 */
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
export type CloseDealInput = z.infer<typeof closeDealSchema>;
export type DealFilters = z.infer<typeof dealFiltersSchema>;
export type BulkUpdateDealsInput = z.infer<typeof bulkUpdateDealsSchema>;
export type DeleteDealInput = z.infer<typeof deleteDealSchema>;
