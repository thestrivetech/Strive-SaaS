import { z } from 'zod';
import { PropertyType, ListingStatus, ActivityType } from '@prisma/client';

/**
 * Listing Creation Schema
 *
 * Validates all input when creating a new listing
 * Multi-tenant: organization_id required
 */
export const createListingSchema = z.object({
  // Required fields
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),

  // Property address (required)
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  zip_code: z.string().min(5).max(10),
  country: z.string().default('USA'),

  // Property details
  description: z.string().max(5000).optional(),
  property_type: z.nativeEnum(PropertyType).default('RESIDENTIAL'),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  square_feet: z.number().int().positive().optional(),
  lot_size: z.number().positive().optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),

  // Pricing (required)
  price: z.number().positive({ message: 'Price must be greater than 0' }),
  price_per_sqft: z.number().positive().optional(),

  // Listing info
  status: z.nativeEnum(ListingStatus).default('ACTIVE'),
  mls_number: z.union([
    z.string().min(1),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  listing_date: z.coerce.date().optional(),
  expiration_date: z.coerce.date().optional(),

  // Media
  images: z.array(z.string().url()).default([]),
  virtual_tour_url: z.union([
    z.string().url('Invalid virtual tour URL'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),

  // Features & tags
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Listing Update Schema
 * All fields optional except ID
 */
export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Listing Filters Schema
 * For advanced property search and filtering
 */
export const listingFiltersSchema = z.object({
  // Location filters
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),

  // Property type filter
  property_type: z.union([
    z.nativeEnum(PropertyType),
    z.array(z.nativeEnum(PropertyType))
  ]).optional(),

  // Status filter
  status: z.union([
    z.nativeEnum(ListingStatus),
    z.array(z.nativeEnum(ListingStatus))
  ]).optional(),

  // Bedroom filters
  min_bedrooms: z.number().int().min(0).optional(),
  max_bedrooms: z.number().int().max(20).optional(),

  // Bathroom filters
  min_bathrooms: z.number().min(0).optional(),
  max_bathrooms: z.number().max(20).optional(),

  // Square feet filters
  min_sqft: z.number().int().positive().optional(),
  max_sqft: z.number().int().positive().optional(),

  // Price range filters
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),

  // Search query (address, title)
  search: z.string().optional(),

  // Features filter (has all specified features)
  features: z.array(z.string()).optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Date range filters
  listed_from: z.coerce.date().optional(),
  listed_to: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'price', 'square_feet', 'listing_date']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Listing Status Update Schema
 * For updating listing status
 */
export const updateListingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ListingStatus),
  sold_date: z.coerce.date().optional(), // For SOLD status
  notes: z.string().max(1000).optional(), // Optional note about status change
});

/**
 * Bulk Listing Assignment Schema
 * For assigning multiple listings to an agent
 */
export const bulkAssignListingsSchema = z.object({
  listing_ids: z.array(z.string().uuid()).min(1).max(100),
  assigned_to_id: z.string().uuid(),
});

/**
 * Listing Import Schema (CSV)
 * For validating imported listing data
 */
export const importListingSchema = z.object({
  title: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  property_type: z.nativeEnum(PropertyType).optional(),
  price: z.number().positive(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  square_feet: z.number().int().positive().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  mls_number: z.string().optional(),
  features: z.string().optional(), // Comma-separated string
  tags: z.string().optional(), // Comma-separated string
  notes: z.string().optional(),
});

/**
 * Log Property Activity Schema
 * For tracking showings, open houses, etc.
 */
export const logPropertyActivitySchema = z.object({
  listing_id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  outcome: z.string().max(500).optional(),
  duration_minutes: z.number().int().positive().optional(),
});

// Export types
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingFilters = z.infer<typeof listingFiltersSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
export type BulkAssignListingsInput = z.infer<typeof bulkAssignListingsSchema>;
export type ImportListingInput = z.infer<typeof importListingSchema>;
export type LogPropertyActivityInput = z.infer<typeof logPropertyActivitySchema>;
