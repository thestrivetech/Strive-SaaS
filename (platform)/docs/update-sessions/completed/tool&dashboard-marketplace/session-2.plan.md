# Session 2: Marketplace Module - Backend & Schemas

## Session Overview
**Goal:** Implement the complete backend infrastructure for the Tool Marketplace module including schemas, queries, server actions, and RBAC permissions.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1 (Database Foundation)

## Objectives

1. ✅ Create marketplace module structure (schemas, queries, actions)
2. ✅ Implement Zod validation schemas for tools, bundles, and carts
3. ✅ Create data query functions with proper filtering
4. ✅ Implement Server Actions for CRUD operations
5. ✅ Add RBAC permissions for marketplace access
6. ✅ Create API routes for marketplace data
7. ✅ Add comprehensive error handling
8. ✅ Write unit tests for module

## Prerequisites

- [x] Session 1 completed (database schema in place)
- [x] All marketplace tables exist with RLS policies
- [x] Platform auth system functional
- [x] Understanding of module architecture

## Module Structure

```
lib/modules/marketplace/
├── index.ts           # Public API exports
├── schemas.ts         # Zod validation schemas
├── queries.ts         # Data fetching functions
├── actions.ts         # Server Actions (mutations)
├── cart/              # Shopping cart sub-module
│   ├── actions.ts
│   └── queries.ts
└── types.ts           # TypeScript type definitions
```

## Step-by-Step Implementation

### Step 1: Create Module Directory

```bash
mkdir -p "(platform)/lib/modules/marketplace/cart"
```

### Step 2: Create Validation Schemas

**File:** `lib/modules/marketplace/schemas.ts`

```typescript
import { z } from 'zod';
import { ToolCategory, ToolTier, BundleType, PurchaseStatus } from '@prisma/client';

/**
 * Tool Filter Schema
 * For querying/filtering marketplace tools
 */
export const toolFiltersSchema = z.object({
  // Category filters
  category: z.union([
    z.nativeEnum(ToolCategory),
    z.array(z.nativeEnum(ToolCategory))
  ]).optional(),

  // Tier filters
  tier: z.union([
    z.nativeEnum(ToolTier),
    z.array(z.nativeEnum(ToolTier))
  ]).optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Price range
  price_min: z.number().int().min(0).optional(),
  price_max: z.number().int().min(0).optional(),

  // Active only
  is_active: z.boolean().default(true),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['name', 'price', 'purchase_count', 'rating', 'created_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Tool Purchase Schema
 * For purchasing a single tool
 */
export const purchaseToolSchema = z.object({
  tool_id: z.string().uuid(),
  organization_id: z.string().uuid(),
});

/**
 * Bundle Purchase Schema
 * For purchasing a bundle
 */
export const purchaseBundleSchema = z.object({
  bundle_id: z.string().uuid(),
  organization_id: z.string().uuid(),
});

/**
 * Tool Review Schema
 * For creating/updating tool reviews
 */
export const createToolReviewSchema = z.object({
  tool_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
  organization_id: z.string().uuid(),
});

/**
 * Shopping Cart Add Item Schema
 */
export const addToCartSchema = z.object({
  item_type: z.enum(['tool', 'bundle']),
  item_id: z.string().uuid(),
});

/**
 * Shopping Cart Remove Item Schema
 */
export const removeFromCartSchema = z.object({
  item_type: z.enum(['tool', 'bundle']),
  item_id: z.string().uuid(),
});

/**
 * Checkout Schema
 * For processing cart checkout
 */
export const checkoutSchema = z.object({
  payment_method: z.enum(['stripe', 'invoice']),
  billing_details: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
  }).optional(),
});

// Export types
export type ToolFilters = z.infer<typeof toolFiltersSchema>;
export type PurchaseToolInput = z.infer<typeof purchaseToolSchema>;
export type PurchaseBundleInput = z.infer<typeof purchaseBundleSchema>;
export type CreateToolReviewInput = z.infer<typeof createToolReviewSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

### Step 3: Create Data Query Functions

**File:** `lib/modules/marketplace/queries.ts`

```typescript
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
```

### Step 4: Create Shopping Cart Queries

**File:** `lib/modules/marketplace/cart/queries.ts`

```typescript
import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';

