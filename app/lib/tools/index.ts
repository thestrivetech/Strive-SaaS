/**
 * Tools Library - Main Entry Point
 *
 * Comprehensive tool marketplace system organized by industry.
 * Provides lazy-loaded tools, registry, lifecycle management, and access control.
 *
 * @example
 * ```typescript
 * import { getToolsByIndustry, checkToolAccess, enableTool } from '@/lib/tools';
 *
 * // Get all real estate tools
 * const tools = await getToolsByIndustry('real-estate');
 *
 * // Check if organization can access a tool
 * const access = await checkToolAccess({
 *   toolId: 'property-alerts',
 *   industry: 'real-estate',
 *   userTier: 'BASIC',
 *   enabledToolsCount: 2,
 * });
 *
 * if (access.hasAccess) {
 *   // Enable the tool
 *   await enableTool({ tool, organizationId, settings });
 * }
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core types
  Tool,
  ToolMetadata,
  ToolWithIndustry,
  ToolSetting,
  ToolAccessResult,
  ToolLimits,

  // Categorization
  Industry,
  ToolCategory,
  ToolTier,
  ToolStatus,
  ToolImplementation,

  // Filtering & Display
  ToolFilter,
  ToolDisplayOptions,
  ToolSortBy,

  // Registry
  ToolsByIndustry,
  IndustryLoader,
  IndustryLoaders,

  // Organization
  OrganizationToolConfig,
} from './types';

// ============================================================================
// Registry Exports
// ============================================================================

export {
  // Loaders
  loadIndustryTools,
  preloadIndustries,
  clearIndustryCache,
  INDUSTRY_LOADERS,

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
} from './registry';

// ============================================================================
// Manager Exports
// ============================================================================

export {
  // Access control
  checkToolAccess,

  // Lifecycle management
  enableTool,
  disableTool,
  configureTool,

  // Health checks
  checkToolHealth,
  checkMultipleToolsHealth,

  // Settings validation
  validateToolSettings,
  getDefaultToolSettings,
} from './manager';

// ============================================================================
// Constants Exports
// ============================================================================

export {
  // Industry metadata
  INDUSTRY_META,
  INDUSTRIES,
  getIndustryName,

  // Category metadata
  CATEGORY_META,
  getCategoryName,

  // Tier metadata & limits
  TIER_META,
  TOOL_LIMITS,
  TIER_HIERARCHY,
  hasRequiredTier,
  getToolLimit,

  // Status metadata
  STATUS_META,

  // Defaults
  DEFAULT_TOOL_CONFIG,
  MARKETPLACE_DEFAULTS,
  SEARCH_CONFIG,

  // Pricing
  PRICE_FORMAT,
  ADDON_PRICES,
  formatPrice,
} from './constants';
