import { z } from 'zod';
import { AIToolCategory, ComplexityLevel } from '@prisma/client';

/**
 * Tool Blueprint Schemas
 *
 * Validation schemas for tool blueprint visual programming functionality
 * Supports component-based tool building with connections and configurations
 */

/**
 * Create Blueprint Schema
 *
 * Validates input when creating a new tool blueprint
 * Multi-tenant: organizationId included in data
 */
export const createBlueprintSchema = z.object({
  // Basic information
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.nativeEnum(AIToolCategory),

  // Visual programming data (stored as JSON)
  components: z.record(z.string(), z.any()).default({}),
  connections: z.record(z.string(), z.any()).default({}),
  configuration: z.record(z.string(), z.any()).default({}),

  // Blueprint metadata
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z').default('1.0.0'),
  tags: z.array(z.string()).default([]),
  complexity: z.nativeEnum(ComplexityLevel),

  // Visibility control
  is_public: z.boolean().default(false),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Update Blueprint Schema
 * All fields optional except ID
 */
export const updateBlueprintSchema = createBlueprintSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Blueprint Filters Schema
 *
 * For marketplace browsing and searching
 * Supports filtering by category, public status, complexity, tags, etc.
 */
export const blueprintFiltersSchema = z.object({
  // Category filter
  category: z.nativeEnum(AIToolCategory).optional(),

  // Visibility filters
  is_public: z.boolean().optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Complexity filter
  complexity: z.nativeEnum(ComplexityLevel).optional(),

  // Popularity filter (minimum usage count)
  min_usage_count: z.number().int().nonnegative().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'usage_count', 'name']).default('usage_count'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Clone Blueprint Schema
 *
 * Validates input when cloning an existing blueprint
 */
export const cloneBlueprintSchema = z.object({
  blueprint_id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(), // Optional custom name
  organization_id: z.string().uuid(),
});

/**
 * Blueprint Statistics Schema
 *
 * For tracking blueprint usage and performance
 */
export const blueprintStatsSchema = z.object({
  blueprint_id: z.string().uuid(),
  total_usage: z.number().int().nonnegative(),
  total_clones: z.number().int().nonnegative(),
  unique_users: z.number().int().nonnegative(),
});

// Export types
export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;
export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>;
export type BlueprintFilters = z.infer<typeof blueprintFiltersSchema>;
export type CloneBlueprintInput = z.infer<typeof cloneBlueprintSchema>;
export type BlueprintStats = z.infer<typeof blueprintStatsSchema>;