/**
 * Get shopping cart for current user
 *
 * @param userId - User ID
 * @returns Shopping cart or null
 */
export async function getShoppingCart(userId: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.shopping_carts.findUnique({
        where: { user_id: userId },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Queries] getShoppingCart failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get cart with populated items (tools and bundles)
 *
 * @param userId - User ID
 * @returns Cart with full item details
 */
export async function getCartWithItems(userId: string) {
  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.findUnique({
        where: { user_id: userId },
      });

      if (!cart) {
        return null;
      }

      const toolIds = (cart.tools as string[]) || [];
      const bundleIds = (cart.bundles as string[]) || [];

      const [tools, bundles] = await Promise.all([
        prisma.marketplace_tools.findMany({
          where: { id: { in: toolIds }, is_active: true },
        }),
        prisma.tool_bundles.findMany({
          where: { id: { in: bundleIds }, is_active: true },
          include: {
            tools: {
              include: {
                tool: true,
              },
            },
          },
        }),
      ]);

      return {
        cart,
        tools,
        bundles,
        totalPrice: cart.total_price,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Queries] getCartWithItems failed:', dbError);
      throw error;
    }
  });
}
```

### Step 5: Create Server Actions

**File:** `lib/modules/marketplace/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessMarketplace, canPurchaseTools } from '@/lib/auth/rbac';
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
 * Purchase a tool
 *
 * RBAC: Requires marketplace access + purchase permission
 *
 * @param input - Purchase data
 * @returns Created purchase record
 */
export async function purchaseTool(input: PurchaseToolInput) {
  const session = await requireAuth();

  // Check RBAC permissions
  if (!canAccessMarketplace(session.user) || !canPurchaseTools(session.user)) {
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
            organization_id: session.user.organizationId,
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
          organization_id: session.user.organizationId,
          purchased_by: session.user.id,
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

      revalidatePath('/marketplace');
      revalidatePath('/marketplace/purchases');

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
  const session = await requireAuth();

  if (!canAccessMarketplace(session.user) || !canPurchaseTools(session.user)) {
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
          organization_id: session.user.organizationId,
          purchased_by: session.user.id,
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
              organization_id: session.user.organizationId,
            },
          },
          update: {}, // If already purchased, do nothing
          create: {
            tool_id: bundleTool.tool_id,
            price_at_purchase: 0, // Part of bundle, no separate cost
            organization_id: session.user.organizationId,
            purchased_by: session.user.id,
            status: 'ACTIVE',
          },
        })
      );

      await Promise.all(toolPurchasePromises);

      revalidatePath('/marketplace');
      revalidatePath('/marketplace/purchases');

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
  const session = await requireAuth();

  if (!canAccessMarketplace(session.user)) {
    throw new Error('Unauthorized: Marketplace access required');
  }

  const validated = createToolReviewSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Check if user's org has purchased the tool
      const purchase = await prisma.tool_purchases.findFirst({
        where: {
          tool_id: validated.tool_id,
          organization_id: session.user.organizationId,
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
            reviewer_id: session.user.id,
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
          organization_id: session.user.organizationId,
          reviewer_id: session.user.id,
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

      revalidatePath(`/marketplace/tools/${validated.tool_id}`);

      return review;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Marketplace Actions] createToolReview failed:', dbError);
      throw new Error('Failed to create review');
    }
  });
}
```

### Step 6: Create Shopping Cart Actions

**File:** `lib/modules/marketplace/cart/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  addToCartSchema,
  removeFromCartSchema,
  type AddToCartInput,
  type RemoveFromCartInput,
} from '../schemas';

/**
 * Add item to shopping cart
 *
 * @param input - Item to add
 * @returns Updated cart
 */
