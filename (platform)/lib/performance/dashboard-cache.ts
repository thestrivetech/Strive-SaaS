/**
 * Dashboard Performance Optimization - Caching Layer
 *
 * Implements React.cache for request deduplication and unstable_cache for server-side caching
 * to optimize expensive metric calculations and reduce database load.
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

/**
 * Cache expensive metric calculations with 5-minute revalidation
 * Use cache tags for granular invalidation
 */
export const getCachedDashboardMetrics = unstable_cache(
  async (organizationId: string) => {
    const { getDashboardMetrics } = await import('@/lib/modules/dashboard');
    return getDashboardMetrics();
  },
  ['dashboard-metrics'],
  {
    revalidate: 300, // 5 minutes
    tags: ['dashboard', 'metrics'],
  }
);

/**
 * Cache recent activities with shorter revalidation (1 minute)
 * Activities change more frequently than metrics
 */
export const getCachedRecentActivities = unstable_cache(
  async (organizationId: string, limit: number = 20) => {
    const { getRecentActivities } = await import('@/lib/modules/dashboard');
    return getRecentActivities(limit);
  },
  ['dashboard-activities'],
  {
    revalidate: 60, // 1 minute
    tags: ['dashboard', 'activities'],
  }
);

/**
 * Cache dashboard widgets with moderate revalidation (2 minutes)
 */
export const getCachedDashboardWidgets = unstable_cache(
  async (organizationId: string) => {
    const { getDashboardWidgets } = await import('@/lib/modules/dashboard');
    return getDashboardWidgets();
  },
  ['dashboard-widgets'],
  {
    revalidate: 120, // 2 minutes
    tags: ['dashboard', 'widgets'],
  }
);

/**
 * Cache quick actions (longer revalidation as they change rarely)
 */
export const getCachedQuickActions = unstable_cache(
  async (organizationId: string) => {
    const { getQuickActions } = await import('@/lib/modules/dashboard');
    return getQuickActions();
  },
  ['dashboard-quick-actions'],
  {
    revalidate: 600, // 10 minutes
    tags: ['dashboard', 'quick-actions'],
  }
);

/**
 * Deduplicate metric calculation requests in a single render pass
 * Uses React.cache for request deduplication
 */
export const getDeduplicatedMetrics = cache(async () => {
  const { getDashboardMetrics } = await import('@/lib/modules/dashboard');
  return getDashboardMetrics();
});

/**
 * Deduplicate activity fetches in a single render pass
 */
export const getDeduplicatedActivities = cache(async (limit: number = 20) => {
  const { getRecentActivities } = await import('@/lib/modules/dashboard');
  return getRecentActivities(limit);
});

/**
 * Cache metric calculation results
 * Expensive aggregations benefit most from caching
 */
export const getCachedMetricCalculation = unstable_cache(
  async (organizationId: string, metricId: string) => {
    const { calculateMetrics } = await import('@/lib/modules/dashboard');
    // Calculate specific metric
    return calculateMetrics(organizationId);
  },
  ['metric-calculation'],
  {
    revalidate: 300, // 5 minutes
    tags: ['metrics', 'calculations'],
  }
);

/**
 * Helper: Invalidate dashboard caches
 * Call this after mutations to dashboard data
 */
export async function invalidateDashboardCache(type?: 'metrics' | 'activities' | 'widgets' | 'quick-actions') {
  const { revalidateTag } = await import('next/cache');

  if (!type) {
    // Invalidate all dashboard caches
    revalidateTag('dashboard');
  } else {
    // Invalidate specific cache
    revalidateTag(type);
  }
}

/**
 * Helper: Preload dashboard data for faster initial render
 * Use in Server Components to start data fetching early
 */
export function preloadDashboardData(organizationId: string) {
  // Start fetching in parallel
  void getCachedDashboardMetrics(organizationId);
  void getCachedRecentActivities(organizationId, 20);
  void getCachedDashboardWidgets(organizationId);
  void getCachedQuickActions(organizationId);
}

/**
 * Usage Example:
 *
 * // In Server Component:
 * import { getCachedDashboardMetrics, preloadDashboardData } from '@/lib/performance/dashboard-cache';
 *
 * export default async function DashboardPage() {
 *   const user = await getCurrentUser();
 *
 *   // Preload all dashboard data in parallel
 *   preloadDashboardData(user.organizationId);
 *
 *   // Fetch cached metrics
 *   const metrics = await getCachedDashboardMetrics(user.organizationId);
 *
 *   return <DashboardView metrics={metrics} />;
 * }
 *
 * // After mutations, invalidate cache:
 * import { invalidateDashboardCache } from '@/lib/performance/dashboard-cache';
 *
 * export async function createDashboardMetric(input: unknown) {
 *   // ... create metric logic
 *
 *   await invalidateDashboardCache('metrics');
 *   revalidatePath('/dashboard');
 * }
 */
