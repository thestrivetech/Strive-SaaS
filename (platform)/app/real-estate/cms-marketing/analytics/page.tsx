import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getContentPerformance,
  getContentTrends,
  getCampaignMetrics,
  getEmailCampaignMetrics,
  formatForExport,
} from '@/lib/modules/content/analytics';
import { AnalyticsDashboard } from '@/components/real-estate/cms-marketing/analytics/analytics-dashboard';
import { ExportButton } from '@/components/real-estate/cms-marketing/analytics/export-button';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Eye, Users } from 'lucide-react';

export const metadata = {
  title: 'Analytics | Content & Marketing',
  description: 'Content and campaign performance insights',
};

export default async function AnalyticsPage() {
  await requireAuth();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch all analytics data for hero stats (single fetch, passed to components)
  const [contentMetrics, campaignMetrics, emailMetrics] = await Promise.all([
    getContentPerformance('month'),
    getCampaignMetrics(),
    getEmailCampaignMetrics(),
  ]);

  // Create stats array for ModuleHeroSection
  const heroStats = [
    {
      label: 'Total Views',
      value: (contentMetrics.totalViews || 0).toLocaleString(),
      icon: 'custom' as const,
      customIcon: Eye,
    },
    {
      label: 'Engagement Rate',
      value: `${(contentMetrics.engagementRate || 0)}%`,
      icon: 'custom' as const,
      customIcon: TrendingUp,
    },
    {
      label: 'Active Campaigns',
      value: (campaignMetrics.active || 0).toString(),
      icon: 'custom' as const,
      customIcon: BarChart3,
    },
    {
      label: 'Email Opens',
      value: (emailMetrics.totalOpens || 0).toLocaleString(),
      icon: 'custom' as const,
      customIcon: Users,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <ModuleHeroSection
        user={currentUser}
        moduleName="Analytics"
        moduleDescription="Content and campaign performance insights"
        stats={heroStats}
        showWeather={false}
      />

      {/* Export button below hero */}
      <div className="flex justify-end">
        <Suspense fallback={<Skeleton className="h-10 w-32" />}>
          <ExportActions />
        </Suspense>
      </div>

      {/* Analytics Dashboard */}
      <div>
        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AnalyticsContent
            contentMetrics={contentMetrics}
            campaignMetrics={campaignMetrics}
            emailMetrics={emailMetrics}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function AnalyticsContent({
  contentMetrics,
  campaignMetrics,
  emailMetrics,
}: {
  contentMetrics: any;
  campaignMetrics: any;
  emailMetrics: any;
}) {
  // Only fetch trends since we already have other metrics from parent
  const trends = await getContentTrends(6);

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
          <EnhancedCard key={i} glassEffect="medium" neonBorder="purple" hoverEffect={false}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </EnhancedCard>
        ))}
      </div>

      {/* Chart skeleton */}
      <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={false}>
        <CardContent className="pt-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </EnhancedCard>

      {/* Table skeleton */}
      <EnhancedCard glassEffect="medium" neonBorder="green" hoverEffect={false}>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
