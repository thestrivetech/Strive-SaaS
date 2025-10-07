import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';
import type { ToolFilters } from './schemas';

/**
 * Marketplace Queries Module
 *
 * SECURITY: Tool catalog is public (no RLS), but purchases are org-isolated
 */

type ToolWithStats = Prisma.marketplace_toolsGetPayload<{
  include: {
    _count: {
      select: { purchases: true; reviews: true };
    };
  };
}>;

type BundleWithTools = Prisma.tool_bundlesGetPayload<{
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
 * @param filters - Optional filters
 * @returns List of marketplace tools
 */
export async function getMarketplaceTools(
  filters?: ToolFilters
): Promise<ToolWithStats[]> {
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
      orderBy[filters.sort_by] = filters.sort_order || 'asc';
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
}

/**
 * Get marketplace tool by ID
 *
 * @param toolId - Tool ID
 * @returns Tool with details or null
 */
export async function getMarketplaceToolById(toolId: string) {
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
}

/**
 * Get purchased tools for current organization
 *
 * @returns List of purchased tools
 */
export async function getPurchasedTools() {
  return withTenantContext(async () => {
    try {
      return await prisma.tool_purchases.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          tool: true,
          purchaser: {
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
      return await prisma.tool_purchases.findFirst({
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
 * @returns List of bundles with tools
 */
export async function getToolBundles(): Promise<BundleWithTools[]> {
  try {
    return await prisma.tool_bundles.findMany({
      where: {
        is_active: true,
      },
      include: {
        tools: {
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
}

/**
 * Get bundle by ID
 *
 * @param bundleId - Bundle ID
 * @returns Bundle with tools or null
 */
export async function getToolBundleById(bundleId: string) {
  try {
    return await prisma.tool_bundles.findUnique({
      where: { id: bundleId },
      include: {
        tools: {
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
      return await prisma.bundle_purchases.findMany({
        where: {
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
          purchaser: {
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
        prisma.marketplace_tools.count({ where: { is_active: true } }),
        prisma.tool_purchases.count({ where: { status: 'ACTIVE' } }),
        prisma.tool_bundles.count({ where: { is_active: true } }),
        prisma.bundle_purchases.count({ where: { status: 'ACTIVE' } }),
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
