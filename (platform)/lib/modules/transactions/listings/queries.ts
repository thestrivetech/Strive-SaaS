'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import { listingFiltersSchema, type ListingFilters } from './schemas';
import type { listings, users, activities, deals } from '@prisma/client';

/**
 * Listing with assignee user data
 */
export type ListingWithAssignee = listings & {
  assigned_to?: Pick<users, 'id' | 'name' | 'email' | 'avatar_url'> | null;
};

/**
 * Listing with full relations for detail view
 */
export type ListingWithRelations = listings & {
  assigned_to?: Pick<users, 'id' | 'name' | 'email' | 'avatar_url'> | null;
  activities?: (activities & {
    created_by?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
  })[];
  deals?: (deals & {
    assigned_to?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
  })[];
};

/**
 * Advanced property search with filtering, sorting, and pagination
 *
 * @param filters - Search and filter criteria
 * @returns Listings array
 */
export async function searchListings(filters?: Partial<ListingFilters>): Promise<ListingWithAssignee[]> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  // Validate filters
  const validatedFilters = filters
    ? listingFiltersSchema.partial().parse(filters)
    : {};

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Build where clause
      const where: any = {
        organization_id: orgId,
      };

      // Location filters
      if (validatedFilters.city) {
        where.city = { contains: validatedFilters.city, mode: 'insensitive' };
      }
      if (validatedFilters.state) {
        where.state = { equals: validatedFilters.state, mode: 'insensitive' };
      }
      if (validatedFilters.zip_code) {
        where.zip_code = validatedFilters.zip_code;
      }

      // Property type filter
      if (validatedFilters.property_type) {
        where.property_type = Array.isArray(validatedFilters.property_type)
          ? { in: validatedFilters.property_type }
          : validatedFilters.property_type;
      }

      // Status filter
      if (validatedFilters.status) {
        where.status = Array.isArray(validatedFilters.status)
          ? { in: validatedFilters.status }
          : validatedFilters.status;
      }

      // Bedroom range
      if (validatedFilters.min_bedrooms || validatedFilters.max_bedrooms) {
        where.bedrooms = {};
        if (validatedFilters.min_bedrooms !== undefined) {
          where.bedrooms.gte = validatedFilters.min_bedrooms;
        }
        if (validatedFilters.max_bedrooms !== undefined) {
          where.bedrooms.lte = validatedFilters.max_bedrooms;
        }
      }

      // Bathroom range
      if (validatedFilters.min_bathrooms || validatedFilters.max_bathrooms) {
        where.bathrooms = {};
        if (validatedFilters.min_bathrooms !== undefined) {
          where.bathrooms.gte = validatedFilters.min_bathrooms;
        }
        if (validatedFilters.max_bathrooms !== undefined) {
          where.bathrooms.lte = validatedFilters.max_bathrooms;
        }
      }

      // Square feet range
      if (validatedFilters.min_sqft || validatedFilters.max_sqft) {
        where.square_feet = {};
        if (validatedFilters.min_sqft !== undefined) {
          where.square_feet.gte = validatedFilters.min_sqft;
        }
        if (validatedFilters.max_sqft !== undefined) {
          where.square_feet.lte = validatedFilters.max_sqft;
        }
      }

      // Price range
      if (validatedFilters.min_price || validatedFilters.max_price) {
        where.price = {};
        if (validatedFilters.min_price !== undefined) {
          where.price.gte = validatedFilters.min_price;
        }
        if (validatedFilters.max_price !== undefined) {
          where.price.lte = validatedFilters.max_price;
        }
      }

      // Assignment filter
      if (validatedFilters.assigned_to_id) {
        where.assigned_to_id = validatedFilters.assigned_to_id;
      }

      // Features filter (has all specified features)
      if (validatedFilters.features && validatedFilters.features.length > 0) {
        where.features = {
          hasEvery: validatedFilters.features,
        };
      }

      // Tags filter
      if (validatedFilters.tags && validatedFilters.tags.length > 0) {
        where.tags = {
          hasEvery: validatedFilters.tags,
        };
      }

      // Search across multiple fields
      if (validatedFilters.search) {
        where.OR = [
          { title: { contains: validatedFilters.search, mode: 'insensitive' } },
          { address: { contains: validatedFilters.search, mode: 'insensitive' } },
          { city: { contains: validatedFilters.search, mode: 'insensitive' } },
          { mls_number: { contains: validatedFilters.search, mode: 'insensitive' } },
        ];
      }

      // Date range filters
      if (validatedFilters.listed_from || validatedFilters.listed_to) {
        where.listing_date = {};
        if (validatedFilters.listed_from) {
          where.listing_date.gte = validatedFilters.listed_from;
        }
        if (validatedFilters.listed_to) {
          where.listing_date.lte = validatedFilters.listed_to;
        }
      }

      // Build orderBy
      const orderBy: any = {};
      if (validatedFilters.sort_by) {
        orderBy[validatedFilters.sort_by] = validatedFilters.sort_order || 'desc';
      } else {
        orderBy.created_at = validatedFilters.sort_order || 'desc';
      }

      const listings = await prisma.listings.findMany({
        where,
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
        orderBy,
        take: validatedFilters.limit || 50,
        skip: validatedFilters.offset || 0,
      });

      return listings;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Queries] searchListings failed:', dbError);
      throw new Error('Failed to search listings');
    }
  });
}

