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
