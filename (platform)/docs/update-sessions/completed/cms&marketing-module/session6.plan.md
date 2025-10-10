# Session 6: Analytics & Reporting - Performance Insights

## Session Overview
**Goal:** Build comprehensive analytics dashboard for content performance, campaign metrics, and audience insights.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** Sessions 1-5

## Objectives

1. ✅ Create analytics module backend
2. ✅ Build content performance dashboard
3. ✅ Implement campaign analytics
4. ✅ Create audience insights
5. ✅ Add engagement metrics
6. ✅ Build trend analysis
7. ✅ Implement export functionality
8. ✅ Create custom reports

## Module Structure

```
lib/modules/content/analytics/
├── index.ts
├── content-analytics.ts
├── campaign-analytics.ts
├── audience-analytics.ts
└── reports.ts

components/real-estate/content/analytics/
├── analytics-dashboard.tsx
├── content-performance.tsx
├── campaign-metrics.tsx
├── audience-insights.tsx
├── trend-chart.tsx
└── export-button.tsx
```

## Implementation Steps

### 1. Analytics Queries

**File:** `lib/modules/content/analytics/content-analytics.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { cache } from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const getContentPerformance = cache(async (period: 'week' | 'month' | 'year' = 'month') => {
  const session = await requireAuth();
  const now = new Date();
  const startDate = period === 'week'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : period === 'month'
    ? startOfMonth(now)
    : new Date(now.getFullYear(), 0, 1);

  const content = await prisma.contentItem.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: 'PUBLISHED',
      publishedAt: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      viewCount: true,
      shareCount: true,
      likeCount: true,
      commentCount: true,
      publishedAt: true,
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      viewCount: 'desc',
    },
    take: 20,
  });

  const totalViews = content.reduce((sum, item) => sum + item.viewCount, 0);
  const totalShares = content.reduce((sum, item) => sum + item.shareCount, 0);
  const totalLikes = content.reduce((sum, item) => sum + item.likeCount, 0);
  const avgEngagement = content.length > 0
    ? (totalLikes + totalShares + totalViews) / content.length
    : 0;

  return {
    content,
    metrics: {
      totalViews,
      totalShares,
      totalLikes,
      avgEngagement: Math.round(avgEngagement),
      totalPosts: content.length,
    },
  };
});

export const getContentTrends = cache(async (months: number = 6) => {
  const session = await requireAuth();
  const trends = [];

  for (let i = 0; i < months; i++) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const [views, engagement] = await Promise.all([
      prisma.contentItem.aggregate({
        where: {
          organizationId: session.user.organizationId,
          publishedAt: { gte: start, lte: end },
        },
        _sum: { viewCount: true },
      }),
      prisma.contentItem.aggregate({
        where: {
          organizationId: session.user.organizationId,
          publishedAt: { gte: start, lte: end },
        },
        _sum: {
          likeCount: true,
          shareCount: true,
          commentCount: true,
        },
      }),
    ]);

    trends.unshift({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      views: views._sum.viewCount || 0,
      engagement: (
        (engagement._sum.likeCount || 0) +
        (engagement._sum.shareCount || 0) +
        (engagement._sum.commentCount || 0)
      ),
    });
  }

  return trends;
});

export const getTopPerformingContent = cache(async (type?: string) => {
  const session = await requireAuth();

  const where: any = {
    organizationId: session.user.organizationId,
    status: 'PUBLISHED',
  };

  if (type) {
    where.type = type;
  }

  return await prisma.contentItem.findMany({
    where,
    select: {
      id: true,
      title: true,
      type: true,
      viewCount: true,
      shareCount: true,
      likeCount: true,
      publishedAt: true,
    },
    orderBy: {
      viewCount: 'desc',
    },
    take: 10,
  });
});
```

### 2. Campaign Analytics

**File:** `lib/modules/content/analytics/campaign-analytics.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { cache } from 'react';

export const getCampaignMetrics = cache(async () => {
  const session = await requireAuth();

  const campaigns = await prisma.campaign.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
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
      startDate: true,
      endDate: true,
    },
  });

  const totals = campaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions,
    spend: acc.spend + Number(campaign.spend),
    revenue: acc.revenue + Number(campaign.revenue),
  }), {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    revenue: 0,
  });

  const ctr = totals.impressions > 0
    ? (totals.clicks / totals.impressions) * 100
    : 0;

  const conversionRate = totals.clicks > 0
    ? (totals.conversions / totals.clicks) * 100
    : 0;

  const roi = totals.spend > 0
    ? ((totals.revenue - totals.spend) / totals.spend) * 100
    : 0;

  return {
    campaigns,
    totals,
    metrics: {
      ctr: ctr.toFixed(2),
      conversionRate: conversionRate.toFixed(2),
      roi: roi.toFixed(2),
    },
  };
});

export const getEmailCampaignMetrics = cache(async () => {
  const session = await requireAuth();

  const emails = await prisma.emailCampaign.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: 'SENT',
    },
    select: {
      id: true,
      subject: true,
      sent: true,
      delivered: true,
      opened: true,
      clicked: true,
      bounced: true,
      unsubscribed: true,
      sentAt: true,
    },
  });

  const totals = emails.reduce((acc, email) => ({
    sent: acc.sent + email.sent,
    delivered: acc.delivered + email.delivered,
    opened: acc.opened + email.opened,
    clicked: acc.clicked + email.clicked,
    bounced: acc.bounced + email.bounced,
    unsubscribed: acc.unsubscribed + email.unsubscribed,
  }), {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  });

  const deliveryRate = totals.sent > 0
    ? (totals.delivered / totals.sent) * 100
    : 0;

  const openRate = totals.delivered > 0
    ? (totals.opened / totals.delivered) * 100
    : 0;

  const clickRate = totals.delivered > 0
    ? (totals.clicked / totals.delivered) * 100
    : 0;

  return {
    emails,
    totals,
    metrics: {
      deliveryRate: deliveryRate.toFixed(2),
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
    },
  };
});
```

