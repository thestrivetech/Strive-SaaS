'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import { requireTransactionAccess, hasTransactionPermission, TRANSACTION_PERMISSIONS } from '../core/permissions';
type CreateListingInput = any;
type UpdateListingInput = any;
type UpdateListingStatusInput = any;
type BulkAssignListingsInput = any;
type LogPropertyActivityInput = any;

/**
 * Create a new listing
 *
 * RBAC: Requires CRM access + listing creation permission
 *
 * @param input - Listing data
 * @returns Created listing
 */
export async function createListing(input: CreateListingInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Check dual-role RBAC permissions
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.CREATE_LISTINGS)) {
    throw new Error('Forbidden: Cannot create listings');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      // Calculate price per sqft if not provided and square_feet exists
      if (!validated.price_per_sqft && validated.square_feet) {
        validated.price_per_sqft = validated.price / validated.square_feet;
      }

      const listing = await prisma.listings.create({
        data: {
          ...validated,
          organization_id: user.organization_members[0].organization_id,
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

      // Revalidate listings page
      revalidatePath('/crm/listings');
      revalidatePath('/crm/crm-dashboard');

      return listing;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] createListing failed:', dbError);
      throw new Error('Failed to create listing');
    }
  });
}

/**
 * Update an existing listing
 *
 * @param input - Updated listing data
 * @returns Updated listing
 */
export async function updateListing(input: UpdateListingInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Check dual-role RBAC permissions
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.UPDATE_LISTINGS)) {
    throw new Error('Forbidden: Cannot update listings');
  }

  const validated = input;
  const { id, ...updateData } = validated;

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify listing belongs to user's organization
      const existingListing = await prisma.listings.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
      });

      if (!existingListing) {
        throw new Error('Listing not found or access denied');
      }

      // Recalculate price per sqft if price or square_feet changed
      if ((updateData.price || updateData.square_feet) && !updateData.price_per_sqft) {
        const finalPrice = updateData.price || existingListing.price;
        const finalSqft = updateData.square_feet || existingListing.square_feet;
        if (finalSqft) {
          updateData.price_per_sqft = Number(finalPrice) / finalSqft;
        }
      }

      const listing = await prisma.listings.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
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

      // Revalidate pages
      revalidatePath('/crm/listings');
      revalidatePath(`/crm/listings/${id}`);
      revalidatePath('/crm/crm-dashboard');

      return listing;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] updateListing failed:', dbError);
      throw new Error('Failed to update listing');
    }
  });
}

/**
 * Delete a listing
 *
 * RBAC: Requires delete permission
 *
 * @param id - Listing ID
 * @returns Success status
 */
export async function deleteListing(id: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Check dual-role RBAC permissions
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.DELETE_LISTINGS)) {
    throw new Error('Forbidden: Cannot delete listings');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify listing belongs to user's organization
      const existingListing = await prisma.listings.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
      });

      if (!existingListing) {
        throw new Error('Listing not found or access denied');
      }

      await prisma.listings.delete({
        where: { id },
      });

      // Revalidate pages
      revalidatePath('/crm/listings');
      revalidatePath('/crm/crm-dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] deleteListing failed:', dbError);
      throw new Error('Failed to delete listing');
    }
  });
}

/**
 * Update listing status
 *
 * Creates an activity log for status changes
 *
 * @param input - Status update data
 * @returns Updated listing
 */
export async function updateListingStatus(input: UpdateListingStatusInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  const validated = input;

  // Check dual-role RBAC permissions (status changes that publish require PUBLISH permission)
  const requiredPermission = validated.status === 'ACTIVE'
    ? TRANSACTION_PERMISSIONS.PUBLISH_LISTINGS
    : TRANSACTION_PERMISSIONS.UPDATE_LISTINGS;

  if (!hasTransactionPermission(user, requiredPermission)) {
    throw new Error('Forbidden: Cannot update listing status');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify listing belongs to user's organization
      const existingListing = await prisma.listings.findFirst({
        where: {
          id: validated.id,
          organization_id: orgId,
        },
      });

      if (!existingListing) {
        throw new Error('Listing not found or access denied');
      }

      const updateData: any = {
        status: validated.status,
        updated_at: new Date(),
      };

      // If status is SOLD and sold_date provided, update expiration_date
      if (validated.status === 'SOLD' && validated.sold_date) {
        updateData.expiration_date = validated.sold_date;
      }

      const listing = await prisma.listings.update({
        where: { id: validated.id },
        data: updateData,
      });

      // Log status change as activity
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Listing status changed to ${validated.status}`,
          description: validated.notes || `Status updated from ${existingListing.status} to ${validated.status}`,
          listing_id: validated.id,
          organization_id: orgId,
          created_by_id: user.id,
          completed_at: new Date(),
        },
      });

      // Revalidate pages
      revalidatePath('/crm/listings');
      revalidatePath(`/crm/listings/${validated.id}`);

      return listing;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] updateListingStatus failed:', dbError);
      throw new Error('Failed to update listing status');
    }
  });
}

/**
 * Bulk assign listings to an agent
 *
 * @param input - Listing IDs and assignee ID
 * @returns Success status
 */
export async function bulkAssignListings(input: BulkAssignListingsInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check dual-role RBAC permissions
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.UPDATE_LISTINGS)) {
    throw new Error('Forbidden: Cannot assign listings');
  }

  const validated = input;

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Update all listings
      await prisma.listings.updateMany({
        where: {
          id: { in: validated.listing_ids },
          organization_id: orgId, // Security: ensure listings belong to org
        },
        data: {
          assigned_to_id: validated.assigned_to_id,
          updated_at: new Date(),
        },
      });

      // Revalidate pages
      revalidatePath('/crm/listings');

      return { success: true, count: validated.listing_ids.length };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] bulkAssignListings failed:', dbError);
      throw new Error('Failed to assign listings');
    }
  });
}

/**
 * Log a property activity (showing, open house, etc.)
 *
 * Creates an activity and updates last update timestamp
 *
 * @param input - Property activity data
 * @returns Created activity
 */
export async function logPropertyActivity(input: LogPropertyActivityInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check dual-role RBAC permissions
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.VIEW_LISTINGS)) {
    throw new Error('Forbidden: Cannot log property activities');
  }

  const validated = input;

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify listing belongs to user's organization
      const listing = await prisma.listings.findFirst({
        where: {
          id: validated.listing_id,
          organization_id: orgId,
        },
      });

      if (!listing) {
        throw new Error('Listing not found or access denied');
      }

      // Create activity
      const activity = await prisma.activities.create({
        data: {
          type: validated.type,
          title: validated.title,
          description: validated.description,
          outcome: validated.outcome,
          duration_minutes: validated.duration_minutes,
          listing_id: validated.listing_id,
          organization_id: orgId,
          created_by_id: user.id,
          completed_at: new Date(), // Mark as completed immediately
        },
        include: {
          created_by: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      });

      // Update listing updated_at timestamp
      await prisma.listings.update({
        where: { id: validated.listing_id },
        data: {
          updated_at: new Date(),
        },
      });

      // Revalidate pages
      revalidatePath(`/crm/listings/${validated.listing_id}`);
      revalidatePath('/crm/listings');

      return activity;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Listings Actions] logPropertyActivity failed:', dbError);
      throw new Error('Failed to log property activity');
    }
  });
}
