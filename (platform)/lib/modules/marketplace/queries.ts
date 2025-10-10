import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';
import { dataConfig } from '@/lib/data/config';
import { toolsProvider, bundlesProvider, purchasesProvider } from '@/lib/data';

/**
 * Marketplace Queries Module
 *
 * SECURITY: Tool catalog is public (no RLS), but purchases are org-isolated
 * PERFORMANCE: Cached queries for marketplace tools and bundles
 * MOCK MODE: Uses mock data providers when NEXT_PUBLIC_USE_MOCKS=true
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
 * PERFORMANCE: Cached for 5 minutes (300 seconds)
 * Revalidation tags: ['marketplace-tools']
 *
 * @param filters - Optional filters
 * @returns List of marketplace tools
 */
export const getMarketplaceTools = unstable_cache(
  async (filters?: ToolFilters): Promise<ToolWithStats[]> => {
    // Mock data path
    if (dataConfig.useMocks) {
      const tools = await toolsProvider.findMany({
        category: filters?.category,
        tier: filters?.tier,
        search: filters?.search,
        price_min: filters?.price_min,
        price_max: filters?.price_max,
        tags: filters?.tags,
        is_active: filters?.is_active,
      });
      return tools as any; // Mock tools compatible with ToolWithStats
    }

    // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const tool = await toolsProvider.findById(toolId);
    return tool as any; // Mock tool compatible with return type
  }

  // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const { requireAuth } = await import('@/lib/auth/auth-helpers');
    const user = await requireAuth();
    const orgId = user.organizationId || user.organization_members?.[0]?.organization_id;

    if (!orgId) return [];

    const purchases = await purchasesProvider.findMany(orgId);
    return purchases as any; // Mock purchases compatible with return type
  }

  // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const { requireAuth } = await import('@/lib/auth/auth-helpers');
    const user = await requireAuth();
    const orgId = user.organizationId || user.organization_members?.[0]?.organization_id;

    if (!orgId) return null;

    const purchase = await purchasesProvider.findByToolId(toolId, orgId);
    return purchase as any;
  }

  // Real Prisma query
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
 * PERFORMANCE: Cached for 10 minutes (600 seconds)
 * Revalidation tags: ['tool-bundles']
 *
 * @returns List of bundles with tools
 */
export const getToolBundles = unstable_cache(
  async (): Promise<BundleWithTools[]> => {
    // Mock data path
    if (dataConfig.useMocks) {
      const bundles = await bundlesProvider.findMany();
      return bundles as any; // Mock bundles compatible with BundleWithTools
    }

    // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const bundle = await bundlesProvider.findById(bundleId);
    return bundle as any;
  }

  // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    // Bundle purchases not yet implemented in mock provider
    // Return empty array for now
    return [];
  }

  // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const { requireAuth } = await import('@/lib/auth/auth-helpers');
    const user = await requireAuth();
    const orgId = user.organizationId || user.organization_members?.[0]?.organization_id;

    const tools = await toolsProvider.findMany();
    const bundles = await bundlesProvider.findMany();
    const purchases = orgId ? await purchasesProvider.findMany(orgId) : [];

    return {
      totalTools: tools.length,
      purchasedToolsCount: purchases.length,
      totalBundles: bundles.length,
      purchasedBundlesCount: 0, // Not yet implemented
    };
  }

  // Real Prisma query
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

/**
 * Get purchased tools with detailed stats for organization
 *
 * @returns List of purchased tools with usage stats
 */
export async function getPurchasedToolsWithStats() {
  // Mock data path
  if (dataConfig.useMocks) {
    const { requireAuth } = await import('@/lib/auth/auth-helpers');
    const user = await requireAuth();
    const orgId = user.organizationId || user.organization_members?.[0]?.organization_id;

    if (!orgId) {
      return { purchases: [], totalInvestment: 0, totalCount: 0 };
    }

    const purchases = await purchasesProvider.findMany(orgId);
    const totalInvestment = purchases.reduce(
      (sum, purchase) => sum + purchase.price_at_purchase,
      0
    );

    return {
      purchases: purchases as any,
      totalInvestment,
      totalCount: purchases.length,
    };
  }

  // Real Prisma query
  return withTenantContext(async () => {
    try {
      const purchases = await prisma.tool_purchases.findMany({
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

      // Calculate total investment
      const totalInvestment = purchases.reduce(
        (sum: number, purchase: { price_at_purchase: number }) => sum + purchase.price_at_purchase,
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
  // Mock data path
  if (dataConfig.useMocks) {
    const { requireAuth } = await import('@/lib/auth/auth-helpers');
    const user = await requireAuth();
    const orgId = user.organizationId || user.organization_members?.[0]?.organization_id;

    if (!orgId) return null;

    const purchase = await purchasesProvider.findByToolId(toolId, orgId);
    return purchase as any;
  }

  // Real Prisma query
  return withTenantContext(async () => {
    try {
      return await prisma.tool_purchases.findFirst({
        where: {
          tool_id: toolId,
          status: 'ACTIVE',
        },
        include: {
          tool: true,
          purchaser: {
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