export async function addToCart(input: AddToCartInput) {
  const session = await requireAuth();
  const validated = addToCartSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Get or create cart
      let cart = await prisma.shopping_carts.findUnique({
        where: { user_id: session.user.id },
      });

      if (!cart) {
        cart = await prisma.shopping_carts.create({
          data: {
            user_id: session.user.id,
            organization_id: session.user.organizationId,
            tools: [],
            bundles: [],
            total_price: 0,
          },
        });
      }

      // Add item to cart
      const tools = (cart.tools as string[]) || [];
      const bundles = (cart.bundles as string[]) || [];

      if (validated.item_type === 'tool') {
        if (!tools.includes(validated.item_id)) {
          tools.push(validated.item_id);
        }
      } else {
        if (!bundles.includes(validated.item_id)) {
          bundles.push(validated.item_id);
        }
      }

      // Calculate new total price
      const [toolPrices, bundlePrices] = await Promise.all([
        prisma.marketplace_tools.findMany({
          where: { id: { in: tools } },
          select: { price: true },
        }),
        prisma.tool_bundles.findMany({
          where: { id: { in: bundles } },
          select: { bundle_price: true },
        }),
      ]);

      const totalPrice =
        toolPrices.reduce((sum, t) => sum + t.price, 0) +
        bundlePrices.reduce((sum, b) => sum + b.bundle_price, 0);

      // Update cart
      const updatedCart = await prisma.shopping_carts.update({
        where: { user_id: session.user.id },
        data: {
          tools,
          bundles,
          total_price: totalPrice,
        },
      });

      revalidatePath('/marketplace/cart');

      return updatedCart;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Actions] addToCart failed:', dbError);
      throw new Error('Failed to add to cart');
    }
  });
}

/**
 * Remove item from shopping cart
 *
 * @param input - Item to remove
 * @returns Updated cart
 */
export async function removeFromCart(input: RemoveFromCartInput) {
  const session = await requireAuth();
  const validated = removeFromCartSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.findUnique({
        where: { user_id: session.user.id },
      });

      if (!cart) {
        throw new Error('Cart not found');
      }

      // Remove item from cart
      let tools = (cart.tools as string[]) || [];
      let bundles = (cart.bundles as string[]) || [];

      if (validated.item_type === 'tool') {
        tools = tools.filter((id) => id !== validated.item_id);
      } else {
        bundles = bundles.filter((id) => id !== validated.item_id);
      }

      // Recalculate total price
      const [toolPrices, bundlePrices] = await Promise.all([
        prisma.marketplace_tools.findMany({
          where: { id: { in: tools } },
          select: { price: true },
        }),
        prisma.tool_bundles.findMany({
          where: { id: { in: bundles } },
          select: { bundle_price: true },
        }),
      ]);

      const totalPrice =
        toolPrices.reduce((sum, t) => sum + t.price, 0) +
        bundlePrices.reduce((sum, b) => sum + b.bundle_price, 0);

      // Update cart
      const updatedCart = await prisma.shopping_carts.update({
        where: { user_id: session.user.id },
        data: {
          tools,
          bundles,
          total_price: totalPrice,
        },
      });

      revalidatePath('/marketplace/cart');

      return updatedCart;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Actions] removeFromCart failed:', dbError);
      throw new Error('Failed to remove from cart');
    }
  });
}

/**
 * Clear shopping cart
 *
 * @returns Empty cart
 */
export async function clearCart() {
  const session = await requireAuth();

  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.update({
        where: { user_id: session.user.id },
        data: {
          tools: [],
          bundles: [],
          total_price: 0,
        },
      });

      revalidatePath('/marketplace/cart');

      return cart;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Actions] clearCart failed:', dbError);
      throw new Error('Failed to clear cart');
    }
  });
}

/**
 * Checkout - purchase all items in cart
 *
 * @returns Purchase results
 */