/**
 * Get single listing by ID
 *
 * @param id - Listing ID
 * @returns Listing with basic relations
 */
export async function getListingById(id: string): Promise<ListingWithAssignee | null> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const listing = await prisma.listings.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });

      return listing;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Queries] getListingById failed:', dbError);
      throw new Error('Failed to fetch listing');
    }
  });
}

/**
 * Get listing with full history (activities, deals)
 *
 * @param id - Listing ID
 * @returns Listing with all relations
 */
export async function getListingWithFullHistory(id: string): Promise<ListingWithRelations | null> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const listing = await prisma.listings.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          activities: {
            include: {
              created_by: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
            take: 50, // Limit activities to recent 50
          },
          deals: {
            include: {
              assigned_to: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
            },
            where: {
              status: {
                in: ['ACTIVE', 'WON'],
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      return listing;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Queries] getListingWithFullHistory failed:', dbError);
      throw new Error('Failed to fetch listing with history');
    }
  });
}

/**
 * Get listing statistics for dashboard
 *
 * @returns Listing stats
 */
export async function getListingStats() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const [
        totalListings,
        activeListings,
        soldListings,
        pendingListings,
        avgPriceResult,
        totalValueResult,
      ] = await Promise.all([
        // Total listings
        prisma.listings.count({
          where: {
            organization_id: orgId,
          },
        }),
        // Active listings
        prisma.listings.count({
          where: {
            organization_id: orgId,
            status: 'ACTIVE',
          },
        }),
        // Sold listings
        prisma.listings.count({
          where: {
            organization_id: orgId,
            status: 'SOLD',
          },
        }),
        // Pending listings
        prisma.listings.count({
          where: {
            organization_id: orgId,
            status: 'PENDING',
          },
        }),
        // Average price of active listings
        prisma.listings.aggregate({
          where: {
            organization_id: orgId,
            status: 'ACTIVE',
          },
          _avg: {
            price: true,
          },
        }),
        // Total value of active listings
        prisma.listings.aggregate({
          where: {
            organization_id: orgId,
            status: 'ACTIVE',
          },
          _sum: {
            price: true,
          },
        }),
      ]);

      return {
        totalListings,
        activeListings,
        soldListings,
        pendingListings,
        avgPrice: avgPriceResult._avg.price || 0,
        totalValue: totalValueResult._sum.price || 0,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Queries] getListingStats failed:', dbError);
      throw new Error('Failed to fetch listing statistics');
    }
  });
}

/**
 * Count total listings for pagination
 *
 * @param filters - Filter criteria
 * @returns Total count
 */
export async function getListingsCount(filters?: Partial<ListingFilters>): Promise<number> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  const validatedFilters = filters
    ? listingFiltersSchema.partial().parse(filters)
    : {};

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Build same where clause as searchListings
      const where: any = {
        organization_id: orgId,
      };

      if (validatedFilters.property_type) {
        where.property_type = Array.isArray(validatedFilters.property_type)
          ? { in: validatedFilters.property_type }
          : validatedFilters.property_type;
      }

      if (validatedFilters.status) {
        where.status = Array.isArray(validatedFilters.status)
          ? { in: validatedFilters.status }
          : validatedFilters.status;
      }

      if (validatedFilters.assigned_to_id) {
        where.assigned_to_id = validatedFilters.assigned_to_id;
      }

      if (validatedFilters.search) {
        where.OR = [
          { title: { contains: validatedFilters.search, mode: 'insensitive' } },
          { address: { contains: validatedFilters.search, mode: 'insensitive' } },
          { city: { contains: validatedFilters.search, mode: 'insensitive' } },
        ];
      }

      const count = await prisma.listings.count({ where });
      return count;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Queries] getListingsCount failed:', dbError);
      throw new Error('Failed to count listings');
    }
  });
}
