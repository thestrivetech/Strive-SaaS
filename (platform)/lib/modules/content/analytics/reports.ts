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
        Title: String(item.title || ''),
        Type: String(item.type || ''),
        'View Count': Number(item.view_count || 0),
        'Share Count': Number(item.share_count || 0),
        'Like Count': Number(item.like_count || 0),
        'Comment Count': Number(item.comment_count || 0),
        'Published At': item.published_at
          ? new Date(item.published_at as Date).toLocaleDateString()
          : 'N/A',
        Category: (item.category as any)?.name || 'Uncategorized',
      }));

    case 'campaigns':
      return data.map((item) => ({
        Name: String(item.name || ''),
        Type: String(item.type || ''),
        Status: String(item.status || ''),
        Impressions: Number(item.impressions || 0),
        Clicks: Number(item.clicks || 0),
        Conversions: Number(item.conversions || 0),
        Spend: Number(item.spend || 0).toFixed(2),
        Revenue: Number(item.revenue || 0).toFixed(2),
        'Start Date': item.start_date ? new Date(item.start_date as Date).toLocaleDateString() : 'N/A',
        'End Date': item.end_date ? new Date(item.end_date as Date).toLocaleDateString() : 'N/A',
      }));

    case 'emails':
      return data.map((item) => ({
        Subject: String(item.subject || ''),
        Sent: Number(item.sent || 0),
        Delivered: Number(item.delivered || 0),
        Opened: Number(item.opened || 0),
        Clicked: Number(item.clicked || 0),
        Bounced: Number(item.bounced || 0),
        Unsubscribed: Number(item.unsubscribed || 0),
        'Sent At': item.sent_at ? new Date(item.sent_at as Date).toLocaleDateString() : 'N/A',
      }));

    default:
      return [] as ExportData[];
  }
}
