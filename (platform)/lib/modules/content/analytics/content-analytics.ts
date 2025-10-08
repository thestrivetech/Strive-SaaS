'use server';

import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { cache } from 'react';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Content Analytics Module - Content Performance Queries
 *
 * All queries enforce multi-tenancy via organizationId filtering.
 * Uses React cache() for request-level memoization.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Request-level caching with React cache()
 * - Parallel query execution with Promise.all()
 * - Database indexes for fast aggregations
 * - Optimized groupBy queries
 */

/**
 * Get start date based on period
 */
function getStartDate(period: 'week' | 'month' | 'year'): Date {
  const now = new Date();
  if (period === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

/**
 * Get content performance metrics for a specific period
 *
 * @param period - Time period: 'week' | 'month' | 'year'
 * @returns Promise<object> - Content metrics and top performing content
 */
export const getContentPerformance = cache(async (period: 'week' | 'month' | 'year' = 'month') => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const startDate = getStartDate(period);

  const content = await prisma.content_items.findMany({
    where: {
      organization_id,
      status: 'PUBLISHED',
      published_at: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      view_count: true,
      share_count: true,
      like_count: true,
      comment_count: true,
      published_at: true,
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      view_count: 'desc',
    },
    take: 20,
  });

  const totalViews = content.reduce((sum, item) => sum + item.view_count, 0);
  const totalShares = content.reduce((sum, item) => sum + item.share_count, 0);
  const totalLikes = content.reduce((sum, item) => sum + item.like_count, 0);
  const totalComments = content.reduce((sum, item) => sum + item.comment_count, 0);
  const avgEngagement =
    content.length > 0 ? (totalLikes + totalShares + totalComments) / content.length : 0;

  return {
    content,
    metrics: {
      totalViews,
      totalShares,
      totalLikes,
      totalComments,
      avgEngagement: Math.round(avgEngagement),
      totalPosts: content.length,
    },
  };
});

/**
 * Get content trends over time (monthly data)
 *
 * @param months - Number of months to retrieve (default: 6)
 * @returns Promise<Array> - Monthly trend data for views and engagement
 *
 * PERFORMANCE OPTIMIZATION:
 * - Parallelized monthly queries with Promise.all()
 * - Uses idx_content_published index for fast date filtering
 * - Request-level cache reduces redundant queries
 */
export const getContentTrends = cache(async (months: number = 6) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  // ✅ PERFORMANCE FIX: Parallel execution instead of sequential loop
  const monthlyQueries = Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    return Promise.all([
      prisma.content_items.aggregate({
        where: {
          organization_id,
          published_at: { gte: start, lte: end },
        },
        _sum: { view_count: true },
      }),
      prisma.content_items.aggregate({
        where: {
          organization_id,
          published_at: { gte: start, lte: end },
        },
        _sum: {
          like_count: true,
          share_count: true,
          comment_count: true,
        },
      }),
      Promise.resolve(date.toLocaleString('default', { month: 'short', year: 'numeric' })),
    ]);
  });

  const results = await Promise.all(monthlyQueries);

  // Transform results into trend data
  const trends = results.map(([views, engagement, month]) => ({
    month,
    views: views._sum.view_count || 0,
    engagement:
      (engagement._sum.like_count || 0) +
      (engagement._sum.share_count || 0) +
      (engagement._sum.comment_count || 0),
  }));

  return trends.reverse(); // Oldest to newest
});

/**
 * Get top performing content by views
 *
 * @param type - Optional content type filter
 * @returns Promise<Array> - Top 10 content items
 */
export const getTopPerformingContent = cache(async (type?: string) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const where: Prisma.content_itemsWhereInput = {
    organization_id,
    status: 'PUBLISHED',
  };

  if (type) {
    where.type = type as any;
  }

  return await prisma.content_items.findMany({
    where,
    select: {
      id: true,
      title: true,
      type: true,
      view_count: true,
      share_count: true,
      like_count: true,
      published_at: true,
    },
    orderBy: {
      view_count: 'desc',
    },
    take: 10,
  });
});

/**
 * Get content performance by type
 *
 * @returns Promise<object> - Performance metrics grouped by content type
 */
export const getContentPerformanceByType = cache(async () => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const contentByType = await prisma.content_items.groupBy({
    by: ['type'],
    where: {
      organization_id,
      status: 'PUBLISHED',
    },
    _sum: {
      view_count: true,
      share_count: true,
      like_count: true,
    },
    _count: {
      id: true,
    },
  });

  return contentByType.map((item) => ({
    type: item.type,
    count: item._count.id,
    totalViews: item._sum.view_count || 0,
    totalShares: item._sum.share_count || 0,
    totalLikes: item._sum.like_count || 0,
  }));
});
