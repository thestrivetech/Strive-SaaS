import { z } from 'zod';
import { ContactType, ContactStatus, ActivityType } from '@prisma/client';

/**
 * Contact Creation Schema
 *
 * Validates all input when creating a new contact
 * Multi-tenant: organizationId required
 */
export const createContactSchema = z.object({
  // Required fields
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  // Contact info (optional but recommended)
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),

  // Contact classification
  type: z.nativeEnum(ContactType).default('PROSPECT'),
  status: z.nativeEnum(ContactStatus).default('ACTIVE'),

  // Social & preferred contact
  linkedin_url: z.union([
    z.string().url('Invalid LinkedIn URL'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  twitter_url: z.union([
    z.string().url('Invalid Twitter URL'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  preferred_contact_method: z.enum(['email', 'phone', 'text']).optional(),

  // Contact details
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.any()).optional(),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Contact Update Schema
 * All fields optional except ID
 */
export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Contact Filters Schema
 * For querying/filtering contacts
 */
export const contactFiltersSchema = z.object({
  // Type filters
  type: z.union([
    z.nativeEnum(ContactType),
    z.array(z.nativeEnum(ContactType))
  ]).optional(),

  // Status filters
  status: z.union([
    z.nativeEnum(ContactStatus),
    z.array(z.nativeEnum(ContactStatus))
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
  sort_by: z.enum(['created_at', 'updated_at', 'name', 'last_contact_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Communication Logging Schema
 * For tracking contact communications
 */
export const logCommunicationSchema = z.object({
  contact_id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  outcome: z.string().max(500).optional(),
  duration_minutes: z.number().int().positive().optional(),
});

/**
 * Contact Status Update Schema
 * For updating contact status
 */
export const updateContactStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ContactStatus),
  notes: z.string().max(1000).optional(), // Optional note about status change
});

/**
 * Bulk Contact Assignment Schema
 * For assigning multiple contacts to an agent
 */
export const bulkAssignContactsSchema = z.object({
  contact_ids: z.array(z.string().uuid()).min(1).max(100),
  assigned_to_id: z.string().uuid(),
});

/**
 * Contact Import Schema (CSV)
 * For validating imported contact data
 */
export const importContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  type: z.nativeEnum(ContactType).optional(),
  status: z.nativeEnum(ContactStatus).optional(),
  tags: z.string().optional(), // Comma-separated string
  notes: z.string().optional(),
});

// Export types
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactFilters = z.infer<typeof contactFiltersSchema>;
export type LogCommunicationInput = z.infer<typeof logCommunicationSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
export type BulkAssignContactsInput = z.infer<typeof bulkAssignContactsSchema>;
export type ImportContactInput = z.infer<typeof importContactSchema>;
