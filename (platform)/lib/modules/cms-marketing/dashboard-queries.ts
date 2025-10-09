'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { cache } from 'react';
import { contentProvider } from '@/lib/data/providers/content-provider';
import { campaignsProvider } from '@/lib/data/providers/campaigns-provider';

/**
 * CMS & Marketing Dashboard Queries
 *
 * Provides aggregated stats and recent activity for the CMS & Marketing module dashboard.
 * All queries enforce multi-tenancy via organizationId filtering.
 */

export interface CMSDashboardStats {
  totalContent: number;
  publishedContent: number;
  activeCampaigns: number;
  totalViews: number;
}

export interface RecentContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  updated_at: Date;
}

export interface RecentCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: Date;
}

/**
 * Get CMS & Marketing dashboard statistics
 *
 * @returns Promise<CMSDashboardStats> - Aggregated dashboard stats
 */
export const getCMSDashboardStats = cache(async (): Promise<CMSDashboardStats> => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  if (useMocks) {
    // Use mock providers
    const [contentStats, campaignMetrics, totalViews] = await Promise.all([
      contentProvider.getStats(organization_id),
      campaignsProvider.getMetrics(organization_id),
      contentProvider.getTotalViews(organization_id),
    ]);

    return {
      totalContent: contentStats.total,
      publishedContent: contentStats.published,
      activeCampaigns: campaignMetrics.active,
      totalViews,
    };
  }

  // Original Prisma code for production
  const [
    totalContent,
    publishedContent,
    activeCampaigns,
    viewsAggregate,
  ] = await Promise.all([
    // Total content items
    prisma.content_items.count({
      where: { organization_id },
    }),

    // Published content items
    prisma.content_items.count({
      where: {
        organization_id,
        status: 'PUBLISHED',
      },
    }),

    // Active campaigns
    prisma.campaigns.count({
      where: {
        organization_id,
        status: 'ACTIVE',
      },
    }),

    // Total views across all content
    prisma.content_items.aggregate({
      where: { organization_id },
      _sum: { view_count: true },
    }),
  ]);

  return {
    totalContent,
    publishedContent,
    activeCampaigns,
    totalViews: viewsAggregate._sum.view_count || 0,
  };
});

/**
 * Get recent content items (last 5 created/updated)
 *
 * @returns Promise<RecentContentItem[]> - Recent content items
 */
export const getRecentContent = cache(async (): Promise<RecentContentItem[]> => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  if (useMocks) {
    return contentProvider.getRecent(organization_id, 5);
  }

  // Original Prisma code for production
  const items = await prisma.content_items.findMany({
    where: { organization_id },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      updated_at: true,
    },
    orderBy: { updated_at: 'desc' },
    take: 5,
  });

  return items;
});

/**
 * Get recent campaigns (last 5 created)
 *
 * @returns Promise<RecentCampaign[]> - Recent campaigns
 */
export const getRecentCampaigns = cache(async (): Promise<RecentCampaign[]> => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  if (useMocks) {
    return campaignsProvider.getRecent(organization_id, 5);
  }

  // Original Prisma code for production
  const campaigns = await prisma.campaigns.findMany({
    where: { organization_id },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
    take: 5,
  });

  return campaigns;
});
