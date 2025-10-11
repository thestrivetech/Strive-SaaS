import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';

/**
 * Marketplace Queries Module
 *
 * SECURITY: Tool catalog is public (no RLS), but purchases are org-isolated
 * PERFORMANCE: Cached queries for marketplace tools and bundles
 */

type ToolWithStats = Prisma.marketplace_toolsGetPayload<{
  include: {
    _count: {
      select: { purchases: true; reviews: true };
    };
  };
}>;

type BundleWithTools = Prisma.marketplace_bundlesGetPayload<{
  include: {
    tools: {
      include: {
        tool: true;
      };
    };
  };
}>;

/**
 * Get all available marketplace tools with filters
 *
 * PERFORMANCE: Cached for 5 minutes (300 seconds)
 * Revalidation tags: ['marketplace-tools']
 *
 * @param filters - Optional filters
 * @returns List of marketplace tools
 */
export const getMarketplaceTools = unstable_cache(
  async (filters?: ToolFilters): Promise<ToolWithStats[]> => {
    try {
      const where: Prisma.marketplace_toolsWhereInput = {
        is_active: filters?.is_active ?? true,
      };

    // Category filter (single or array)
    if (filters?.category) {
      where.category = Array.isArray(filters.category)
        ? { in: filters.category }
        : filters.category;
    }

    // Tier filter (single or array)
    if (filters?.tier) {
      where.tier = Array.isArray(filters.tier)
        ? { in: filters.tier }
        : filters.tier;
    }

    // Search across name and description
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Tags filter (has any of the provided tags)
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    // Price range filters
    if (filters?.price_min !== undefined || filters?.price_max !== undefined) {
      where.price = {};
      if (filters.price_min !== undefined) {
        where.price.gte = filters.price_min;
      }
      if (filters.price_max !== undefined) {
        where.price.lte = filters.price_max;
      }
    }

    // Sorting
    const orderBy: Prisma.marketplace_toolsOrderByWithRelationInput = {};
    if (filters?.sort_by) {
      (orderBy as Record<string, any>)[filters.sort_by] = filters.sort_order || 'asc';
    } else {
      orderBy.purchase_count = 'desc'; // Default: most popular first
    }

      return await prisma.marketplace_tools.findMany({
        where,
        include: {
          _count: {
            select: { purchases: true, reviews: true },
          },
        },
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getMarketplaceTools failed:', dbError);
      throw error;
    }
  },
  ['marketplace-tools'],
  {
    revalidate: 300, // 5 minutes
    tags: ['marketplace-tools'],
  }
);

/**
 * Get marketplace tool by ID
 *
 * PERFORMANCE: React cached per request
 *
 * @param toolId - Tool ID
 * @returns Tool with details or null
 */
export const getMarketplaceToolById = cache(async (toolId: string) => {
  try {
    return await prisma.marketplace_tools.findUnique({
      where: { id: toolId },
      include: {
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 20,
        },
        _count: {
          select: { purchases: true, reviews: true },
        },
      },
    });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Marketplace Queries] getMarketplaceToolById failed:', dbError);
    throw error;
  }
});

/**
 * Get purchased tools for current organization
 *
 * @returns List of purchased tools
 */
export async function getPurchasedTools() {
  return withTenantContext(async () => {
    try {
      return await prisma.marketplace_purchases.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          tool: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { purchase_date: 'desc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getPurchasedTools failed:', dbError);
      throw error;
    }
  });
}

/**
 * Check if organization has purchased a specific tool
 *
 * @param toolId - Tool ID
 * @returns Purchase record or null
 */
export async function getToolPurchase(toolId: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.marketplace_purchases.findFirst({
        where: {
          tool_id: toolId,
          status: 'ACTIVE',
        },
        include: {
          tool: true,
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getToolPurchase failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get all available bundles
 *
 * PERFORMANCE: Cached for 10 minutes (600 seconds)
 * Revalidation tags: ['tool-bundles']
 *
 * @returns List of bundles with tools
 */
export const getToolBundles = unstable_cache(
  async (): Promise<BundleWithTools[]> => {
    try {
      return await prisma.marketplace_bundles.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          items: {
            include: {
              tool: true,
            },
          },
        },
        orderBy: [
          { is_popular: 'desc' },
          { created_at: 'desc' },
        ],
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getToolBundles failed:', dbError);
      throw error;
    }
  },
  ['tool-bundles'],
  {
    revalidate: 600, // 10 minutes
    tags: ['tool-bundles'],
  }
);

/**
 * Get bundle by ID
 *
 * @param bundleId - Bundle ID
 * @returns Bundle with tools or null
 */
export async function getToolBundleById(bundleId: string) {
  try {
    return await prisma.marketplace_bundles.findUnique({
      where: { id: bundleId },
      include: {
        items: {
          include: {
            tool: true,
          },
        },
      },
    });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Marketplace Queries] getToolBundleById failed:', dbError);
    throw error;
  }
}

/**
 * Get purchased bundles for current organization
 *
 * @returns List of purchased bundles
 */
export async function getPurchasedBundles() {
  return withTenantContext(async () => {
    try {
      return await prisma.marketplace_purchases.findMany({
        where: {
          status: 'ACTIVE',
          purchase_type: 'BUNDLE',
        },
        include: {
          bundle: {
            include: {
              items: {
                include: {
                  tool: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { purchase_date: 'desc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getPurchasedBundles failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get marketplace statistics
 *
 * @returns Marketplace stats
 */
export async function getMarketplaceStats() {
  return withTenantContext(async () => {
    try {
      const [
        totalTools,
        purchasedToolsCount,
        totalBundles,
        purchasedBundlesCount,
      ] = await Promise.all([
        prisma.marketplace_tools.count({ where: { status: 'ACTIVE' } }),
        prisma.marketplace_purchases.count({ where: { status: 'ACTIVE', purchase_type: 'TOOL' } }),
        prisma.marketplace_bundles.count({ where: { status: 'ACTIVE' } }),
        prisma.marketplace_purchases.count({ where: { status: 'ACTIVE', purchase_type: 'BUNDLE' } }),
      ]);

      return {
        totalTools,
        purchasedToolsCount,
        totalBundles,
        purchasedBundlesCount,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getMarketplaceStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get purchased tools with detailed stats for organization
 *
 * @returns List of purchased tools with usage stats
 */
export async function getPurchasedToolsWithStats() {
  return withTenantContext(async () => {
    try {
      const purchases = await prisma.marketplace_purchases.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          tool: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { purchase_date: 'desc' },
      });

      // Calculate total investment
      const totalInvestment = purchases.reduce(
        (sum: number, purchase: { amount: any }) => sum + Number(purchase.amount),
        0
      );

      return {
        purchases,
        totalInvestment,
        totalCount: purchases.length,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getPurchasedToolsWithStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get individual tool purchase details
 *
 * @param toolId - Tool ID
 * @returns Purchase details with tool info
 */
export async function getToolPurchaseDetails(toolId: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.marketplace_purchases.findFirst({
        where: {
          tool_id: toolId,
          status: 'ACTIVE',
        },
        include: {
          tool: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Queries] getToolPurchaseDetails failed:', dbError);
      throw error;
    }
  });
}
