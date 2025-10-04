/**
 * Performance Optimization Utilities
 *
 * Centralized exports for all performance-related utilities.
 *
 * @module lib/performance
 */

// Dynamic imports for code splitting
export {
  createDynamicComponent,
  createDynamicWithSkeleton,
  createDynamicPage,
  preloadComponent,
  // DynamicChart, // Commented out - no default export
  // DynamicDataTable, // Commented out - component doesn't exist
  // DynamicModal, // Commented out - no default export
  // DynamicEditor, // Commented out - component doesn't exist
  // DynamicCalendar, // Commented out - no default export
  // DynamicCodeEditor, // Commented out - component doesn't exist
} from './dynamic-imports';

// Caching utilities
export {
  createCachedQuery,
  revalidateCacheTag,
  revalidateCacheTags,
  revalidatePath,
  getOrgCacheKey,
  getUserCacheKey,
  getGlobalCacheKey,
  CACHE_TTL,
  CACHE_CONFIG,
  queryDefaults,
  QUERY_CONFIG,
} from './cache';
