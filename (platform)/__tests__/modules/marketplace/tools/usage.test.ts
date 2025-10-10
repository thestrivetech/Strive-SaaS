/**
 * Marketplace Tools Usage Tracking Tests
 * Tests for tool usage tracking functionality
 */

import { createTestOrgWithUser } from '@/__tests__/utils/test-helpers';
import { trackToolUsage } from '@/lib/modules/marketplace/actions';
import {
  setupMarketplaceToolsTests,
  testPrisma,
  getCurrentUser,
  ToolCategory,
  ToolTier,
} from './setup';

setupMarketplaceToolsTests();

describe('trackToolUsage', () => {
  it('should increment usage count and update last used', async () => {
    const { organization, user } = await createTestOrgWithUser();

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
