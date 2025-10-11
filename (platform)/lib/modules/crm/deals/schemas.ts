import { z } from 'zod';
import { DealStage, DealStatus } from '@prisma/client';

/**
 * Deal Creation Schema
 *
 * Validates all input when creating a new deal
 * Multi-tenant: organizationId required
 */
export const createDealSchema = z.object({
  // Required fields
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  value: z.number().positive('Deal value must be positive'),

  // Deal classification
  stage: z.nativeEnum(DealStage).default('LEAD'),
  status: z.nativeEnum(DealStatus).default('ACTIVE'),
  probability: z.number().int().min(0).max(100).default(50),

  // Deal details
  description: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.any()).optional(),

  // Dates
  expected_close_date: z.coerce.date().optional(),
  actual_close_date: z.coerce.date().optional(),

  // Loss reason (for LOST deals)
  lost_reason: z.string().max(500).optional(),

  // Relations
  lead_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Deal Update Schema
 * All fields optional except ID
 */
export const updateDealSchema = createDealSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Deal Filters Schema
 * For querying/filtering deals
 */
export const dealFiltersSchema = z.object({
  // Stage filters
  stage: z.nativeEnum(DealStage).optional(),

  // Status filters
  status: z.nativeEnum(DealStatus).optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),

  // Entity filters
  contact_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Value range filters
  min_value: z.number().positive().optional(),
  max_value: z.number().positive().optional(),

  // Date range filters
  expected_close_before: z.coerce.date().optional(),
  expected_close_after: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(25),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'value', 'expected_close_date']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Deal Stage Update Schema
 * For pipeline stage changes
 */
export const updateDealStageSchema = z.object({
  id: z.string().uuid(),
  stage: z.nativeEnum(DealStage),
  probability: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(), // Optional note about stage change
});

/**
 * Deal Status Update Schema
 * For marking deals as won/lost
 */
export const updateDealStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(DealStatus),
  actual_close_date: z.coerce.date().optional(),
  lost_reason: z.string().max(500).optional(), // Required if status is LOST
  notes: z.string().max(1000).optional(),
});

/**
 * Bulk Deal Assignment Schema
 * For assigning multiple deals to an agent
 */
export const bulkAssignDealsSchema = z.object({
  deal_ids: z.array(z.string().uuid()).min(1).max(100),
  assigned_to_id: z.string().uuid(),
});

// Export types
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealFilters = z.infer<typeof dealFiltersSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
export type UpdateDealStatusInput = z.infer<typeof updateDealStatusSchema>;
export type BulkAssignDealsInput = z.infer<typeof bulkAssignDealsSchema>;
