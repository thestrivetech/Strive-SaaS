/**
 * Marketplace Tools Test Suite
 * Tests for Tool browsing, purchasing, and management with multi-tenant isolation
 *
 * Coverage: getMarketplaceTools, purchaseTool, getToolPurchase, getPurchasedTools
 */

import { ToolCategory, ToolTier, PurchaseStatus, UserRole } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  createTestUser,
  createOrganizationMember,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  getMarketplaceTools,
  getMarketplaceToolById,
  getPurchasedTools,
  getToolPurchase,
} from '@/lib/modules/marketplace/queries';
import { purchaseTool, trackToolUsage } from '@/lib/modules/marketplace/actions';
import type { OrgRole } from '@prisma/client';

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

describe('Marketplace Tools Module', () => {
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

  describe('getMarketplaceTools', () => {
    it('should return all active marketplace tools', async () => {
      // Create test tools
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'CRM Tool',
            description: 'Customer relationship management',
            category: ToolCategory.CRM,
            tier: ToolTier.GROWTH,
            price: 9900,
            is_active: true,
            purchase_count: 50,
            rating: 4.5,
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Analytics Tool',
            description: 'Business analytics and insights',
            category: ToolCategory.ANALYTICS,
            tier: ToolTier.ELITE,
            price: 19900,
            is_active: true,
            purchase_count: 30,
            rating: 4.8,
          },
          {
            id: '00000000-0000-0000-0000-000000000003',
            name: 'Inactive Tool',
            description: 'This tool is inactive',
            category: ToolCategory.AUTOMATION,
            tier: ToolTier.STARTER,
            price: 4900,
            is_active: false,
            purchase_count: 5,
            rating: 3.0,
          },
        ],
      });

      const tools = await getMarketplaceTools();

      expect(tools).toHaveLength(2); // Only active tools
      expect(tools[0].name).toBe('CRM Tool');
      expect(tools[1].name).toBe('Analytics Tool');
    });

    it('should filter tools by category', async () => {
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            name: 'CRM Tool',
            description: 'CRM',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 9900,
            is_active: true,
          },
          {
            name: 'Marketing Tool',
            description: 'Marketing automation',
            category: ToolCategory.MARKETING,
            tier: ToolTier.GROWTH,
            price: 14900,
            is_active: true,
          },
        ],
      });

      const crmTools = await getMarketplaceTools({ category: ToolCategory.CRM });

      expect(crmTools).toHaveLength(1);
      expect(crmTools[0].category).toBe(ToolCategory.CRM);
    });

    it('should filter tools by tier', async () => {
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            name: 'Starter Tool',
            description: 'Basic features',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 4900,
            is_active: true,
          },
          {
            name: 'Elite Tool',
            description: 'Advanced features',
            category: ToolCategory.CRM,
            tier: ToolTier.ELITE,
            price: 29900,
            is_active: true,
          },
        ],
      });

      const eliteTools = await getMarketplaceTools({ tier: ToolTier.ELITE });

      expect(eliteTools).toHaveLength(1);
      expect(eliteTools[0].tier).toBe(ToolTier.ELITE);
    });

    it('should filter tools by price range', async () => {
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            name: 'Cheap Tool',
            description: 'Affordable',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 2900,
            is_active: true,
          },
          {
            name: 'Mid Tool',
            description: 'Medium price',
            category: ToolCategory.CRM,
            tier: ToolTier.GROWTH,
            price: 9900,
            is_active: true,
          },
          {
            name: 'Expensive Tool',
            description: 'Premium',
            category: ToolCategory.CRM,
            tier: ToolTier.ELITE,
            price: 49900,
            is_active: true,
          },
        ],
      });

      const midRangeTools = await getMarketplaceTools({
        price_min: 5000,
        price_max: 15000,
      });

      expect(midRangeTools).toHaveLength(1);
      expect(midRangeTools[0].price).toBe(9900);
    });

    it('should search tools by name and description', async () => {
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            name: 'CRM Master',
            description: 'Best CRM on the market',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 9900,
            is_active: true,
          },
          {
            name: 'Marketing Automation',
            description: 'Automate your marketing campaigns',
            category: ToolCategory.MARKETING,
            tier: ToolTier.GROWTH,
            price: 14900,
            is_active: true,
          },
        ],
      });

      const crmResults = await getMarketplaceTools({ search: 'CRM' });

      expect(crmResults).toHaveLength(1);
      expect(crmResults[0].name).toContain('CRM');
    });

    it('should sort tools by purchase count (default)', async () => {
      await testPrisma.marketplace_tools.createMany({
        data: [
          {
            name: 'Less Popular',
            description: 'Tool 1',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 9900,
            is_active: true,
            purchase_count: 10,
          },
          {
            name: 'Most Popular',
            description: 'Tool 2',
            category: ToolCategory.CRM,
            tier: ToolTier.STARTER,
            price: 9900,
            is_active: true,
            purchase_count: 100,
          },
        ],
      });

      const tools = await getMarketplaceTools();

      expect(tools[0].name).toBe('Most Popular');
      expect(tools[1].name).toBe('Less Popular');
    });

    it('should paginate results', async () => {
      // Create 60 tools
      const toolsData = Array.from({ length: 60 }, (_, i) => ({
        name: `Tool ${i + 1}`,
        description: `Description ${i + 1}`,
        category: ToolCategory.CRM,
        tier: ToolTier.STARTER,
        price: 9900,
        is_active: true,
      }));

      await testPrisma.marketplace_tools.createMany({ data: toolsData });

      const firstPage = await getMarketplaceTools({ limit: 20, offset: 0 });
      const secondPage = await getMarketplaceTools({ limit: 20, offset: 20 });

      expect(firstPage).toHaveLength(20);
      expect(secondPage).toHaveLength(20);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });
  });

  describe('getMarketplaceToolById', () => {
    it('should return tool with reviews', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool with reviews',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Create a review
      await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user.id,
          organization_id: organization.id,
          rating: 5,
          review: 'Excellent tool!',
        },
      });

      const result = await getMarketplaceToolById(tool.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Tool');
      expect(result?.reviews).toHaveLength(1);
      expect(result?.reviews[0].rating).toBe(5);
    });

    it('should return null for non-existent tool', async () => {
      const result = await getMarketplaceToolById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('purchaseTool', () => {
    it('should purchase tool successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Premium CRM',
          description: 'Advanced CRM features',
          category: ToolCategory.CRM,
          tier: ToolTier.GROWTH,
          price: 14900,
          is_active: true,
        },
      });

      const purchase = await purchaseTool({ tool_id: tool.id, organization_id: organization.id });

      expect(purchase).toBeDefined();
      expect(purchase.tool_id).toBe(tool.id);
      expect(purchase.organization_id).toBe(organization.id);
      expect(purchase.purchased_by).toBe(user.id);
      expect(purchase.price_at_purchase).toBe(14900);
      expect(purchase.status).toBe('ACTIVE');

      // Verify purchase exists in database
      const dbPurchase = await testPrisma.tool_purchases.findUnique({
        where: {
          tool_id_organization_id: {
            tool_id: tool.id,
            organization_id: organization.id,
          },
        },
      });
      expect(dbPurchase).toBeDefined();
    });

    it('should prevent duplicate purchases', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool to purchase',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      // Create existing purchase
      await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool.id,
          organization_id: organization.id,
          purchased_by: user.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
        },
      });

      await expect(
        purchaseTool({ tool_id: tool.id, organization_id: organization.id })
      ).rejects.toThrow('Tool already purchased');
    });

    it('should track purchase price at time of purchase', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Price Test Tool',
          description: 'Tool with changing price',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
        },
      });

      const purchase = await purchaseTool({ tool_id: tool.id, organization_id: organization.id });

      expect(purchase.price_at_purchase).toBe(9900);

      // Update tool price
      await testPrisma.marketplace_tools.update({
        where: { id: tool.id },
        data: { price: 14900 },
      });

      // Original purchase should still have old price
      const dbPurchase = await testPrisma.tool_purchases.findUnique({
        where: {
          tool_id_organization_id: {
            tool_id: tool.id,
            organization_id: organization.id,
          },
        },
      });
      expect(dbPurchase?.price_at_purchase).toBe(9900);
    });

    it('should reject inactive tools', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Inactive Tool',
          description: 'Not available',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: false,
        },
      });

      await expect(
        purchaseTool({ tool_id: tool.id, organization_id: organization.id })
      ).rejects.toThrow('Tool not found or inactive');
    });

    it('should enforce RBAC permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const { canAccessMarketplace, canPurchaseTools } = require('@/lib/auth/rbac');
      canAccessMarketplace.mockReturnValue(false);

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

      await expect(
        purchaseTool({ tool_id: tool.id, organization_id: organization.id })
      ).rejects.toThrow('Unauthorized');

      // Reset and test purchase permission
      canAccessMarketplace.mockReturnValue(true);
      canPurchaseTools.mockReturnValue(false);

      await expect(
        purchaseTool({ tool_id: tool.id, organization_id: organization.id })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getPurchasedTools', () => {
    it('should return organization purchased tools', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create tools
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

      // Purchase tools
      await testPrisma.tool_purchases.createMany({
        data: [
          {
            tool_id: tool1.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 9900,
            status: 'ACTIVE',
          },
          {
            tool_id: tool2.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 14900,
            status: 'ACTIVE',
          },
        ],
      });

      const purchases = await getPurchasedTools();

      expect(purchases).toHaveLength(2);
      expect(purchases[0].tool.name).toBe('Tool 2'); // Ordered by purchase_date desc
      expect(purchases[1].tool.name).toBe('Tool 1');
    });

    it('should only return ACTIVE purchases', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
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

      // Create active and cancelled purchases
      await testPrisma.tool_purchases.createMany({
        data: [
          {
            tool_id: tool.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 9900,
            status: 'ACTIVE',
          },
          {
            tool_id: tool.id,
            organization_id: organization.id,
            purchased_by: user.id,
            price_at_purchase: 9900,
            status: 'CANCELLED',
          },
        ],
      });

      const purchases = await getPurchasedTools();

      expect(purchases).toHaveLength(1);
      expect(purchases[0].status).toBe('ACTIVE');
    });

    it('should enforce multi-tenant isolation', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
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

      // Purchase in org2
      await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool.id,
          organization_id: org2.id,
          purchased_by: user1.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
        },
      });

      // User from org1 shouldn't see org2's purchases
      const purchases = await getPurchasedTools();
      expect(purchases).toHaveLength(0);
    });
  });

  describe('getToolPurchase', () => {
    it('should return purchase if exists', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
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

      await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool.id,
          organization_id: organization.id,
          purchased_by: user.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
        },
      });

      const purchase = await getToolPurchase(tool.id);

      expect(purchase).toBeDefined();
      expect(purchase?.tool_id).toBe(tool.id);
      expect(purchase?.organization_id).toBe(organization.id);
    });

    it('should return null if not purchased', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
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

      const purchase = await getToolPurchase(tool.id);
      expect(purchase).toBeNull();
    });
  });

  describe('trackToolUsage', () => {
    it('should increment usage count and update last used', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
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

      const purchase = await testPrisma.tool_purchases.create({
        data: {
          tool_id: tool.id,
          organization_id: organization.id,
          purchased_by: user.id,
          price_at_purchase: 9900,
          status: 'ACTIVE',
          usage_count: 5,
        },
      });

      const updated = await trackToolUsage(tool.id);

      expect(updated.usage_count).toBe(6);
      expect(updated.last_used).toBeDefined();
      expect(updated.last_used).toBeInstanceOf(Date);
    });

    it('should throw error if tool not purchased', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
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

      await expect(trackToolUsage(tool.id)).rejects.toThrow('Tool purchase not found');
    });
  });
});
