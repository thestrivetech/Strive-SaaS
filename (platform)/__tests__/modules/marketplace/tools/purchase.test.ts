/**
 * Marketplace Tools Purchase Tests
 * Tests for tool purchasing functionality
 */

import { createTestOrgWithUser } from '@/__tests__/utils/test-helpers';
import { purchaseTool } from '@/lib/modules/marketplace/actions';
import {
  setupMarketplaceToolsTests,
  testPrisma,
  getCurrentUser,
  canAccessMarketplace,
  canPurchaseTools,
  ToolCategory,
  ToolTier,
} from './setup';

setupMarketplaceToolsTests();

describe('purchaseTool', () => {
  it('should purchase tool successfully', async () => {
    const { organization, user } = await createTestOrgWithUser();

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

    await testPrisma.marketplace_tools.update({
      where: { id: tool.id },
      data: { price: 14900 },
    });

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

    getCurrentUser.mockResolvedValue({
      ...user,
      organization_members: [{ organization_id: organization.id }],
    });

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

    canAccessMarketplace.mockReturnValue(true);
    canPurchaseTools.mockReturnValue(false);

    await expect(
      purchaseTool({ tool_id: tool.id, organization_id: organization.id })
    ).rejects.toThrow('Unauthorized');
  });
});
