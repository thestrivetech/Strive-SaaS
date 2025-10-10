/**
 * Tool Bundles Test Suite
 * Tests for bundle management and bundle purchases
 *
 * Coverage: getToolBundles, getToolBundleById, purchaseBundle, getPurchasedBundles
 */

import { BundleType, ToolCategory, ToolTier } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  getToolBundles,
  getToolBundleById,
  getPurchasedBundles,
} from '@/lib/modules/marketplace/queries';
import { purchaseBundle } from '@/lib/modules/marketplace/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessMarketplace, canPurchaseTools } from '@/lib/auth/rbac';
import { mockAsyncFunction, mockFunction } from '../../helpers/mock-helpers';

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

describe('Tool Bundles Module', () => {
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

  describe('getToolBundles', () => {
    it('should return all active bundles', async () => {
      await testPrisma.tool_bundles.createMany({
        data: [
          {
            name: 'Starter Bundle',
            description: 'Perfect for getting started',
            bundle_type: BundleType.STARTER_PACK,
            original_price: 24800,
            bundle_price: 19900,
            discount: 20,
            is_active: true,
            is_popular: false,
          },
          {
            name: 'Growth Bundle',
            description: 'For growing businesses',
            bundle_type: BundleType.GROWTH_PACK,
            original_price: 49800,
            bundle_price: 39900,
            discount: 20,
            is_active: true,
            is_popular: true,
          },
          {
            name: 'Inactive Bundle',
            description: 'Not available',
            bundle_type: BundleType.CUSTOM_PACK,
            original_price: 14900,
            bundle_price: 9900,
            discount: 33.56,
            is_active: false,
            is_popular: false,
          },
        ],
      });

      const bundles = await getToolBundles();

      expect(bundles).toHaveLength(2); // Only active bundles
      expect(bundles[0].name).toBe('Growth Bundle'); // Popular first
      expect(bundles[1].name).toBe('Starter Bundle');
    });

    it('should include tools in bundle', async () => {
      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First tool',
          category: ToolCategory.FOUNDATION,
          tier: ToolTier.T1,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second tool',
          category: ToolCategory.GROWTH,
          tier: ToolTier.T2,
          price: 14900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Complete Bundle',
          description: 'All the tools',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 19900,
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      const bundles = await getToolBundles();

      expect(bundles).toHaveLength(1);
      expect(bundles[0].tools).toHaveLength(2);
      expect(bundles[0].tools[0].tool.name).toBe('Tool 1');
      expect(bundles[0].tools[1].tool.name).toBe('Tool 2');
    });

    it('should sort popular bundles first', async () => {
      await testPrisma.tool_bundles.createMany({
        data: [
          {
            name: 'Regular Bundle',
            description: 'Normal bundle',
            bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
            bundle_price: 19900,
            is_active: true,
            is_popular: false,
            created_at: new Date('2024-01-01'),
          },
          {
            name: 'Popular Bundle',
            description: 'Most popular',
            bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
            bundle_price: 39900,
            is_active: true,
            is_popular: true,
            created_at: new Date('2024-01-15'),
          },
        ],
      });

      const bundles = await getToolBundles();

      expect(bundles[0].name).toBe('Popular Bundle');
      expect(bundles[1].name).toBe('Regular Bundle');
    });
  });

  describe('getToolBundleById', () => {
    it('should return bundle with tools', async () => {
      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool in bundle',
          category: ToolCategory.FOUNDATION,
          tier: ToolTier.T1,
          price: 9900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Test Bundle',
          description: 'Bundle with tool',
          bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.create({
        data: {
          bundle_id: bundle.id,
          tool_id: tool.id,
        },
      });

      const result = await getToolBundleById(bundle.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Bundle');
      expect(result?.tools).toHaveLength(1);
      expect(result?.tools[0].tool.name).toBe('Test Tool');
    });

    it('should return null for non-existent bundle', async () => {
      const result = await getToolBundleById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('purchaseBundle', () => {
    it('should purchase bundle successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'First tool',
          category: ToolCategory.FOUNDATION,
          tier: ToolTier.T1,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Second tool',
          category: ToolCategory.GROWTH,
          tier: ToolTier.T2,
          price: 14900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Complete Bundle',
          description: 'Both tools at discount',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 19900,
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      const purchase = await purchaseBundle({
        bundle_id: bundle.id,
        organization_id: organization.id,
      });

      expect(purchase).toBeDefined();
      expect(purchase.bundle_id).toBe(bundle.id);
      expect(purchase.organization_id).toBe(organization.id);
      expect(purchase.purchased_by).toBe(user.id);
      expect(purchase.price_at_purchase).toBe(19900);
      expect(purchase.status).toBe('ACTIVE');

      // Verify individual tool purchases were created
      const toolPurchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });

      expect(toolPurchases).toHaveLength(2);
      expect(toolPurchases.every((p) => p.price_at_purchase === 0)).toBe(true);
    });

    it('should create individual tool access from bundle', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'CRM Tool',
          description: 'Customer management',
          category: ToolCategory.FOUNDATION,
          tier: ToolTier.T1,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Analytics Tool',
          description: 'Business insights',
          category: ToolCategory.GROWTH,
          tier: ToolTier.T2,
          price: 14900,
          is_active: true,
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Business Bundle',
          description: 'CRM + Analytics',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 19900,
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      await purchaseBundle({
        bundle_id: bundle.id,
        organization_id: organization.id,
      });

      // Verify tool purchases exist
      const crmPurchase = await testPrisma.tool_purchases.findFirst({
        where: {
          tool_id: tool1.id,
          organization_id: organization.id,
        },
      });

      const analyticsPurchase = await testPrisma.tool_purchases.findFirst({
        where: {
          tool_id: tool2.id,
          organization_id: organization.id,
        },
      });

      expect(crmPurchase).toBeDefined();
      expect(analyticsPurchase).toBeDefined();
    });

    it('should not duplicate tool purchase if already owned', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool1 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 1',
          description: 'Already owned',
          category: ToolCategory.FOUNDATION,
          tier: ToolTier.T1,
          price: 9900,
          is_active: true,
        },
      });

      const tool2 = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'New tool',
          category: ToolCategory.GROWTH,
          tier: ToolTier.T2,
          price: 14900,
          is_active: true,
        },
      });

      // Create existing purchase for tool1
      await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool1.id,
          organization_id: organization.id,
          purchased_by: user.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
        },
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Bundle',
          description: 'Contains owned tool',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 19900,
          is_active: true,
        },
      });

      await testPrisma.bundle_tools.createMany({
        data: [
          { bundle_id: bundle.id, tool_id: tool1.id },
          { bundle_id: bundle.id, tool_id: tool2.id },
        ],
      });

      await purchaseBundle({
        bundle_id: bundle.id,
        organization_id: organization.id,
      });

      // Should still only have 2 tool purchases total (1 existing + 1 new)
      const toolPurchases = await testPrisma.tool_purchases.findMany({
        where: { organization_id: organization.id },
      });

      expect(toolPurchases).toHaveLength(2);
    });

    it('should reject inactive bundles', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Inactive Bundle',
          description: 'Not available',
          bundle_type: BundleType.CUSTOM_PACK,
          original_price: 29900,
          discount: 25,
          bundle_price: 9900,
          is_active: false,
        },
      });

      await expect(
        purchaseBundle({
          bundle_id: bundle.id,
          organization_id: organization.id,
        })
      ).rejects.toThrow('Bundle not found or inactive');
    });

    it('should track bundle price at time of purchase', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const bundle = await testPrisma.tool_bundles.create({
        data: {
          name: 'Price Test Bundle',
          description: 'Price changes',
          bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      const purchase = await purchaseBundle({
        bundle_id: bundle.id,
        organization_id: organization.id,
      });

      expect(purchase.price_at_purchase).toBe(14900);

      // Update bundle price
      await testPrisma.tool_bundles.update({
        where: { id: bundle.id },
        data: { bundle_price: 24900 },
      });

      // Original purchase should still have old price
      const dbPurchase = await testPrisma.bundle_purchases.findFirst({
        where: { bundle_id: bundle.id, organization_id: organization.id },
      });

      expect(dbPurchase?.price_at_purchase).toBe(14900);
    });

    it('should enforce RBAC permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      mockFunction(canAccessMarketplace).mockReturnValue(false);

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

      await expect(
        purchaseBundle({
          bundle_id: bundle.id,
          organization_id: organization.id,
        })
      ).rejects.toThrow('Unauthorized');

      // Reset and test purchase permission
      mockFunction(canAccessMarketplace).mockReturnValue(true);
      mockFunction(canPurchaseTools).mockReturnValue(false);

      await expect(
        purchaseBundle({
          bundle_id: bundle.id,
          organization_id: organization.id,
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getPurchasedBundles', () => {
    it('should return organization purchased bundles', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const bundle1 = await testPrisma.tool_bundles.create({
        data: {
          name: 'Bundle 1',
          description: 'First bundle',
          bundle_type: BundleType.STARTER_PACK,
          original_price: 19900,
          discount: 20,
          bundle_price: 14900,
          is_active: true,
        },
      });

      const bundle2 = await testPrisma.tool_bundles.create({
        data: {
          name: 'Bundle 2',
          description: 'Second bundle',
          bundle_type: BundleType.GROWTH_PACK,
          original_price: 39900,
          discount: 20,
          bundle_price: 39900,
          is_active: true,
        },
      });

      await testPrisma.bundle_purchases.createMany({
        data: [
          {
            bundle_id: bundle1.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 14900,
            status: 'ACTIVE',
          },
          {
            bundle_id: bundle2.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 39900,
            status: 'ACTIVE',
          },
        ],
      });

      const purchases = await getPurchasedBundles();

      expect(purchases).toHaveLength(2);
      expect(purchases[0].bundle.name).toBe('Bundle 2'); // Ordered by purchase_date desc
      expect(purchases[1].bundle.name).toBe('Bundle 1');
    });

    it('should only return ACTIVE purchases', async () => {
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

      await testPrisma.bundle_purchases.createMany({
        data: [
          {
            bundle_id: bundle.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 14900,
            status: 'ACTIVE',
          },
          {
            bundle_id: bundle.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 14900,
            status: 'CANCELLED',
          },
        ],
      });

      const purchases = await getPurchasedBundles();

      expect(purchases).toHaveLength(1);
      expect(purchases[0].status).toBe('ACTIVE');
    });

    it('should enforce multi-tenant isolation', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
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

      // Purchase in org2
      await testPrisma.bundle_purchases.create({
        data: {
          bundle_id: bundle.id,
          organization_id: org2.id,
          purchased_by: user1.id,
          price_at_purchase: 14900,
          status: 'ACTIVE',
        },
      });

      // User from org1 shouldn't see org2's purchases
      const purchases = await getPurchasedBundles();
      expect(purchases).toHaveLength(0);
    });
  });
});
