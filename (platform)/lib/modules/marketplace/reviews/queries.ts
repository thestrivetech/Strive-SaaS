import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';

/**
 * Marketplace Reviews Queries Module
 *
 * SECURITY:
 * - Reviews are public (visible to all users)
 * - But only users who purchased the tool can create/update/delete reviews
 * - Multi-tenancy isolation for user's own reviews
 */

export type ReviewWithReviewer = Prisma.tool_reviewsGetPayload<{
  include: {
    reviewer: {
      select: {
        id: true;
        name: true;
        avatar_url: true;
      };
    };
  };
}>;

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFilters {
  rating?: number;
  sort_by?: 'rating' | 'created_at';
  sort_order?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

/**
 * Get all reviews for a specific tool
 *
 * @param toolId - Tool ID
 * @param filters - Optional filters for pagination and sorting
 * @returns List of reviews with reviewer information
 */
export async function getToolReviews(
  toolId: string,
  filters?: ReviewFilters
): Promise<ReviewWithReviewer[]> {
  try {
    const where: Prisma.tool_reviewsWhereInput = {
      tool_id: toolId,
    };

    // Rating filter
    if (filters?.rating) {
      where.rating = filters.rating;
    }

    // Sorting
    const orderBy: Prisma.tool_reviewsOrderByWithRelationInput = {};
    if (filters?.sort_by === 'rating') {
      orderBy.rating = filters?.sort_order || 'desc';
    } else {
      orderBy.created_at = filters?.sort_order || 'desc';
    }

    return await prisma.tool_reviews.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy,
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Reviews Queries] getToolReviews failed:', dbError);
    throw error;
  }
}

/**
 * Get a specific user's review for a tool
 * Used to check if user has already reviewed a tool
 *
 * @param toolId - Tool ID
 * @param userId - User ID (defaults to current user from tenant context)
 * @returns User's review or null
 */
export async function getUserReviewForTool(
  toolId: string,
  userId?: string
): Promise<ReviewWithReviewer | null> {
  return withTenantContext(async () => {
    try {
      // Get current user if userId not provided
      if (!userId) {
        const { requireAuth } = await import('@/lib/auth/auth-helpers');
        const user = await requireAuth();
        userId = user.id;
      }
      const reviewerId = userId;

      return await prisma.tool_reviews.findFirst({
        where: {
          tool_id: toolId,
          reviewer_id: reviewerId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Reviews Queries] getUserReviewForTool failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get review statistics for a tool
 * Calculates average rating and rating distribution
 *
 * @param toolId - Tool ID
 * @returns Review stats including average rating and distribution
 */
export async function getReviewStats(toolId: string): Promise<ReviewStats> {
  try {
    const reviews = await prisma.tool_reviews.findMany({
      where: { tool_id: toolId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review: { rating: number }) => {
      ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingDistribution,
    };
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Reviews Queries] getReviewStats failed:', dbError);
    throw error;
  }
}

/**
 * Get all reviews by a specific user
 *
 * @param userId - User ID (defaults to current user)
 * @returns List of user's reviews
 */
export async function getUserReviews(
  userId?: string
): Promise<ReviewWithReviewer[]> {
  return withTenantContext(async () => {
    try {
      // Get current user if userId not provided
      if (!userId) {
        const { requireAuth } = await import('@/lib/auth/auth-helpers');
        const user = await requireAuth();
        userId = user.id;
      }
      const reviewerId = userId;

      return await prisma.tool_reviews.findMany({
        where: {
          reviewer_id: reviewerId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Reviews Queries] getUserReviews failed:', dbError);
      throw error;
    }
  });
}

/**
 * Check if user has purchased a tool (required to review)
 *
 * @param toolId - Tool ID
 * @param userId - User ID (defaults to current user)
 * @returns True if user has purchased the tool
 */
export async function hasUserPurchasedTool(
  toolId: string,
  userId?: string
): Promise<boolean> {
  return withTenantContext(async () => {
    try {
      // Get current user if userId not provided
      if (!userId) {
        const { requireAuth } = await import('@/lib/auth/auth-helpers');
        const user = await requireAuth();
        userId = user.id;
      }
      const purchaserId = userId;

      const purchase = await prisma.tool_purchases.findFirst({
        where: {
          tool_id: toolId,
          purchaser_id: purchaserId,
          status: 'ACTIVE',
        },
      });

      return !!purchase;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Reviews Queries] hasUserPurchasedTool failed:', dbError);
      throw error;
    }
  });
}
