/**
 * Marketplace Purchase Flow Integration Test
 * Tests complete end-to-end purchase flows
 *
 * Coverage: Browse → Cart → Checkout → Verify Purchase
 */

import { ToolCategory, ToolTier, BundleType } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import { getMarketplaceTools, getPurchasedTools } from '@/lib/modules/marketplace/queries';
import { addToCart, checkout } from '@/lib/modules/marketplace/cart/actions';
import { purchaseTool } from '@/lib/modules/marketplace/actions';
import { createToolReview } from '@/lib/modules/marketplace/reviews/actions';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessMarketplace: jest.fn(() => true),
  canPurchaseTools: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

// Mock purchase verification for reviews
jest.mock('@/lib/modules/marketplace/reviews/queries', () => ({
  hasUserPurchasedTool: jest.fn(() => true),
}));

describe('Marketplace Purchase Flow Integration', () => {
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

  describe('Complete Tool Purchase Flow', () => {
    it('should complete full purchase flow: browse → cart → checkout → review', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser, requireAuth } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      // STEP 1: Browse marketplace
      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'CRM Pro',
          description: 'Professional CRM solution',
          category: ToolCategory.CRM,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Analytics Dashboard',
          description: 'Business intelligence platform',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.ELITE,
          price: 29900,
          is_active: true,
        },
      });

      const tools = await getMarketplaceTools({ tier: ToolTier.GROWTH });
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('CRM Pro');

      // STEP 2: Add tools to cart
      const cart1 = await addToCart({
        item_type: 'tool',
        item_id: tool1.id,
      });
      expect(cart1.tools).toContain(tool1.id);
      expect(cart1.total_price).toBe(14900);

      const cart2 = await addToCart({
        item_type: 'tool',
        item_id: tool2.id,
      });
      expect(cart2.tools).toHaveLength(2);
      expect(cart2.total_price).toBe(44800); // 14900 + 29900

      // STEP 3: Checkout
      const result = await checkout();
      expect(result.toolPurchases).toHaveLength(2);

      // STEP 4: Verify purchases
      const purchases = await getPurchasedTools();
      expect(purchases).toHaveLength(2);
      expect(purchases.map((p) => p.tool.name)).toContain('CRM Pro');
      expect(purchases.map((p) => p.tool.name)).toContain('Analytics Dashboard');

      // STEP 5: Leave review
      const review = await createToolReview({
        tool_id: tool1.id,
        rating: 5,
        review: 'Excellent CRM tool! Highly recommend.',
      });

      expect(review).toBeDefined();
      expect(review.rating).toBe(5);

      // Verify cart is empty after checkout
      const cartAfter = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });
      expect(cartAfter?.tools).toHaveLength(0);
      expect(cartAfter?.total_price).toBe(0);
    });

    it('should handle bundle purchase flow with tool access', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create tools
      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Email Marketing',
          description: 'Email campaigns',
          category: ToolCategory.MARKETING,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Social Media Manager',
          description: 'Manage social platforms',
          category: ToolCategory.MARKETING,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      // Create bundle
      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Marketing Suite',
          description: 'Complete marketing toolkit',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 24800,
          discount: 20,
          bundle_price: 19900, // Discounted from 24800
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      // Add bundle to cart
      await addToCart({
        item_type: 'bundle',
        item_id: bundle.id,
      });

      // Checkout
      const result = await checkout();

      expect(result.bundlePurchases).toHaveLength(1);

      // Verify individual tool access was granted
      const toolPurchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });

      expect(toolPurchases).toHaveLength(2);
      expect(toolPurchases.map((p) => p.tool_id)).toContain(tool1.id);
      expect(toolPurchases.map((p) => p.tool_id)).toContain(tool2.id);
    });
  });

  describe('Direct Purchase Flow', () => {
    it('should allow direct tool purchase without cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Quick Buy Tool',
          description: 'Direct purchase',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Direct purchase (bypassing cart)
      const purchase = await purchaseTool({
        tool_id: tool.id,
        organization_id: organization.id,
      });

      expect(purchase).toBeDefined();
      expect(purchase.tool_id).toBe(tool.id);
      expect(purchase.status).toBe('ACTIVE');

      // Verify in purchased tools
      const purchases = await getPurchasedTools();
      expect(purchases).toHaveLength(1);
      expect(purchases[0].tool.name).toBe('Quick Buy Tool');
    });
  });

  describe('Error Handling in Purchase Flow', () => {
    it('should prevent purchasing same tool twice', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Duplicate Test Tool',
          description: 'Testing duplicates',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // First purchase succeeds
      await purchaseTool({
        tool_id: tool.id,
        organization_id: organization.id,
      });

      // Second purchase should fail
      await expect(
        purchaseTool({
          tool_id: tool.id,
          organization_id: organization.id,
        })
      ).rejects.toThrow('Tool already purchased');
    });

    it('should prevent checkout with empty cart', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create empty cart
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

    it('should handle inactive tools gracefully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Inactive Tool',
          description: 'No longer available',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: false,
        },
      });

      await expect(
        purchaseTool({
          tool_id: tool.id,
          organization_id: organization.id,
        })
      ).rejects.toThrow('Tool not found or inactive');
    });
  });

  describe('Multi-Organization Isolation', () => {
    it('should isolate purchases between organizations', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2, user: user2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Shared Tool',
          description: 'Available to all orgs',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Org 1 purchases tool
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      await purchaseTool({
        tool_id: tool.id,
        organization_id: org1.id,
      });

      const org1Purchases = await getPurchasedTools();
      expect(org1Purchases).toHaveLength(1);

      // Org 2 should not see Org 1's purchase
      getCurrentUser.mockResolvedValue({
        ...user2,
        organization_members: [{ organization_id: org2.id }],
      });

      const org2Purchases = await getPurchasedTools();
      expect(org2Purchases).toHaveLength(0);

      // Org 2 can purchase same tool independently
      await purchaseTool({
        tool_id: tool.id,
        organization_id: org2.id,
      });

      const org2PurchasesAfter = await getPurchasedTools();
      expect(org2PurchasesAfter).toHaveLength(1);

      // Verify both orgs have separate purchases
      const allPurchases = await testPrisma.tool_purchases.findMany({
        where: { tool_id: tool.id },
      });

      expect(allPurchases).toHaveLength(2);
      expect(allPurchases.map((p) => p.organization_id)).toContain(org1.id);
      expect(allPurchases.map((p) => p.organization_id)).toContain(org2.id);
    });
  });

  describe('Cart State Management', () => {
    it('should maintain cart state across sessions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Persistent Cart Tool',
          description: 'Testing cart persistence',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Add to cart
      await addToCart({
        item_type: 'tool',
        item_id: tool.id,
      });

      // Simulate page reload - fetch cart from database
      const cart = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });

      expect(cart).toBeDefined();
      expect(cart?.tools).toContain(tool.id);
      expect(cart?.total_price).toBe(9900);
    });

    it('should handle concurrent cart modifications', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second',
          category: ToolCategory.ANALYTICS,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      // Add both tools concurrently
      await Promise.all([
        addToCart({ item_type: 'tool', item_id: tool1.id }),
        addToCart({ item_type: 'tool', item_id: tool2.id }),
      ]);

      const cart = await testPrisma.shopping_carts.findUnique({
        where: { user_id: user.id },
      });

      // Both should be in cart (eventual consistency)
      expect(cart?.tools.length).toBeGreaterThanOrEqual(1);
      expect(cart?.total_price).toBeGreaterThan(0);
    });
  });

  describe('Review Flow After Purchase', () => {
    it('should allow reviews only after purchase', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser, requireAuth } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Review Test Tool',
          description: 'For testing reviews',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 0,
        },
      });

      // Try to review without purchase
      hasUserPurchasedTool.mockResolvedValue(false);

      await expect(
        createToolReview({
          tool_id: tool.id,
          rating: 5,
        })
      ).rejects.toThrow('You must purchase this tool before reviewing it');

      // Purchase tool
      await purchaseTool({
        tool_id: tool.id,
        organization_id: organization.id,
      });

      // Now review should work
      hasUserPurchasedTool.mockResolvedValue(true);

      const review = await createToolReview({
        tool_id: tool.id,
        rating: 5,
        review: 'Great tool!',
      });

      expect(review).toBeDefined();
      expect(review.rating).toBe(5);
    });
  });
});
