'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  purchaseToolSchema,
  purchaseBundleSchema,
  createToolReviewSchema,
  type PurchaseToolInput,
  type PurchaseBundleInput,
  type CreateToolReviewInput,
} from './schemas';

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
  const validated = purchaseToolSchema.parse(input);

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

  const validated = purchaseBundleSchema.parse(input);

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
      const toolPurchasePromises = bundle.tools.map((bundleTool) =>
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
 * Create a tool review
 *
 * @param input - Review data
 * @returns Created review
 */
export async function createToolReview(input: CreateToolReviewInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;

  const { canAccessMarketplace } = await import('@/lib/auth/rbac');

  if (!canAccessMarketplace(user.role)) {
    throw new Error('Unauthorized: Marketplace access required');
  }

  const validated = createToolReviewSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Check if user's org has purchased the tool
      const purchase = await prisma.tool_purchases.findFirst({
        where: {
          tool_id: validated.tool_id,
          organization_id: organizationId,
          status: 'ACTIVE',
        },
      });

      if (!purchase) {
        throw new Error('You must purchase the tool before reviewing it');
      }

      // Create or update review
      const review = await prisma.tool_reviews.upsert({
        where: {
          tool_id_reviewer_id: {
            tool_id: validated.tool_id,
            reviewer_id: user.id,
          },
        },
        update: {
          rating: validated.rating,
          review: validated.review,
        },
        create: {
          tool_id: validated.tool_id,
          rating: validated.rating,
          review: validated.review,
          organization_id: organizationId,
          reviewer_id: user.id,
        },
      });

      // Recalculate tool average rating
      const reviews = await prisma.tool_reviews.findMany({
        where: { tool_id: validated.tool_id },
      });

      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await prisma.marketplace_tools.update({
        where: { id: validated.tool_id },
        data: { rating: avgRating },
      });

      revalidatePath(`/real-estate/marketplace/tools/${validated.tool_id}`);

      return review;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Actions] createToolReview failed:', dbError);
      throw new Error('Failed to create review');
    }
  });
}
