/**
 * Shopping Cart Test Suite
 * Tests for cart operations with multi-tenant isolation
 *
 * Coverage: addToCart, removeFromCart, clearCart, checkout
 */

import { ToolCategory, ToolTier, BundleType } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
} from '@/lib/modules/marketplace/cart/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { mockAsyncFunction } from '@/__tests__/helpers/mock-helpers';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

describe('Shopping Cart Module', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should create cart and add tool', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool to add to cart',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const cart = await addToCart({
        item_type: 'tool',
        item_id: tool.id,
      });

      expect(cart).toBeDefined();
      expect(cart.user_id).toBe(user.id);
      expect(cart.organization_id).toBe(organization.id);
      expect(cart.tools).toContain(tool.id);
      expect(cart.total_price).toBe(9900);

      // Verify in database
      const dbCart = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });
      expect(dbCart).toBeDefined();
      expect(dbCart?.tools).toContain(tool.id);
    });

    it('should add bundle to existing cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create existing cart with a tool
      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Existing Tool',
          description: 'Already in cart',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 4900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool.id],
          bundles: [],
          total_price: 4900,
        },
      });

      // Create bundle
      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Starter Bundle',
          description: 'Bundle of starter tools',
          bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      const cart = await addToCart({
        item_type: 'bundle',
        item_id: bundle.id,
      });

      expect(cart.tools).toContain(tool.id);
      expect(cart.bundles).toContain(bundle.id);
      expect(cart.total_price).toBe(19800); // 4900 + 14900
    });

    it('should calculate correct total price', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second tool',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      await addToCart({ item_type: 'tool', item_id: tool1.id });
      const cart = await addToCart({ item_type: 'tool', item_id: tool2.id });

      expect(cart.total_price).toBe(24800); // 9900 + 14900
    });

    it('should not add duplicate items', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      await addToCart({ item_type: 'tool', item_id: tool.id });
      const cart = await addToCart({ item_type: 'tool', item_id: tool.id });

      expect(cart.tools).toHaveLength(1);
      expect(cart.total_price).toBe(9900);
    });

    it('should validate input schema', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await expect(
        addToCart({
          item_type: 'invalid' as any,
          item_id: '123',
        })
      ).rejects.toThrow();
    });
  });

  describe('removeFromCart', () => {
    it('should remove tool from cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second tool',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool1.id, tool2.id],
          bundles: [],
          total_price: 24800,
        },
      });

      const cart = await removeFromCart({
        item_type: 'tool',
        item_id: tool1.id,
      });

      expect(cart.tools).not.toContain(tool1.id);
      expect(cart.tools).toContain(tool2.id);
      expect(cart.total_price).toBe(14900);
    });

    it('should remove bundle from cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Test Bundle',
          description: 'Bundle',
          bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [],
          bundles: [bundle.id],
          total_price: 14900,
        },
      });

      const cart = await removeFromCart({
        item_type: 'bundle',
        item_id: bundle.id,
      });

      expect(cart.bundles).not.toContain(bundle.id);
      expect(cart.total_price).toBe(0);
    });

    it('should recalculate total price after removal', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'Cheap',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 4900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Expensive',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.ELITE,
          price: 29900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool1.id, tool2.id],
          bundles: [],
          total_price: 34800,
        },
      });

      const cart = await removeFromCart({
        item_type: 'tool',
        item_id: tool2.id,
      });

      expect(cart.total_price).toBe(4900);
    });

    it('should throw error if cart not found', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await expect(
        removeFromCart({
          item_type: 'tool',
          item_id: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow('Cart not found');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Test Bundle',
          description: 'Bundle',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool.id],
          bundles: [bundle.id],
          total_price: 24800,
        },
      });

      const cart = await clearCart();

      expect(cart.tools).toHaveLength(0);
      expect(cart.bundles).toHaveLength(0);
      expect(cart.total_price).toBe(0);
    });
  });

  describe('checkout', () => {
    it('should purchase all items in cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second tool',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool1.id, tool2.id],
          bundles: [],
          total_price: 24800,
        },
      });

      const result = await checkout();

      expect(result.toolPurchases).toHaveLength(2);
      expect(result.bundlePurchases).toHaveLength(0);

      // Verify purchases in database
      const purchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });
      expect(purchases).toHaveLength(2);
    });

    it('should clear cart after checkout', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool.id],
          bundles: [],
          total_price: 9900,
        },
      });

      await checkout();

      const cart = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });

      expect(cart?.tools).toHaveLength(0);
      expect(cart?.bundles).toHaveLength(0);
      expect(cart?.total_price).toBe(0);
    });

    it('should throw error if cart is empty', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [],
          bundles: [],
          total_price: 0,
        },
      });

      await expect(checkout()).rejects.toThrow('Cart is empty');
    });

    it('should purchase bundles and create individual tool purchases', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'In bundle',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'In bundle',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Combo Bundle',
          description: 'Both tools',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 19900,
          is_active: true,
        },
      });

      // Link tools to bundle
      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [],
          bundles: [bundle.id],
          total_price: 19900,
        },
      });

      const result = await checkout();

      expect(result.bundlePurchases).toHaveLength(1);

      // Verify individual tool purchases were created
      const toolPurchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });

      expect(toolPurchases).toHaveLength(2);
      expect(toolPurchases.every((p) => p.price_at_purchase === 0)).toBe(true);
    });

    it('should not duplicate if tool already purchased separately', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Already purchased',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Existing purchase
      await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool.id,
          organization_id: organization.id,
          purchased_by: user.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
        },
      });

      await testPrisma.shopping_carts.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          tools: [tool.id],
          bundles: [],
          total_price: 9900,
        },
      });

      const result = await checkout();

      // Should still only have 1 purchase (upsert doesn't create duplicate)
      const purchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });

      expect(purchases).toHaveLength(1);
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should isolate carts by user', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const user2 = await createTestOrgWithUser();

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // User 1 adds to cart
      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: organization.id }],
      });
      await addToCart({ item_type: 'tool', item_id: tool.id });

      // User 2 should have empty cart
      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user2.user,
        organization_members: [{ organization_id: user2.organization.id }],
      });

      const cart2 = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user2.user.id },
      });

      expect(cart2).toBeNull();
    });
  });
});
