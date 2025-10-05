/**
 * Listings Module
 *
 * Public API for managing real estate property listings in the CRM system
 *
 * Multi-tenant: All operations filtered by organization_id
 * RBAC: Permission checks enforced in actions
 */

// Server Actions (mutations)
export {
  createListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  bulkAssignListings,
  logPropertyActivity,
} from './actions';

// Queries (data fetching)
export {
  searchListings,
  getListingById,
  getListingWithFullHistory,
  getListingStats,
  getListingsCount,
  type ListingWithAssignee,
  type ListingWithRelations,
} from './queries';

// Schemas and types
export {
  createListingSchema,
  updateListingSchema,
  listingFiltersSchema,
  updateListingStatusSchema,
  bulkAssignListingsSchema,
  importListingSchema,
  logPropertyActivitySchema,
  type CreateListingInput,
  type UpdateListingInput,
  type ListingFilters,
  type UpdateListingStatusInput,
  type BulkAssignListingsInput,
  type ImportListingInput,
  type LogPropertyActivityInput,
} from './schemas';

// Re-export Prisma types for convenience
export type { listings } from '@prisma/client';
export { PropertyType, ListingStatus } from '@prisma/client';
