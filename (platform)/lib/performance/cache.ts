import 'server-only';

import { unstable_cache } from 'next/cache';

/**
 * Caching Utilities
 *
 * This module provides utilities for server-side and client-side caching
 * to improve performance and reduce database/API calls.
 *
 * Features:
 * - Next.js cache wrapper (server-side)
 * - React Query defaults (client-side)
 * - Cache invalidation helpers
 * - TTL (Time To Live) configurations
 */

// ============================================================================
// Server-Side Caching (Next.js unstable_cache)
// ============================================================================

/**
 * Cache Time-To-Live configurations (in seconds)
 */
export const CACHE_TTL = {
  /** 1 minute - For frequently changing data */
  SHORT: 60,
  /** 5 minutes - For moderately changing data */
  MEDIUM: 300,
  /** 1 hour - For stable data */
  LONG: 3600,
  /** 1 day - For rarely changing data */
  VERY_LONG: 86400,
} as const;

/**
 * Create a cached query function
 *
 * Wraps expensive queries with Next.js cache for server-side caching.
 *
 * @param fn - Query function to cache
 * @param keys - Cache keys for invalidation
 * @param options - Cache options
 * @returns Cached query function
 *
 * @example
 * ```typescript
 * export const getCustomers = createCachedQuery(
 *   async (orgId: string) => {
 *     return await prisma.customers.findMany({
 *       where: { organizationId: orgId }
 *     });
 *   },
 *   ['customers'],
 *   { revalidate: CACHE_TTL.MEDIUM, tags: ['customers'] }
 * );
 * ```
 */
export function createCachedQuery<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keys: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
): (...args: TArgs) => Promise<TResult> {
  const { revalidate = CACHE_TTL.MEDIUM, tags = keys } = options;

  return unstable_cache(fn, keys, {
    revalidate,
    tags,
  });
}

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  /** User profile data - changes occasionally */
  user: {
    revalidate: CACHE_TTL.MEDIUM,
    tags: ['user'],
  },
  /** Organization data - changes rarely */
  organization: {
    revalidate: CACHE_TTL.LONG,
    tags: ['organization'],
  },
  /** Customer data - changes frequently */
  customers: {
    revalidate: CACHE_TTL.SHORT,
    tags: ['customers'],
  },
  /** Project data - changes frequently */
  projects: {
    revalidate: CACHE_TTL.SHORT,
    tags: ['projects'],
  },
  /** Analytics data - can be cached longer */
  analytics: {
    revalidate: CACHE_TTL.LONG,
    tags: ['analytics'],
  },
  /** Static content - changes very rarely */
  content: {
    revalidate: CACHE_TTL.VERY_LONG,
    tags: ['content'],
  },
} as const;

// ============================================================================
// Client-Side Caching (React Query)
// ============================================================================

/**
 * React Query default configuration
 *
 * Optimized defaults for server state management.
 *
 * @example
 * ```typescript
 * // In app/layout.tsx or provider
 * import { queryDefaults } from '@/lib/performance/cache';
 *
 * const queryClient = new QueryClient({
 *   defaultOptions: queryDefaults
 * });
 * ```
 */
export const queryDefaults = {
  queries: {
    // How long data is considered fresh (no refetch)
    staleTime: 60 * 1000, // 1 minute

    // How long inactive data stays in cache
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

    // Refetch on window focus
    refetchOnWindowFocus: false,

    // Refetch on network reconnect
    refetchOnReconnect: true,

    // Retry failed requests
    retry: 1,

    // Retry delay
    retryDelay: 1000,
  },
  mutations: {
    // Retry failed mutations
    retry: 0,
  },
} as const;

/**
 * Query configurations for different data types
 */
export const QUERY_CONFIG = {
  /** Real-time data - refetch frequently */
  realtime: {
    staleTime: 0,
    refetchInterval: 5000, // 5 seconds
    refetchOnWindowFocus: true,
  },
  /** User data - moderate freshness */
  user: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  /** Static data - can be stale */
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  /** List data - moderate freshness */
  list: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
} as const;

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * Revalidate cache by tag
 *
 * Use this after mutations to invalidate cached data.
 *
 * @param tag - Cache tag to revalidate
 *
 * @example
 * ```typescript
 * 'use server';
 *
 * import { revalidateTag } from '@/lib/performance/cache';
 *
 * export async function createCustomer(data) {
 *   await prisma.customers.create({ data });
 *
 *   // Invalidate customers cache
 *   await revalidateCacheTag('customers');
 * }
 * ```
 */
export async function revalidateCacheTag(tag: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag);
}

/**
 * Revalidate multiple cache tags
 *
 * @param tags - Array of cache tags to revalidate
 */
export async function revalidateCacheTags(tags: string[]): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  tags.forEach((tag) => revalidateTag(tag));
}

/**
 * Revalidate cache by path
 *
 * @param path - Route path to revalidate
 * @param type - Revalidation type
 *
 * @example
 * ```typescript
 * await revalidatePath('/dashboard/customers');
 * ```
 */
export async function revalidatePath(
  path: string,
  type?: 'page' | 'layout'
): Promise<void> {
  const { revalidatePath: nextRevalidatePath } = await import('next/cache');
  nextRevalidatePath(path, type);
}

// ============================================================================
// Cache Key Generators
// ============================================================================

/**
 * Generate cache key for organization-scoped data
 *
 * @param orgId - Organization ID
 * @param resource - Resource type
 * @param id - Optional resource ID
 * @returns Cache key
 */
export function getOrgCacheKey(
  orgId: string,
  resource: string,
  id?: string
): string[] {
  const keys = ['org', orgId, resource];
  if (id) keys.push(id);
  return keys;
}

/**
 * Generate cache key for user-scoped data
 *
 * @param userId - User ID
 * @param resource - Resource type
 * @param id - Optional resource ID
 * @returns Cache key
 */
export function getUserCacheKey(
  userId: string,
  resource: string,
  id?: string
): string[] {
  const keys = ['user', userId, resource];
  if (id) keys.push(id);
  return keys;
}

/**
 * Generate cache key for global data
 *
 * @param resource - Resource type
 * @param id - Optional resource ID
 * @returns Cache key
 */
export function getGlobalCacheKey(resource: string, id?: string): string[] {
  const keys = ['global', resource];
  if (id) keys.push(id);
  return keys;
}
