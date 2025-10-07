'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { cache } from 'react';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Campaign Analytics Module - Campaign & Email Performance Queries
 *
 * All queries enforce multi-tenancy via organizationId filtering.
 * Uses React cache() for request-level memoization.
 */

/**
 * Calculate campaign metrics
 */
function calculateCampaignMetrics(totals: {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}) {
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;

  return {
    ctr: ctr.toFixed(2),
    conversionRate: conversionRate.toFixed(2),
    roi: roi.toFixed(2),
  };
}

/**
 * Get campaign metrics with ROI and performance data
 *
 * @returns Promise<object> - Campaign metrics, totals, and ROI calculations
 */
export const getCampaignMetrics = cache(async () => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const campaigns = await prisma.campaigns.findMany({
    where: { organization_id },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      impressions: true,
      clicks: true,
      conversions: true,
      spend: true,
      revenue: true,
      start_date: true,
      end_date: true,
    },
  });

  const totals = campaigns.reduce(
    (acc, campaign) => ({
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
      spend: acc.spend + Number(campaign.spend),
      revenue: acc.revenue + Number(campaign.revenue),
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
  );

  return {
    campaigns,
    totals,
    metrics: calculateCampaignMetrics(totals),
  };
});

/**
 * Calculate email metrics
 */
function calculateEmailMetrics(totals: {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}) {
  const deliveryRate = totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 0;
  const openRate = totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0;
  const clickRate = totals.delivered > 0 ? (totals.clicked / totals.delivered) * 100 : 0;
  const bounceRate = totals.sent > 0 ? (totals.bounced / totals.sent) * 100 : 0;

  return {
    deliveryRate: deliveryRate.toFixed(2),
    openRate: openRate.toFixed(2),
    clickRate: clickRate.toFixed(2),
    bounceRate: bounceRate.toFixed(2),
  };
}

/**
 * Get email campaign metrics with delivery and engagement rates
 *
 * @returns Promise<object> - Email campaign metrics with rates
 */
export const getEmailCampaignMetrics = cache(async () => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const emails = await prisma.email_campaigns.findMany({
    where: { organization_id, status: 'SENT' },
    select: {
      id: true,
      subject: true,
      sent: true,
      delivered: true,
      opened: true,
      clicked: true,
      bounced: true,
      unsubscribed: true,
      sent_at: true,
    },
  });

  const totals = emails.reduce(
    (acc, email) => ({
      sent: acc.sent + email.sent,
      delivered: acc.delivered + email.delivered,
      opened: acc.opened + email.opened,
      clicked: acc.clicked + email.clicked,
      bounced: acc.bounced + email.bounced,
      unsubscribed: acc.unsubscribed + email.unsubscribed,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }
  );

  return {
    emails,
    totals,
    metrics: calculateEmailMetrics(totals),
  };
});

/**
 * Get campaign performance trends over time
 *
 * @param months - Number of months to retrieve (default: 6)
 * @returns Promise<Array> - Monthly campaign performance data
 */
export const getCampaignTrends = cache(async (months: number = 6) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const trends = [];

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const metrics = await prisma.campaigns.aggregate({
      where: {
        organization_id,
        created_at: { gte: start, lte: end },
      },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
        revenue: true,
      },
    });

    trends.unshift({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      impressions: metrics._sum.impressions || 0,
      clicks: metrics._sum.clicks || 0,
      conversions: metrics._sum.conversions || 0,
      spend: Number(metrics._sum.spend || 0),
      revenue: Number(metrics._sum.revenue || 0),
    });
  }

  return trends;
});

/**
 * Get top performing campaigns
 *
 * @param metric - Metric to sort by: 'revenue' | 'conversions' | 'roi'
 * @returns Promise<Array> - Top 10 campaigns
 */
export const getTopCampaigns = cache(async (metric: 'revenue' | 'conversions' | 'roi' = 'revenue') => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const campaigns = await prisma.campaigns.findMany({
    where: {
      organization_id,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
    select: {
      id: true,
      name: true,
      type: true,
      impressions: true,
      clicks: true,
      conversions: true,
      spend: true,
      revenue: true,
    },
    take: 10,
  });

  // Calculate ROI and sort
  const campaignsWithRoi = campaigns.map((campaign) => {
    const spend = Number(campaign.spend);
    const revenue = Number(campaign.revenue);
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

    return {
      ...campaign,
      roi,
    };
  });

  // Sort by selected metric
  campaignsWithRoi.sort((a, b) => {
    if (metric === 'revenue') return Number(b.revenue) - Number(a.revenue);
    if (metric === 'conversions') return b.conversions - a.conversions;
    return b.roi - a.roi;
  });

  return campaignsWithRoi.slice(0, 10);
});
