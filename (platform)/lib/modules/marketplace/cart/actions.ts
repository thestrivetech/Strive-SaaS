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

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      // Check if item already in cart
      const existingItem = await prisma.marketplace_cart.findFirst({
        where: {
          user_id: user.id,
          organization_id: organizationId,
          tool_id: validated.item_type === 'tool' ? validated.item_id : null,
          bundle_id: validated.item_type === 'bundle' ? validated.item_id : null,
        },
      });

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.marketplace_cart.update({
          where: { id: existingItem.id },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
        revalidatePath('/real-estate/marketplace/cart');
        return updatedItem;
      }

      // Add new item to cart
      const cartItem = await prisma.marketplace_cart.create({
        data: {
          user_id: user.id,
          organization_id: organizationId,
          tool_id: validated.item_type === 'tool' ? validated.item_id : null,
          bundle_id: validated.item_type === 'bundle' ? validated.item_id : null,
          item_type: validated.item_type === 'tool' ? 'TOOL' : 'BUNDLE',
          quantity: 1,
        },
      });

      revalidatePath('/real-estate/marketplace/cart');

      return cartItem;
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

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      // Find the cart item
      const cartItem = await prisma.marketplace_cart.findFirst({
        where: {
          user_id: user.id,
          tool_id: validated.item_type === 'tool' ? validated.item_id : null,
          bundle_id: validated.item_type === 'bundle' ? validated.item_id : null,
        },
      });

      if (!cartItem) {
        throw new Error('Item not found in cart');
      }

      // Delete the cart item
      await prisma.marketplace_cart.delete({
        where: { id: cartItem.id },
      });

      revalidatePath('/real-estate/marketplace/cart');

      return { success: true };
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

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      // Delete all cart items for user
      await prisma.marketplace_cart.deleteMany({
        where: {
          user_id: user.id,
        },
      });

      revalidatePath('/real-estate/marketplace/cart');

      return { success: true };
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

  // Real Prisma mutation
  return withTenantContext(async () => {
    try {
      // Get all cart items
      const cartItems = await prisma.marketplace_cart.findMany({
        where: {
          user_id: user.id,
          organization_id: organizationId,
        },
        include: {
          tool: true,
          bundle: true,
        },
      });

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Purchase all tools
      const toolPurchases = await Promise.all(
        cartItems
          .filter(item => item.item_type === 'TOOL' && item.tool)
          .map(async (item) => {
            const tool = item.tool!;

            return prisma.marketplace_purchases.upsert({
              where: {
                id: `${tool.id}-${organizationId}`,
              },
              update: {},
              create: {
                tool_id: tool.id,
                purchase_type: 'TOOL',
                amount: tool.price_amount,
                currency: tool.currency,
                payment_method: 'CREDIT_CARD',
                payment_status: 'COMPLETED',
                organization_id: organizationId,
                user_id: user.id,
                status: 'ACTIVE',
              },
            });
          })
      );

      // Purchase all bundles
      const bundlePurchases = await Promise.all(
        cartItems
          .filter(item => item.item_type === 'BUNDLE' && item.bundle)
          .map(async (item) => {
            const bundle = item.bundle!;

            return prisma.marketplace_purchases.create({
              data: {
                bundle_id: bundle.id,
                purchase_type: 'BUNDLE',
                amount: bundle.price_amount,
                currency: bundle.currency,
                payment_method: 'CREDIT_CARD',
                payment_status: 'COMPLETED',
                organization_id: organizationId,
                user_id: user.id,
                status: 'ACTIVE',
              },
            });
          })
      );

      // Clear cart
      await prisma.marketplace_cart.deleteMany({
        where: {
          user_id: user.id,
          organization_id: organizationId,
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
