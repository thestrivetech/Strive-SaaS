'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createToolReviewSchema,
  updateToolReviewSchema,
  deleteToolReviewSchema,
  type CreateToolReviewInput,
  type UpdateToolReviewInput,
  type DeleteToolReviewInput,
} from './schemas';
import { hasUserPurchasedTool } from './queries';

/**
 * Marketplace Reviews Actions Module
 *
 * SECURITY:
 * - Only users who purchased a tool can review it
 * - Users can only create one review per tool (unique constraint)
 * - Users can only update/delete their own reviews
 * - Multi-tenancy isolation via organization_id
 */

/**
 * Create or update a tool review
 * Uses upsert pattern to handle both create and update
 *
 * SECURITY:
 * - Requires authentication
 * - Verifies user has purchased the tool
 * - Unique constraint: (tool_id, reviewer_id)
 *
 * @param input - Review data (tool_id, rating, review text)
 * @returns Created or updated review
 */
export async function createToolReview(input: CreateToolReviewInput) {
  try {
    // Validate input
    const validated = createToolReviewSchema.parse(input);

    // Require authentication
    const user = await requireAuth();
    const userId = user.id;
    const organizationId = user.organizationId;

    // Verify user has purchased the tool
    const hasPurchased = await hasUserPurchasedTool(validated.tool_id, userId);
    if (!hasPurchased) {
      throw new Error('You must purchase this tool before reviewing it');
    }

    // Upsert review (create or update if exists)
    const review = await prisma.tool_reviews.upsert({
      where: {
        // Unique constraint: tool_id + reviewer_id
        tool_id_reviewer_id: {
          tool_id: validated.tool_id,
          reviewer_id: userId,
        },
      },
      update: {
        rating: validated.rating,
        review: validated.review || null,
      },
      create: {
        tool_id: validated.tool_id,
        reviewer_id: userId,
        organization_id: organizationId,
        rating: validated.rating,
        review: validated.review || null,
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

    // Update tool's average rating (denormalized for performance)
    await updateToolAverageRating(validated.tool_id);

    return review;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Reviews Actions] createToolReview failed:', dbError);
    throw new Error('Failed to create review. Please try again.');
  }
}

/**
 * Update an existing review
 *
 * SECURITY:
 * - Requires authentication
 * - Users can only update their own reviews
 *
 * @param input - Review update data
 * @returns Updated review
 */
export async function updateToolReview(input: UpdateToolReviewInput) {
  try {
    // Validate input
    const validated = updateToolReviewSchema.parse(input);

    // Require authentication
    const user = await requireAuth();
    const userId = user.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.tool_reviews.findUnique({
      where: { id: validated.review_id },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.reviewer_id !== userId) {
      throw new Error('You can only update your own reviews');
    }

    // Update review
    const review = await prisma.tool_reviews.update({
      where: { id: validated.review_id },
      data: {
        rating: validated.rating || existingReview.rating,
        review: validated.review !== undefined ? validated.review : existingReview.review,
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

    // Update tool's average rating
    await updateToolAverageRating(existingReview.tool_id);

    return review;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Reviews Actions] updateToolReview failed:', dbError);
    throw new Error('Failed to update review. Please try again.');
  }
}

/**
 * Delete a tool review
 *
 * SECURITY:
 * - Requires authentication
 * - Users can only delete their own reviews
 *
 * @param input - Review ID to delete
 * @returns Deleted review
 */
export async function deleteToolReview(input: DeleteToolReviewInput) {
  try {
    // Validate input
    const validated = deleteToolReviewSchema.parse(input);

    // Require authentication
    const user = await requireAuth();
    const userId = user.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.tool_reviews.findUnique({
      where: { id: validated.review_id },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.reviewer_id !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    // Delete review
    const deletedReview = await prisma.tool_reviews.delete({
      where: { id: validated.review_id },
    });

    // Update tool's average rating
    await updateToolAverageRating(existingReview.tool_id);

    return deletedReview;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Reviews Actions] deleteToolReview failed:', dbError);
    throw new Error('Failed to delete review. Please try again.');
  }
}

/**
 * Update tool's average rating (denormalized field for performance)
 * Called after any review create/update/delete
 *
 * @param toolId - Tool ID
 */
async function updateToolAverageRating(toolId: string) {
  try {
    const reviews = await prisma.tool_reviews.findMany({
      where: { tool_id: toolId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews
        : 0;

    await prisma.marketplace_tools.update({
      where: { id: toolId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      },
    });
  } catch (error) {
    console.error('[Reviews Actions] updateToolAverageRating failed:', error);
    // Don't throw error - this is a background update
  }
}
