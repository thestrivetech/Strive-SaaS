import { z } from 'zod';
import { ToolCategory, ToolTier, BundleType, PurchaseStatus } from '@prisma/client';

/**
 * Marketplace Module - Zod Validation Schemas
 *
 * Complete validation schemas for Tool Marketplace module:
 * - Tool filters for browsing marketplace
 * - Purchase schemas for tools and bundles
 * - Review schemas for tool feedback
 * - Shopping cart schemas for cart operations
 */

/**
 * Tool Filter Schema
 * For querying/filtering marketplace tools
 */
export const toolFiltersSchema = z.object({
  // Category filters
  category: z.union([
    z.nativeEnum(ToolCategory),
    z.array(z.nativeEnum(ToolCategory))
  ]).optional(),

  // Tier filters
  tier: z.union([
    z.nativeEnum(ToolTier),
    z.array(z.nativeEnum(ToolTier))
  ]).optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Price range
  price_min: z.number().int().min(0).optional(),
  price_max: z.number().int().min(0).optional(),

  // Active only
  is_active: z.boolean().default(true),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['name', 'price', 'purchase_count', 'rating', 'created_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Tool Purchase Schema
 * For purchasing a single tool
 */
export const purchaseToolSchema = z.object({
  tool_id: z.string().uuid(),
  organization_id: z.string().uuid(),
});

/**
 * Bundle Purchase Schema
 * For purchasing a bundle
 */
export const purchaseBundleSchema = z.object({
  bundle_id: z.string().uuid(),
  organization_id: z.string().uuid(),
});

/**
 * Tool Review Schema
 * For creating/updating tool reviews
 */
export const createToolReviewSchema = z.object({
  tool_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
  organization_id: z.string().uuid(),
});

/**
 * Shopping Cart Add Item Schema
 */
export const addToCartSchema = z.object({
  item_type: z.enum(['tool', 'bundle']),
  item_id: z.string().uuid(),
});

/**
 * Shopping Cart Remove Item Schema
 */
export const removeFromCartSchema = z.object({
  item_type: z.enum(['tool', 'bundle']),
  item_id: z.string().uuid(),
});

/**
 * Checkout Schema
 * For processing cart checkout
 */
export const checkoutSchema = z.object({
  payment_method: z.enum(['stripe', 'invoice']),
  billing_details: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
  }).optional(),
});

// Export types
export type ToolFilters = z.infer<typeof toolFiltersSchema>;
export type PurchaseToolInput = z.infer<typeof purchaseToolSchema>;
export type PurchaseBundleInput = z.infer<typeof purchaseBundleSchema>;
export type CreateToolReviewInput = z.infer<typeof createToolReviewSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