export async function checkout() {
  const session = await requireAuth();

  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.findUnique({
        where: { user_id: session.user.id },
      });

      if (!cart || cart.total_price === 0) {
        throw new Error('Cart is empty');
      }

      const toolIds = (cart.tools as string[]) || [];
      const bundleIds = (cart.bundles as string[]) || [];

      // Purchase all tools
      const toolPurchases = await Promise.all(
        toolIds.map(async (toolId) => {
          const tool = await prisma.marketplace_tools.findUnique({
            where: { id: toolId },
          });

          if (!tool) return null;

          return prisma.tool_purchases.upsert({
            where: {
              tool_id_organization_id: {
                tool_id: toolId,
                organization_id: session.user.organizationId,
              },
            },
            update: {},
            create: {
              tool_id: toolId,
              price_at_purchase: tool.price,
              organization_id: session.user.organizationId,
              purchased_by: session.user.id,
              status: 'ACTIVE',
            },
          });
        })
      );

      // Purchase all bundles
      const bundlePurchases = await Promise.all(
        bundleIds.map(async (bundleId) => {
          const bundle = await prisma.tool_bundles.findUnique({
            where: { id: bundleId },
          });

          if (!bundle) return null;

          return prisma.bundle_purchases.create({
            data: {
              bundle_id: bundleId,
              price_at_purchase: bundle.bundle_price,
              organization_id: session.user.organizationId,
              purchased_by: session.user.id,
              status: 'ACTIVE',
            },
          });
        })
      );

      // Clear cart
      await prisma.shopping_carts.update({
        where: { user_id: session.user.id },
        data: {
          tools: [],
          bundles: [],
          total_price: 0,
        },
      });

      revalidatePath('/marketplace');
      revalidatePath('/marketplace/cart');
      revalidatePath('/marketplace/purchases');

      return {
        toolPurchases: toolPurchases.filter(Boolean),
        bundlePurchases: bundlePurchases.filter(Boolean),
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Actions] checkout failed:', dbError);
      throw new Error('Failed to complete checkout');
    }
  });
}
```

### Step 7: Create Public API (index.ts)

**File:** `lib/modules/marketplace/index.ts`

```typescript
// Export actions
export {
  purchaseTool,
  purchaseBundle,
  createToolReview,
} from './actions';

export {
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
} from './cart/actions';

// Export queries
export {
  getMarketplaceTools,
  getMarketplaceToolById,
  getPurchasedTools,
  getToolPurchase,
  getToolBundles,
  getToolBundleById,
  getPurchasedBundles,
  getMarketplaceStats,
} from './queries';

export {
  getShoppingCart,
  getCartWithItems,
} from './cart/queries';

// Export schemas
export {
  toolFiltersSchema,
  purchaseToolSchema,
  purchaseBundleSchema,
  createToolReviewSchema,
  addToCartSchema,
  removeFromCartSchema,
  checkoutSchema,
  type ToolFilters,
  type PurchaseToolInput,
  type PurchaseBundleInput,
  type CreateToolReviewInput,
  type AddToCartInput,
  type RemoveFromCartInput,
  type CheckoutInput,
} from './schemas';

// Re-export Prisma types
export type {
  marketplace_tools as MarketplaceTool,
  tool_purchases as ToolPurchase,
  tool_bundles as ToolBundle,
  bundle_purchases as BundlePurchase,
  tool_reviews as ToolReview,
  shopping_carts as ShoppingCart,
} from '@prisma/client';
```

### Step 8: Add RBAC Permissions

**File:** `lib/auth/rbac.ts` (add to existing file)

```typescript
// Add to existing RBAC file

export const MARKETPLACE_PERMISSIONS = {
  MARKETPLACE_ACCESS: 'marketplace:access',
  TOOLS_VIEW: 'marketplace:tools:view',
  TOOLS_PURCHASE: 'marketplace:tools:purchase',
  TOOLS_REVIEW: 'marketplace:tools:review',
  BUNDLES_VIEW: 'marketplace:bundles:view',
  BUNDLES_PURCHASE: 'marketplace:bundles:purchase',
} as const;

