import { z } from 'zod';
import { LeadSource, LeadStatus, LeadScore } from '@prisma/client';

/**
 * Lead Creation Schema
 *
 * Validates all input when creating a new lead
 * Multi-tenant: organizationId required
 */
export const createLeadSchema = z.object({
  // Required fields
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  // Contact info (optional but recommended)
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),

  // Lead classification
  source: z.nativeEnum(LeadSource).default('WEBSITE'),
  status: z.nativeEnum(LeadStatus).default('NEW_LEAD'),
  score: z.nativeEnum(LeadScore).default('COLD'),
  score_value: z.number().int().min(0).max(100).default(0),

  // Lead details
  budget: z.number().positive().optional(),
  timeline: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.any()).optional(),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Lead Update Schema
 * All fields optional except ID
 */
export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Lead Filters Schema
 * For querying/filtering leads
 */
export const leadFiltersSchema = z.object({
  // Status filters
  status: z.union([
    z.nativeEnum(LeadStatus),
    z.array(z.nativeEnum(LeadStatus))
  ]).optional(),

  // Source filters
  source: z.union([
    z.nativeEnum(LeadSource),
    z.array(z.nativeEnum(LeadSource))
  ]).optional(),

  // Score filters
  score: z.union([
    z.nativeEnum(LeadScore),
    z.array(z.nativeEnum(LeadScore))
  ]).optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Date range filters
  created_from: z.coerce.date().optional(),
  created_to: z.coerce.date().optional(),
  last_contact_from: z.coerce.date().optional(),
  last_contact_to: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'name', 'score_value', 'last_contact_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Lead Score Update Schema
 * For updating lead score
 */
export const updateLeadScoreSchema = z.object({
  id: z.string().uuid(),
  score: z.nativeEnum(LeadScore),
  score_value: z.number().int().min(0).max(100),
});

/**
 * Lead Status Update Schema
 * For pipeline stage changes
 */
export const updateLeadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(LeadStatus),
  notes: z.string().max(1000).optional(), // Optional note about status change
});

/**
 * Bulk Lead Assignment Schema
 * For assigning multiple leads to an agent
 */
export const bulkAssignLeadsSchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1).max(100),
  assigned_to_id: z.string().uuid(),
});

// Export types
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
export type UpdateLeadScoreInput = z.infer<typeof updateLeadScoreSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type BulkAssignLeadsInput = z.infer<typeof bulkAssignLeadsSchema>;
