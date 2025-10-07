import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getContentPerformance,
  getContentTrends,
  getCampaignMetrics,
  getEmailCampaignMetrics,
  formatForExport,
} from '@/lib/modules/content/analytics';
import { AnalyticsDashboard } from '@/components/real-estate/cms-marketing/analytics/analytics-dashboard';
import { ExportButton } from '@/components/real-estate/cms-marketing/analytics/export-button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Analytics | Content & Marketing',
  description: 'Content and campaign performance insights',
};

export default async function AnalyticsPage() {
  await requireAuth();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Content and campaign performance insights
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-10 w-32" />}>
          <ExportActions />
        </Suspense>
      </div>

      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent() {
  // Fetch all analytics data in parallel
  const [contentMetrics, campaignMetrics, emailMetrics, trends] = await Promise.all([
    getContentPerformance('month'),
    getCampaignMetrics(),
    getEmailCampaignMetrics(),
    getContentTrends(6),
  ]);

  return (
    <AnalyticsDashboard
      contentMetrics={contentMetrics}
      campaignMetrics={campaignMetrics}
      emailMetrics={emailMetrics}
      trends={trends}
    />
  );
}

async function ExportActions() {
  const contentMetrics = await getContentPerformance('month');
  const formattedData = await formatForExport(contentMetrics.content, 'content');

  return (
    <ExportButton
      data={formattedData}
      filename="content-analytics"
      label="Export Analytics"
    />
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
