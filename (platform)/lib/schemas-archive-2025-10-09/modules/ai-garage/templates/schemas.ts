import { z } from 'zod';
import { AgentCategory } from '@prisma/client';

/**
 * Agent Template Schemas
 *
 * Validation schemas for agent template marketplace functionality
 * Supports system templates, public templates, and private templates
 */

/**
 * Create Template Schema
 *
 * Validates input when creating a new agent template
 * Multi-tenant: organizationId included in data
 */
export const createTemplateSchema = z.object({
  // Basic information
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.nativeEnum(AgentCategory),
  avatar: z.string().url().optional().nullable(),

  // Configuration presets (stored as JSON)
  personality_config: z.record(z.string(), z.any()).default({}),
  model_config: z.record(z.string(), z.any()).default({}),
  tools_config: z.record(z.string(), z.any()).default({}),
  memory_config: z.record(z.string(), z.any()).default({}),

  // Template metadata
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  use_cases: z.array(z.string()).default([]),

  // Visibility control
  is_public: z.boolean().default(false),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Update Template Schema
 * All fields optional except ID
 */
export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Template Filters Schema
 *
 * For marketplace browsing and searching
 * Supports filtering by category, public/system status, rating, tags, etc.
 */
export const templateFiltersSchema = z.object({
  // Category filter
  category: z.nativeEnum(AgentCategory).optional(),

  // Visibility filters
  is_public: z.boolean().optional(),
  is_system: z.boolean().optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Rating filter (minimum rating)
  min_rating: z.number().min(1).max(5).optional(),

  // Popularity filter (minimum usage count)
  min_usage_count: z.number().int().nonnegative().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'usage_count', 'rating', 'name']).default('usage_count'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Create Review Schema
 *
 * Validates input when creating a template review
 */
export const createReviewSchema = z.object({
  template_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional().nullable(),
  organization_id: z.string().uuid(),
});

/**
 * Update Review Schema
 */
export const updateReviewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().max(1000).optional().nullable(),
});

/**
 * Template Statistics Schema
 *
 * For tracking template usage and performance
 */
export const templateStatsSchema = z.object({
  template_id: z.string().uuid(),
  total_usage: z.number().int().nonnegative(),
  avg_rating: z.number().min(0).max(5).nullable(),
  total_reviews: z.number().int().nonnegative(),
  unique_users: z.number().int().nonnegative(),
});

// Export types
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type TemplateStats = z.infer<typeof templateStatsSchema>;