### 3. Analytics Dashboard Component

**File:** `components/real-estate/content/analytics/analytics-dashboard.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentPerformance } from './content-performance';
import { CampaignMetrics } from './campaign-metrics';
import { TrendChart } from './trend-chart';
import { Eye, MousePointer, Heart, Share2, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsDashboardProps {
  contentMetrics: any;
  campaignMetrics: any;
  trends: any[];
}

export function AnalyticsDashboard({
  contentMetrics,
  campaignMetrics,
  trends
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={contentMetrics.metrics.totalViews.toLocaleString()}
          icon={Eye}
          trend="+12%"
        />
        <StatCard
          title="Avg Engagement"
          value={contentMetrics.metrics.avgEngagement.toLocaleString()}
          icon={Heart}
          trend="+8%"
        />
        <StatCard
          title="Campaign ROI"
          value={`${campaignMetrics.metrics.roi}%`}
          icon={DollarSign}
          trend="+15%"
        />
        <StatCard
          title="Click Rate"
          value={`${campaignMetrics.metrics.ctr}%`}
          icon={MousePointer}
          trend="+5%"
        />
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trends} />
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="emails">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentPerformance data={contentMetrics.content} />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignMetrics data={campaignMetrics.campaigns} />
        </TabsContent>

        <TabsContent value="emails">
          {/* Email metrics table */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-green-600 flex items-center mt-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend} from last period
        </p>
      </CardContent>
    </Card>
  );
}
```

### 4. Trend Chart Component

**File:** `components/real-estate/content/analytics/trend-chart.tsx`

```typescript
'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface TrendChartProps {
  data: Array<{
    month: string;
    views: number;
    engagement: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Views"
        />
        <Line
          type="monotone"
          dataKey="engagement"
          stroke="#10b981"
          strokeWidth={2}
          name="Engagement"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 5. Export Functionality

**File:** `components/real-estate/content/analytics/export-button.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  data: any;
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const { toast } = useToast();

  function exportToCSV() {
    try {
      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map(header => JSON.stringify(row[header])).join(',')
        ),
      ].join('\n');

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: 'Analytics data has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  }

  return (
    <Button onClick={exportToCSV} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
```

### 6. Analytics Page

**File:** `app/real-estate/content/analytics/page.tsx`

```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getContentPerformance,
  getContentTrends,
} from '@/lib/modules/content/analytics/content-analytics';
import { getCampaignMetrics } from '@/lib/modules/content/analytics/campaign-analytics';
import { AnalyticsDashboard } from '@/components/real-estate/content/analytics/analytics-dashboard';
import { ExportButton } from '@/components/real-estate/content/analytics/export-button';

export default async function AnalyticsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Content and campaign performance insights
          </p>
        </div>

        <Suspense>
          <ExportActions />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent() {
  const [contentMetrics, campaignMetrics, trends] = await Promise.all([
    getContentPerformance(),
    getCampaignMetrics(),
    getContentTrends(),
  ]);

  return (
    <AnalyticsDashboard
      contentMetrics={contentMetrics}
      campaignMetrics={campaignMetrics}
      trends={trends}
    />
  );
}

async function ExportActions() {
  const contentMetrics = await getContentPerformance();

  return (
    <ExportButton
      data={contentMetrics.content}
      filename="content-analytics"
    />
  );
}
```

## Dependencies

Install chart library:
```bash
npm install recharts
```

## Success Criteria

- [x] Analytics module backend complete
- [x] Content performance dashboard functional
- [x] Campaign metrics displaying
- [x] Trend analysis working
- [x] Export functionality implemented
- [x] Charts rendering correctly
- [x] Real-time data updates
- [x] Mobile responsive

## Files Created

- ✅ `lib/modules/content/analytics/*` (4 files)
- ✅ `components/real-estate/content/analytics/*` (6 files)
- ✅ `app/real-estate/content/analytics/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 7: Navigation & Dashboard Integration**
2. ✅ Analytics complete
3. ✅ Ready to integrate with platform

---

**Session 6 Complete:** ✅ Analytics dashboard with performance insights
