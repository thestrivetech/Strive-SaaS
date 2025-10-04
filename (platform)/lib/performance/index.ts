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
  DynamicChart,
  DynamicDataTable,
  DynamicModal,
  DynamicEditor,
  DynamicCalendar,
  DynamicCodeEditor,
} from './dynamic-imports.tsx';

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
