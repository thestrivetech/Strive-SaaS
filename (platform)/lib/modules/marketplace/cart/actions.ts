'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
type AddToCartInput = any;
type RemoveFromCartInput = any;

/**
 * Shopping Cart Server Actions Module
 */

/**
 * Add item to shopping cart
 *
 * @param input - Item to add
 * @returns Updated cart
 */
export async function addToCart(input: AddToCartInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;
  const validated = input;

  // Mock data path
  if (dataConfig.useMocks) {
    if (validated.item_type === 'tool') {
      const cart = await cartProvider.addTool(user.id, validated.item_id);
      revalidatePath('/real-estate/marketplace/cart');
      return cart as any;
    } else if (validated.item_type === 'bundle') {
      const cart = await cartProvider.addBundle(user.id, validated.item_id);
      revalidatePath('/real-estate/marketplace/cart');
      return cart as any;
    }
  }

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      // Get or create cart
      let cart = await prisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });

      if (!cart) {
        cart = await prisma.shopping_carts.create({
          data: {
            user_id: user.id,
            organization_id: organizationId,
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
        toolPrices.reduce((sum: number, t: any) => sum + t.price, 0) +
        bundlePrices.reduce((sum: number, b: any) => sum + b.bundle_price, 0);

      // Update cart
      const updatedCart = await prisma.shopping_carts.update({
        where: { user_id: user.id },
        data: {
          tools,
          bundles,
          total_price: totalPrice,
        },
      });

      revalidatePath('/real-estate/marketplace/cart');

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
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  const validated = input;

  // Mock data path
  if (dataConfig.useMocks) {
    if (validated.item_type === 'tool') {
      const cart = await cartProvider.removeTool(user.id, validated.item_id);
      revalidatePath('/real-estate/marketplace/cart');
      return cart as any;
    } else if (validated.item_type === 'bundle') {
      const cart = await cartProvider.removeBundle(user.id, validated.item_id);
      revalidatePath('/real-estate/marketplace/cart');
      return cart as any;
    }
  }

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.findUnique({
        where: { user_id: user.id },
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
        toolPrices.reduce((sum: number, t: any) => sum + t.price, 0) +
        bundlePrices.reduce((sum: number, b: any) => sum + b.bundle_price, 0);

      // Update cart
      const updatedCart = await prisma.shopping_carts.update({
        where: { user_id: user.id },
        data: {
          tools,
          bundles,
          total_price: totalPrice,
        },
      });

      revalidatePath('/real-estate/marketplace/cart');

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
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Mock data path
  if (dataConfig.useMocks) {
    await cartProvider.clear(user.id);
    revalidatePath('/real-estate/marketplace/cart');
    return { success: true } as any;
  }

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.update({
        where: { user_id: user.id },
        data: {
          tools: [],
          bundles: [],
          total_price: 0,
        },
      });

      revalidatePath('/real-estate/marketplace/cart');

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
  await requireAuth();
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    throw new Error('Unauthorized: User not found or not part of an organization');
  }

  const organizationId = user.organization_members[0].organization_id;

  // Mock data path
  if (dataConfig.useMocks) {
    // Get cart items
    const cart = await cartProvider.get(user.id);

    if (!cart || (cart.tools.length === 0 && cart.bundles.length === 0)) {
      throw new Error('Cart is empty');
    }

    // Get tool prices and create purchases
    const toolPurchases = await Promise.all(
      cart.tools.map(async (toolId: string) => {
        const tool = await toolsProvider.findById(toolId);
        if (!tool) return null;

        return purchasesProvider.create({
          toolId,
          orgId: organizationId,
          userId: user.id,
          price: tool.price,
        });
      })
    );

    // TODO: Bundle purchases when provider is ready
    const bundlePurchases: any[] = [];

    // Clear cart
    await cartProvider.clear(user.id);

    // Revalidate pages
    revalidatePath('/real-estate/marketplace');
    revalidatePath('/real-estate/marketplace/cart');
    revalidatePath('/real-estate/marketplace/purchases');

    return {
      toolPurchases: toolPurchases.filter(Boolean),
      bundlePurchases: bundlePurchases.filter(Boolean),
    } as any;
  }

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      const cart = await prisma.shopping_carts.findUnique({
        where: { user_id: user.id },
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
                organization_id: organizationId,
              },
            },
            update: {},
            create: {
              tool_id: toolId,
              price_at_purchase: tool.price,
              organization_id: organizationId,
              purchased_by: user.id,
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
              organization_id: organizationId,
              purchased_by: user.id,
              status: 'ACTIVE',
            },
          });
        })
      );

      // Clear cart
      await prisma.shopping_carts.update({
        where: { user_id: user.id },
        data: {
          tools: [],
          bundles: [],
          total_price: 0,
        },
      });

      revalidatePath('/real-estate/marketplace');
      revalidatePath('/real-estate/marketplace/cart');
      revalidatePath('/real-estate/marketplace/purchases');

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
