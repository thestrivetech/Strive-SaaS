'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
type PurchaseToolInput = any;
type PurchaseBundleInput = any;

/**
 * Marketplace Server Actions Module
 *
 * RBAC-protected mutations for purchasing tools and bundles
 */

/**
 * Purchase a tool
 *
 * RBAC: Requires marketplace access + purchase permission
 *
 * @param input - Purchase data
 * @returns Created purchase record
 */
export async function purchaseTool(input: PurchaseToolInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;

  // Import RBAC functions dynamically to avoid circular dependency
  const { canAccessMarketplace, canPurchaseTools } = await import('@/lib/auth/rbac');

  // Check RBAC permissions
  if (!canAccessMarketplace(user.role) || !canPurchaseTools(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to purchase tools');
  }

  // Validate input
  const validated = input;

  // Real Prisma mutations
  return withTenantContext(async () => {
    try {
      // Check if already purchased
      const existing = await prisma.tool_purchases.findUnique({
        where: {
          tool_id_organization_id: {
            tool_id: validated.tool_id,
            organization_id: organizationId,
          },
        },
      });

      if (existing) {
        throw new Error('Tool already purchased by your organization');
      }

      // Get tool details for pricing
      const tool = await prisma.marketplace_tools.findUnique({
        where: { id: validated.tool_id },
      });

      if (!tool || !tool.is_active) {
        throw new Error('Tool not found or inactive');
      }

      // Create purchase
      const purchase = await prisma.tool_purchases.create({
        data: {
          tool_id: validated.tool_id,
          price_at_purchase: tool.price,
          organization_id: organizationId,
          purchased_by: user.id,
          status: 'ACTIVE',
        },
        include: {
          tool: true,
        },
      });

      // Update tool purchase count
      await prisma.marketplace_tools.update({
        where: { id: validated.tool_id },
        data: {
          purchase_count: {
            increment: 1,
          },
        },
      });

      revalidatePath('/real-estate/marketplace');
      revalidatePath('/real-estate/marketplace/purchases');

      return purchase;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Actions] purchaseTool failed:', dbError);
      throw new Error('Failed to purchase tool');
    }
  });
}

/**
 * Purchase a bundle
 *
 * @param input - Bundle purchase data
 * @returns Created bundle purchase record
 */
export async function purchaseBundle(input: PurchaseBundleInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;

  const { canAccessMarketplace, canPurchaseTools } = await import('@/lib/auth/rbac');

  if (!canAccessMarketplace(user.role) || !canPurchaseTools(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to purchase bundles');
  }

  const validated = input;

  return withTenantContext(async () => {
    try {
      // Get bundle details
      const bundle = await prisma.tool_bundles.findUnique({
        where: { id: validated.bundle_id },
        include: {
          tools: {
            include: {
              tool: true,
            },
          },
        },
      });

      if (!bundle || !bundle.is_active) {
        throw new Error('Bundle not found or inactive');
      }

      // Create bundle purchase
      const bundlePurchase = await prisma.bundle_purchases.create({
        data: {
          bundle_id: validated.bundle_id,
          price_at_purchase: bundle.bundle_price,
          organization_id: organizationId,
          purchased_by: user.id,
          status: 'ACTIVE',
        },
        include: {
          bundle: {
            include: {
              tools: {
                include: {
                  tool: true,
                },
              },
            },
          },
        },
      });

      // Create individual tool purchases for each tool in bundle
      const toolPurchasePromises = bundle.tools.map((bundleTool: { tool_id: string }) =>
        prisma.tool_purchases.upsert({
          where: {
            tool_id_organization_id: {
              tool_id: bundleTool.tool_id,
              organization_id: organizationId,
            },
          },
          update: {}, // If already purchased, do nothing
          create: {
            tool_id: bundleTool.tool_id,
            price_at_purchase: 0, // Part of bundle, no separate cost
            organization_id: organizationId,
            purchased_by: user.id,
            status: 'ACTIVE',
          },
        })
      );

      await Promise.all(toolPurchasePromises);

      revalidatePath('/real-estate/marketplace');
      revalidatePath('/real-estate/marketplace/purchases');

      return bundlePurchase;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Actions] purchaseBundle failed:', dbError);
      throw new Error('Failed to purchase bundle');
    }
  });
}

/**
 * Track tool usage - updates usage count and last used timestamp
 *
 * @param toolId - Tool ID to track usage for
 * @returns Updated purchase record
 */
export async function trackToolUsage(toolId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;

  return withTenantContext(async () => {
    try {
      const purchase = await prisma.tool_purchases.findFirst({
        where: {
          tool_id: toolId,
          organization_id: organizationId,
          status: 'ACTIVE',
        },
      });

      if (!purchase) {
        throw new Error('Tool purchase not found');
      }

      return await prisma.tool_purchases.update({
        where: {
          id: purchase.id,
        },
        data: {
          usage_count: {
            increment: 1,
          },
          last_used: new Date(),
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Actions] trackToolUsage failed:', dbError);
      throw new Error('Failed to track tool usage');
    }
  });
}

// Note: Review actions have been moved to ./reviews/actions.ts
// This keeps the marketplace actions focused on purchases only
