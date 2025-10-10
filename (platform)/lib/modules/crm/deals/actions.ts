'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageDeals, canDeleteDeals } from '@/lib/auth/rbac';
import { hasOrgPermission } from '@/lib/auth/org-rbac';
import { canAccessFeature } from '@/lib/auth/subscription';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
type CreateDealInput = any;
type UpdateDealInput = any;
type UpdateDealStageInput = any;
type CloseDealInput = any;
type BulkUpdateDealsInput = any;
type DeleteDealInput = any;

/**
 * Create a new deal
 *
 * RBAC: Requires CRM access + deal management permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Deal data
 * @returns Created deal
 */
export async function createDeal(input: CreateDealInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to create deals');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to create deals');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      const deal = await prisma.deals.create({
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

      // Create activity for deal creation
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: 'Deal created',
          description: `Created deal "${deal.title}" with value $${deal.value}`,
          deal_id: deal.id,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate deals pages
      revalidatePath('/crm/deals');
      revalidatePath('/crm/crm-dashboard');

      return deal;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] createDeal failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to create deal: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update an existing deal
 *
 * RBAC: Requires CRM access + deal management permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Deal update data
 * @returns Updated deal
 */
export async function updateDeal(input: UpdateDealInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update deals');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update deals');
  }

  // Validate input
  const validated = input;
  const { id, ...updates} = validated;

  return withTenantContext(async () => {
    try {
      const deal = await prisma.deals.update({
        where: { id },
        data: updates,
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

      // Create activity for deal update
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: 'Deal updated',
          description: `Updated deal "${deal.title}"`,
          deal_id: deal.id,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate pages
      revalidatePath('/crm/deals');
      revalidatePath(`/crm/deals/${id}`);
      revalidatePath('/crm/crm-dashboard');

      return deal;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] updateDeal failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to update deal: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update deal stage (for pipeline Kanban)
 *
 * RBAC: Requires CRM access + deal management permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Stage update data
 * @returns Updated deal
 */
export async function updateDealStage(input: UpdateDealStageInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update deal stage');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update deal stage');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      const deal = await prisma.deals.update({
        where: { id: validated.id },
        data: {
          stage: validated.stage,
          probability: validated.probability,
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

      // Create activity for stage change
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Deal moved to ${validated.stage}`,
          description: `Pipeline stage updated to ${validated.stage} (${validated.probability}% probability)`,
          deal_id: validated.id,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate deals page (pipeline view)
      revalidatePath('/crm/deals');

      return deal;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] updateDealStage failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to update deal stage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Close a deal (mark as won or lost)
 *
 * RBAC: Requires CRM access + deal management permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Close deal data
 * @returns Closed deal
 */
export async function closeDeal(input: CloseDealInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to close deals');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to close deals');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      const deal = await prisma.deals.update({
        where: { id: validated.id },
        data: {
          status: validated.status,
          actual_close_date: validated.actual_close_date,
          lost_reason: validated.lost_reason,
          stage: validated.status === 'WON' ? 'CLOSED_WON' : 'CLOSED_LOST',
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

      // Create activity for deal close
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Deal ${validated.status === 'WON' ? 'won' : 'lost'}`,
          description: validated.lost_reason || `Deal closed as ${validated.status}`,
          deal_id: validated.id,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate pages
      revalidatePath('/crm/deals');
      revalidatePath(`/crm/deals/${validated.id}`);
      revalidatePath('/crm/crm-dashboard');

      return deal;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] closeDeal failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to close deal: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Bulk update deals
 *
 * RBAC: Requires CRM access + deal management permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Bulk update data
 * @returns Updated deals count
 */
export async function bulkUpdateDeals(input: BulkUpdateDealsInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to bulk update deals');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to bulk update deals');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      const result = await prisma.deals.updateMany({
        where: {
          id: {
            in: validated.deal_ids,
          },
        },
        data: validated.updates,
      });

      // Create activity for bulk update
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: 'Bulk deals update',
          description: `Updated ${result.count} deals`,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate deals page
      revalidatePath('/crm/deals');
      revalidatePath('/crm/crm-dashboard');

      return result.count;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] bulkUpdateDeals failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to bulk update deals: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Delete a deal
 *
 * RBAC: Requires CRM access + delete permission
 * Subscription: Requires STARTER tier minimum
 *
 * @param input - Delete deal data
 * @returns Success status
 */
export async function deleteDeal(input: DeleteDealInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canDeleteDeals(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to delete deals');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'deals:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to delete deals');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      // Get deal details before deleting
      const deal = await prisma.deals.findUnique({
        where: { id: validated.id },
        select: { title: true },
      });

      if (!deal) {
        throw new Error('Deal not found');
      }

      // Delete the deal
      await prisma.deals.delete({
        where: { id: validated.id },
      });

      // Create activity for deletion
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: 'Deal deleted',
          description: `Deleted deal "${deal.title}"`,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      // Revalidate pages
      revalidatePath('/crm/deals');
      revalidatePath('/crm/crm-dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals] deleteDeal failed:', dbError);
      throw new Error(
        `[CRM:Deals] Failed to delete deal: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}
