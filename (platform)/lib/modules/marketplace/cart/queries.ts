import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';

/**
 * Shopping Cart Queries Module
 */

/**
 * Get shopping cart for current user
 *
 * @param userId - User ID
 * @returns Shopping cart or null
 */
export async function getShoppingCart(userId: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.marketplace_cart.findFirst({
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
 * Alias for getShoppingCart (for consistency)
 */
export const getCart = getShoppingCart;

/**
 * Get cart with populated items (tools and bundles)
 *
 * @param userId - User ID
 * @returns Cart with full item details
 */
export async function getCartWithItems(userId: string) {
  return withTenantContext(async () => {
    try {
      const cartItems = await prisma.marketplace_cart.findMany({
        where: { user_id: userId },
        include: {
          tool: true,
          bundle: {
            include: {
              items: {
                include: {
                  tool: true,
                },
              },
            },
          },
        },
      });

      if (!cartItems || cartItems.length === 0) {
        return null;
      }

      const tools = cartItems.filter(item => item.item_type === 'TOOL' && item.tool).map(item => item.tool);
      const bundles = cartItems.filter(item => item.item_type === 'BUNDLE' && item.bundle).map(item => item.bundle);

      return {
        cartItems,
        tools,
        bundles,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Cart Queries] getCartWithItems failed:', dbError);
      throw error;
    }
  });
}
