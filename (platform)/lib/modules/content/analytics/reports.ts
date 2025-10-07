'use server';

import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { getContentPerformance, getContentTrends } from './content-analytics';
import { getCampaignMetrics, getEmailCampaignMetrics } from './campaign-analytics';

/**
 * Analytics Reports Module - Report Generation
 *
 * Generate comprehensive analytics reports for export.
 */

export interface AnalyticsReport {
  generatedAt: Date;
  organizationId: string;
  content: {
    performance: Awaited<ReturnType<typeof getContentPerformance>>;
    trends: Awaited<ReturnType<typeof getContentTrends>>;
  };
  campaigns: Awaited<ReturnType<typeof getCampaignMetrics>>;
  emails: Awaited<ReturnType<typeof getEmailCampaignMetrics>>;
}

/**
 * Generate comprehensive analytics report
 *
 * @param period - Time period: 'week' | 'month' | 'year'
 * @returns Promise<AnalyticsReport> - Complete analytics report
 */
export async function generateAnalyticsReport(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<AnalyticsReport> {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  // Fetch all analytics data in parallel
  const [contentPerformance, contentTrends, campaignMetrics, emailMetrics] = await Promise.all([
    getContentPerformance(period),
    getContentTrends(6),
    getCampaignMetrics(),
    getEmailCampaignMetrics(),
  ]);

  return {
    generatedAt: new Date(),
    organizationId: organization_id,
    content: {
      performance: contentPerformance,
      trends: contentTrends,
    },
    campaigns: campaignMetrics,
    emails: emailMetrics,
  };
}

type ContentExportItem = {
  Title: string;
  Type: string;
  'View Count': number;
  'Share Count': number;
  'Like Count': number;
  'Comment Count': number;
  'Published At': string;
  Category: string;
};

type CampaignExportItem = {
  Name: string;
  Type: string;
  Status: string;
  Impressions: number;
  Clicks: number;
  Conversions: number;
  Spend: string;
  Revenue: string;
  'Start Date': string;
  'End Date': string;
};

type EmailExportItem = {
  Subject: string;
  Sent: number;
  Delivered: number;
  Opened: number;
  Clicked: number;
  Bounced: number;
  Unsubscribed: number;
  'Sent At': string;
};

type ExportData = ContentExportItem | CampaignExportItem | EmailExportItem;

/**
 * Format analytics data for CSV export
 *
 * @param data - Analytics data array
 * @param type - Export type: 'content' | 'campaigns' | 'emails'
 * @returns Array - Formatted data for CSV export
 */
export async function formatForExport(
  data: Record<string, string | number | Date | null | { name?: string }>[],
  type: 'content' | 'campaigns' | 'emails'
): Promise<ExportData[]> {
  await requireAuth();

  switch (type) {
    case 'content':
      return data.map((item) => ({
        Title: item.title,
        Type: item.type,
        'View Count': item.view_count,
        'Share Count': item.share_count,
        'Like Count': item.like_count,
        'Comment Count': item.comment_count,
        'Published At': item.published_at
          ? new Date(item.published_at).toLocaleDateString()
          : 'N/A',
        Category: item.category?.name || 'Uncategorized',
      }));

    case 'campaigns':
      return data.map((item) => ({
        Name: item.name,
        Type: item.type,
        Status: item.status,
        Impressions: item.impressions,
        Clicks: item.clicks,
        Conversions: item.conversions,
        Spend: Number(item.spend).toFixed(2),
        Revenue: Number(item.revenue).toFixed(2),
        'Start Date': item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A',
        'End Date': item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A',
      }));

    case 'emails':
      return data.map((item) => ({
        Subject: item.subject,
        Sent: item.sent,
        Delivered: item.delivered,
        Opened: item.opened,
        Clicked: item.clicked,
        Bounced: item.bounced,
        Unsubscribed: item.unsubscribed,
        'Sent At': item.sent_at ? new Date(item.sent_at).toLocaleDateString() : 'N/A',
      }));

    default:
      return data;
  }
}
