/**
 * Tool Reviews Test Suite
 * Tests for tool review system with purchase verification
 *
 * Coverage: createToolReview, updateToolReview, deleteToolReview
 */

import { ToolCategory, ToolTier } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  createToolReview,
  updateToolReview,
  deleteToolReview,
} from '@/lib/modules/marketplace/reviews/actions';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock purchase verification
jest.mock('@/lib/modules/marketplace/reviews/queries', () => ({
  hasUserPurchasedTool: jest.fn(),
}));

describe('Tool Reviews Module', () => {
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

  describe('createToolReview', () => {
    it('should create review successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(true);

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Great tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 0,
        },
      });

      const review = await createToolReview({
        tool_id: tool.id,
        rating: 5,
        review: 'Excellent tool! Highly recommended.',
      });

      expect(review).toBeDefined();
      expect(review.tool_id).toBe(tool.id);
      expect(review.reviewer_id).toBe(user.id);
      expect(review.organization_id).toBe(organization.id);
      expect(review.rating).toBe(5);
      expect(review.review).toBe('Excellent tool! Highly recommended.');

      // Verify in database
      const dbReview = await testPrisma.tool_reviews.findUnique({
        where: {
          tool_id_reviewer_id: {
            tool_id: tool.id,
            reviewer_id: user.id,
          },
        },
      });
      expect(dbReview).toBeDefined();
    });

    it('should update tool average rating', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(true);

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 0,
        },
      });

      await createToolReview({
        tool_id: tool.id,
        rating: 5,
        review: 'Great!',
      });

      const updatedTool = await testPrisma.marketplace_tools.findUnique({
        where: { id: tool.id },
      });

      expect(updatedTool?.rating).toBe(5);
    });

    it('should calculate average rating from multiple reviews', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(true);

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 0,
        },
      });

      // First review (rating: 5)
      requireAuth.mockResolvedValue({
        id: user1.id,
        organizationId: organization.id,
      });
      await createToolReview({
        tool_id: tool.id,
        rating: 5,
      });

      // Second review (rating: 3)
      requireAuth.mockResolvedValue({
        id: user2.id,
        organizationId: organization.id,
      });
      await createToolReview({
        tool_id: tool.id,
        rating: 3,
      });

      const updatedTool = await testPrisma.marketplace_tools.findUnique({
        where: { id: tool.id },
      });

      // Average: (5 + 3) / 2 = 4.0
      expect(updatedTool?.rating).toBe(4.0);
    });

    it('should require tool purchase before review', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(false);

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
        createToolReview({
          tool_id: tool.id,
          rating: 5,
        })
      ).rejects.toThrow('You must purchase this tool before reviewing it');
    });

    it('should validate rating between 1 and 5', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(true);

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

      // Rating too low
      await expect(
        createToolReview({
          tool_id: tool.id,
          rating: 0,
        })
      ).rejects.toThrow();

      // Rating too high
      await expect(
        createToolReview({
          tool_id: tool.id,
          rating: 6,
        })
      ).rejects.toThrow();
    });

    it('should use upsert to update existing review', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const { hasUserPurchasedTool } = require('@/lib/modules/marketplace/reviews/queries');
      hasUserPurchasedTool.mockResolvedValue(true);

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

      // Create initial review
      await createToolReview({
        tool_id: tool.id,
        rating: 3,
        review: 'Initial review',
      });

      // Update via create (upsert)
      await createToolReview({
        tool_id: tool.id,
        rating: 5,
        review: 'Updated review',
      });

      // Should still only have 1 review
      const reviews = await testPrisma.tool_reviews.findMany({
        where: { tool_id: tool.id },
      });

      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(5);
      expect(reviews[0].review).toBe('Updated review');
    });
  });

  describe('updateToolReview', () => {
    it('should update existing review', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
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

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user.id,
          organization_id: organization.id,
          rating: 3,
          review: 'Initial review',
        },
      });

      const updated = await updateToolReview({
        review_id: review.id,
        rating: 5,
        review: 'Updated review - much better!',
      });

      expect(updated.rating).toBe(5);
      expect(updated.review).toBe('Updated review - much better!');
    });

    it('should only allow users to update their own reviews', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user2.id,
        organizationId: organization.id,
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

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user1.id,
          organization_id: organization.id,
          rating: 5,
          review: 'User 1 review',
        },
      });

      // User 2 tries to update User 1's review
      await expect(
        updateToolReview({
          review_id: review.id,
          rating: 1,
        })
      ).rejects.toThrow('You can only update your own reviews');
    });

    it('should update tool average rating after update', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 3,
        },
      });

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user.id,
          organization_id: organization.id,
          rating: 3,
        },
      });

      await updateToolReview({
        review_id: review.id,
        rating: 5,
      });

      const updatedTool = await testPrisma.marketplace_tools.findUnique({
        where: { id: tool.id },
      });

      expect(updatedTool?.rating).toBe(5);
    });
  });

  describe('deleteToolReview', () => {
    it('should delete review successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
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

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user.id,
          organization_id: organization.id,
          rating: 5,
        },
      });

      await deleteToolReview({ review_id: review.id });

      const deletedReview = await testPrisma.tool_reviews.findUnique({
        where: { id: review.id },
      });

      expect(deletedReview).toBeNull();
    });

    it('should only allow users to delete their own reviews', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user2.id,
        organizationId: organization.id,
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

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user1.id,
          organization_id: organization.id,
          rating: 5,
        },
      });

      await expect(deleteToolReview({ review_id: review.id })).rejects.toThrow(
        'You can only delete your own reviews'
      );
    });

    it('should update tool average rating after deletion', async () => {
      const { organization, user: user1 } = await createTestOrgWithUser();
      const { user: user2 } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 0,
        },
      });

      // Create 2 reviews
      const review1 = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user1.id,
          organization_id: organization.id,
          rating: 5,
        },
      });

      const review2 = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user2.id,
          organization_id: organization.id,
          rating: 3,
        },
      });

      // Average should be 4.0
      await testPrisma.marketplace_tools.update({
        where: { id: tool.id },
        data: { rating: 4.0 },
      });

      // Delete first review (rating: 5)
      requireAuth.mockResolvedValue({
        id: user1.id,
        organizationId: organization.id,
      });

      await deleteToolReview({ review_id: review1.id });

      const updatedTool = await testPrisma.marketplace_tools.findUnique({
        where: { id: tool.id },
      });

      // Average should now be 3.0 (only review2 remains)
      expect(updatedTool?.rating).toBe(3.0);
    });

    it('should set rating to 0 when last review is deleted', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { requireAuth } = require('@/lib/auth/auth-helpers');
      requireAuth.mockResolvedValue({
        id: user.id,
        organizationId: organization.id,
      });

      const tool = await testPrisma.marketplace_tools.create({
        data: {
          name: 'Test Tool',
          description: 'Tool',
          category: ToolCategory.CRM,
          tier: ToolTier.STARTER,
          price: 9900,
          is_active: true,
          rating: 5,
        },
      });

      const review = await testPrisma.tool_reviews.create({
        data: {
          tool_id: tool.id,
          reviewer_id: user.id,
          organization_id: organization.id,
          rating: 5,
        },
      });

      await deleteToolReview({ review_id: review.id });

      const updatedTool = await testPrisma.marketplace_tools.findUnique({
        where: { id: tool.id },
      });

      expect(updatedTool?.rating).toBe(0);
    });
  });
});