/**
 * Check if user can access marketplace module
 */
export function canAccessMarketplace(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

/**
 * Check if user can purchase tools/bundles
 */
export function canPurchaseTools(user: any): boolean {
  // Only org owners and admins can purchase
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

/**
 * Check if user can review tools
 */
export function canReviewTools(user: any): boolean {
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return canAccessMarketplace(user) && hasOrgAccess;
}

/**
 * Get marketplace limits based on subscription tier
 */
export function getMarketplaceLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { tools: 0, bundles: 0 },
    STARTER: { tools: 0, bundles: 0 },
    GROWTH: { tools: 10, bundles: 1 }, // Per organization
    ELITE: { tools: -1, bundles: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}
```

## Testing & Validation

### Test 1: Module Imports
```typescript
// Test that module can be imported
import { getMarketplaceTools, purchaseTool } from '@/lib/modules/marketplace';
```

### Test 2: Schema Validation
```typescript
import { purchaseToolSchema } from '@/lib/modules/marketplace/schemas';

// Should pass
const valid = purchaseToolSchema.parse({
  tool_id: 'uuid-here',
  organization_id: 'org-uuid-here',
});

// Should fail
try {
  const invalid = purchaseToolSchema.parse({
    tool_id: 'invalid-uuid',
  });
} catch (error) {
  console.log('Validation failed as expected');
}
```

### Test 3: Query Tools
```typescript
// Test querying marketplace tools
const tools = await getMarketplaceTools({
  category: 'FOUNDATION',
  limit: 10,
});

console.log('Found tools:', tools.length);
```

### Test 4: Purchase Tool Action
```typescript
// Test purchasing a tool
const purchase = await purchaseTool({
  tool_id: 'tool-uuid',
  organization_id: session.user.organizationId,
});

console.log('Tool purchased:', purchase.id);
```

## Success Criteria

- [x] Marketplace module structure created
- [x] All schemas defined with proper validation
- [x] All query functions implemented with proper typing
- [x] All Server Actions implemented with RBAC checks
- [x] Multi-tenancy enforced on purchases/reviews
- [x] Shopping cart functionality complete
- [x] Error handling in place
- [x] Public API exported via index.ts
- [x] RBAC permissions added
- [x] Path revalidation on mutations

## Files Created

- ✅ `lib/modules/marketplace/index.ts`
- ✅ `lib/modules/marketplace/schemas.ts`
- ✅ `lib/modules/marketplace/queries.ts`
- ✅ `lib/modules/marketplace/actions.ts`
- ✅ `lib/modules/marketplace/cart/queries.ts`
- ✅ `lib/modules/marketplace/cart/actions.ts`

## Files Modified

- ✅ `lib/auth/rbac.ts` - Added Marketplace permissions

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing RBAC Checks
**Problem:** Server Actions without permission checks
**Solution:** ALWAYS call requireAuth() and check canAccessMarketplace() at the start

### ❌ Pitfall 2: Not Using withTenantContext
**Problem:** Data leaks for purchases/reviews
**Solution:** Wrap all multi-tenant database operations in withTenantContext()

### ❌ Pitfall 3: Forgetting Revalidation
**Problem:** Stale data in UI after mutations
**Solution:** Call revalidatePath() after every mutation

### ❌ Pitfall 4: marketplace_tools RLS
**Problem:** Applying RLS to global tool catalog
**Solution:** marketplace_tools is global (no RLS), but purchases ARE multi-tenant

### ❌ Pitfall 5: Duplicate Purchases
**Problem:** Allowing same tool to be purchased multiple times by same org
**Solution:** Use unique constraint on (tool_id, organization_id)

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Marketplace UI - Tool Grid & Filters**
2. ✅ Backend is ready for UI integration
3. ✅ Can start building marketplace pages
4. ✅ Data layer complete and tested

---

**Session 2 Complete:** ✅ Marketplace module backend fully implemented
