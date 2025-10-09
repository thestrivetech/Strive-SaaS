import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import { dataConfig } from '@/lib/data/config';
import { cartProvider, toolsProvider, bundlesProvider } from '@/lib/data';

/**
 * Shopping Cart Queries Module
 * MOCK MODE: Uses mock data providers when NEXT_PUBLIC_USE_MOCKS=true
 */

/**
 * Get shopping cart for current user
 *
 * @param userId - User ID
 * @returns Shopping cart or null
 */
export async function getShoppingCart(userId: string) {
  // Mock data path
  if (dataConfig.useMocks) {
    const cart = await cartProvider.get(userId);
    return cart as any;
  }

  // Real Prisma query
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
  // Mock data path
  if (dataConfig.useMocks) {
    const cart = await cartProvider.get(userId);
    if (!cart) return null;

    const toolIds = cart.tools || [];
    const bundleIds = cart.bundles || [];

    const [tools, bundles] = await Promise.all([
      Promise.all(toolIds.map(id => toolsProvider.findById(id))),
      Promise.all(bundleIds.map(id => bundlesProvider.findById(id))),
    ]);

    return {
      cart: cart as any,
      tools: tools.filter(t => t !== null) as any,
      bundles: bundles.filter(b => b !== null) as any,
      totalPrice: cart.total_price,
    };
  }

  // Real Prisma query
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
