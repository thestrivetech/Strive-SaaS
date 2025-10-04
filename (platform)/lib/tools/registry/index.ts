/**
 * Tool Registry - Main Entry Point
 *
 * Central registry for all tools organized by industry.
 * Uses lazy loading to optimize bundle size and performance.
 *
 * @example
 * ```typescript
 * // Get all tools for an industry
 * const realEstateTools = await getToolsByIndustry('real-estate');
 *
 * // Find a specific tool
 * const tool = await getToolById('property-alerts', 'real-estate');
 *
 * // Search across all tools
 * const results = await searchTools('crm');
 *
 * // Get tools with filtering and sorting
 * const { tools, total } = await getToolsWithOptions({
 *   filter: { category: 'lead-management', tier: 'BASIC' },
 *   sortBy: 'name',
 *   limit: 10,
 * });
 * ```
 */

// Re-export loader functions
export {
  loadIndustryTools,
  preloadIndustries,
  clearIndustryCache,
  INDUSTRY_LOADERS,
} from './loaders';

// Re-export helper functions
export {
  // Lookup functions
  getToolsByIndustry,
  getToolById,
  findToolById,
  getAllTools,
  getAvailableIndustries,

  // Filtering & search
  filterTools,
  sortTools,
  paginateTools,
  getToolsWithOptions,

  // Category & tag functions
  getUsedCategories,
  getUsedTags,
  getToolsByCategory,
  getToolsByTier,
  getToolsByStatus,
  searchTools,

  // Dependency functions
  getToolDependencies,
  validateToolDependencies,
} from './helpers';

// Re-export types for convenience
export type {
  Tool,
  ToolWithIndustry,
  ToolMetadata,
  Industry,
  ToolCategory,
  ToolTier,
  ToolFilter,
  ToolDisplayOptions,
  ToolSortBy,
} from '../types';
