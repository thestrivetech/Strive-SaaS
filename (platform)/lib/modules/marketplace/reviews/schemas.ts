import { z } from 'zod';

/**
 * Marketplace Reviews Module - Zod Validation Schemas
 *
 * Validation schemas for tool reviews:
 * - Review creation/update (rating required, review text optional)
 * - Review deletion
 * - Helpful/unhelpful voting (future enhancement)
 */

/**
 * Create Tool Review Schema
 * For creating or updating a tool review
 *
 * Requirements:
 * - Rating: 1-5 stars (required)
 * - Review: Optional text (max 2000 characters)
 * - Tool ID: UUID of tool being reviewed
 */
export const createToolReviewSchema = z.object({
  tool_id: z.string().uuid('Invalid tool ID'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  review: z
    .string()
    .max(2000, 'Review cannot exceed 2000 characters')
    .optional()
    .nullable(),
});

/**
 * Update Tool Review Schema
 * For updating an existing review
 */
export const updateToolReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .optional(),
  review: z
    .string()
    .max(2000, 'Review cannot exceed 2000 characters')
    .optional()
    .nullable(),
});

/**
 * Delete Tool Review Schema
 */
export const deleteToolReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
});

/**
 * Review Filter Schema
 * For querying/filtering reviews
 */
export const reviewFiltersSchema = z.object({
  tool_id: z.string().uuid('Invalid tool ID').optional(),
  rating: z.number().int().min(1).max(5).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'rating', 'helpful']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type CreateToolReviewInput = z.infer<typeof createToolReviewSchema>;
export type UpdateToolReviewInput = z.infer<typeof updateToolReviewSchema>;
export type DeleteToolReviewInput = z.infer<typeof deleteToolReviewSchema>;
export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
