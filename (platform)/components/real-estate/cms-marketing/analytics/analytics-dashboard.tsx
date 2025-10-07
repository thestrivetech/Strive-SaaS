'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentPerformance } from './content-performance';
import { CampaignMetrics } from './campaign-metrics';
import { EmailMetrics } from './email-metrics';
import { TrendChart } from './trend-chart';
import { Eye, MousePointer, Heart, TrendingUp, DollarSign } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  view_count: number;
  share_count: number;
  like_count: number;
  comment_count: number;
  published_at: Date | null;
  category: { name: string } | null;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number | string | { toNumber: () => number };
  revenue: number | string | { toNumber: () => number };
}

interface EmailCampaign {
  id: string;
  subject: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  sent_at: Date | null;
}

interface TrendData {
  month: string;
  views: number;
  engagement: number;
}

interface AnalyticsDashboardProps {
  contentMetrics: {
    content: ContentItem[];
    metrics: {
      totalViews: number;
      totalShares: number;
      totalLikes: number;
      totalComments: number;
      avgEngagement: number;
      totalPosts: number;
    };
  };
  campaignMetrics: {
    campaigns: Campaign[];
    totals: {
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
    };
    metrics: {
      ctr: string;
      conversionRate: string;
      roi: string;
    };
  };
  emailMetrics: {
    emails: EmailCampaign[];
    totals: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      unsubscribed: number;
    };
    metrics: {
      deliveryRate: string;
      openRate: string;
      clickRate: string;
      bounceRate: string;
    };
  };
  trends: TrendData[];
}

export function AnalyticsDashboard({
  contentMetrics,
  campaignMetrics,
  emailMetrics,
  trends,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={contentMetrics.metrics.totalViews.toLocaleString()}
          icon={Eye}
          description="Content views this period"
        />
        <StatCard
          title="Avg Engagement"
          value={contentMetrics.metrics.avgEngagement.toLocaleString()}
          icon={Heart}
          description="Per content item"
        />
        <StatCard
          title="Campaign ROI"
          value={`${campaignMetrics.metrics.roi}%`}
          icon={DollarSign}
          description="Return on investment"
          trend={Number(campaignMetrics.metrics.roi) > 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Email Open Rate"
          value={`${emailMetrics.metrics.openRate}%`}
          icon={MousePointer}
          description="Average email performance"
          trend={Number(emailMetrics.metrics.openRate) > 20 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Content views and engagement over the last 6 months
          </p>
        </CardHeader>
        <CardContent>
          <TrendChart data={trends} />
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="emails">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <ContentPerformance data={contentMetrics.content} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignMetrics data={campaignMetrics.campaigns} />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailMetrics data={emailMetrics.emails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {trend === 'positive' && (
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            )}
            {trend === 'negative' && (
              <TrendingUp className="h-3 w-3 mr-1 text-red-600 rotate-180" />
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
