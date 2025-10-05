# Session 8: Analytics & Reporting - KPIs and Insights

## Session Overview
**Goal:** Build comprehensive analytics dashboards with KPIs, charts, and performance tracking for the CRM.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-7

## Objectives

1. ✅ Create analytics queries module
2. ✅ Implement KPI calculations
3. ✅ Build chart components (sales funnel, pipeline, revenue)
4. ✅ Create agent performance tracking
5. ✅ Add revenue forecasting
6. ✅ Implement export functionality for reports
7. ✅ Create analytics dashboard page

## Module Structure

```
lib/modules/analytics/
├── index.ts
├── kpis.ts (KPI calculations)
├── pipeline-metrics.ts
├── revenue-metrics.ts
├── performance-metrics.ts
└── forecasting.ts

components/(platform)/crm/analytics/
├── kpi-card.tsx
├── sales-funnel-chart.tsx
├── pipeline-value-chart.tsx
├── revenue-chart.tsx
├── agent-leaderboard.tsx
├── conversion-rate-chart.tsx
└── forecast-chart.tsx
```

## Key Implementation Steps

### 1. Analytics Backend Module

**kpis.ts** - Core KPI calculations:
```typescript
import 'server-only';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export async function getOverviewKPIs() {
  return withTenantContext(async () => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const lastMonth = subMonths(now, 1);

    const [
      // Leads metrics
      totalLeads,
      newLeadsLast30Days,
      leadsLastMonth,
      conversionRate,

      // Pipeline metrics
      activeDealCount,
      pipelineValue,
      avgDealValue,

      // Revenue metrics
      wonDealsThisMonth,
      revenueThisMonth,
      revenueLastMonth,

      // Activities
      activitiesLast30Days,
    ] = await Promise.all([
      // Total leads
      prisma.leads.count(),

      // New leads last 30 days
      prisma.leads.count({
        where: { created_at: { gte: last30Days } },
      }),

      // Leads from last month
      prisma.leads.count({
        where: {
          created_at: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
      }),

      // Conversion rate (leads to deals)
      calculateConversionRate(),

      // Active deals
      prisma.deals.count({
        where: { status: 'ACTIVE' },
      }),

      // Pipeline value
      prisma.deals.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { value: true },
      }),

      // Average deal value
      prisma.deals.aggregate({
        where: { status: 'ACTIVE' },
        _avg: { value: true },
      }),

      // Won deals this month
      prisma.deals.count({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
      }),

      // Revenue this month
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
        _sum: { value: true },
      }),

      // Revenue last month
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
        _sum: { value: true },
      }),

      // Activities last 30 days
      prisma.activities.count({
        where: { created_at: { gte: last30Days } },
      }),
    ]);

    // Calculate month-over-month changes
    const leadsMoM = calculatePercentageChange(newLeadsLast30Days, leadsLastMonth);
    const revenueMoM = calculatePercentageChange(
      revenueThisMonth._sum.value || 0,
      revenueLastMonth._sum.value || 0
    );

    return {
      leads: {
        total: totalLeads,
        new: newLeadsLast30Days,
        change: leadsMoM,
      },
      pipeline: {
        activeDealCount,
        totalValue: pipelineValue._sum.value || 0,
        avgDealValue: avgDealValue._avg.value || 0,
      },
      revenue: {
        thisMonth: revenueThisMonth._sum.value || 0,
        lastMonth: revenueLastMonth._sum.value || 0,
        change: revenueMoM,
        wonDeals: wonDealsThisMonth,
      },
      conversionRate,
      activitiesLast30Days,
    };
  });
}

async function calculateConversionRate() {
  const [totalLeads, convertedLeads] = await Promise.all([
    prisma.leads.count(),
    prisma.leads.count({ where: { status: 'CONVERTED' } }),
  ]);

  return totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
```

**pipeline-metrics.ts** - Sales funnel data:
```typescript
export async function getSalesFunnelData() {
  return withTenantContext(async () => {
    const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'CLOSED_WON'];

    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const count = await prisma.deals.count({
          where: { stage: stage as DealStage },
        });

        const value = await prisma.deals.aggregate({
          where: { stage: stage as DealStage },
          _sum: { value: true },
        });

        return {
          stage,
          count,
          value: value._sum.value || 0,
        };
      })
    );

    return funnelData;
  });
}

export async function getPipelineByStage() {
  return withTenantContext(async () => {
    const dealsByStage = await prisma.deals.groupBy({
      by: ['stage'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      _sum: { value: true },
    });

    return dealsByStage.map((group) => ({
      stage: group.stage,
      count: group._count.id,
      value: group._sum.value || 0,
    }));
  });
}
```

**performance-metrics.ts** - Agent performance:
```typescript
export async function getAgentPerformance(timeRange: { start: Date; end: Date }) {
  return withTenantContext(async () => {
    // Get all agents in org
    const orgMembers = await prisma.organization_members.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    const agentMetrics = await Promise.all(
      orgMembers.map(async (member) => {
        const userId = member.user_id;

        const [
          leadsCount,
          contactsCount,
          dealsWon,
          dealsLost,
          revenue,
          activitiesCount,
        ] = await Promise.all([
          prisma.leads.count({
            where: {
              assigned_to_id: userId,
              created_at: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          prisma.contacts.count({
            where: { assigned_to_id: userId },
          }),

          prisma.deals.count({
            where: {
              assigned_to_id: userId,
              status: 'WON',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          prisma.deals.count({
            where: {
              assigned_to_id: userId,
              status: 'LOST',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          prisma.deals.aggregate({
            where: {
              assigned_to_id: userId,
              status: 'WON',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
            _sum: { value: true },
          }),

          prisma.activities.count({
            where: {
              created_by_id: userId,
              created_at: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),
        ]);

        const winRate =
          dealsWon + dealsLost > 0 ? (dealsWon / (dealsWon + dealsLost)) * 100 : 0;

        return {
          user: member.users,
          metrics: {
            leads: leadsCount,
            contacts: contactsCount,
            dealsWon,
            dealsLost,
            revenue: revenue._sum.value || 0,
            winRate,
            activities: activitiesCount,
          },
        };
      })
    );

    // Sort by revenue
    return agentMetrics.sort((a, b) => b.metrics.revenue - a.metrics.revenue);
  });
}
```

**forecasting.ts** - Revenue forecasting:
```typescript
export async function getForecast(months: number = 3) {
  return withTenantContext(async () => {
    const now = new Date();

    // Get historical revenue (last 6 months)
    const historicalData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const revenue = await prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { value: true },
      });

      historicalData.push({
        month: format(monthStart, 'MMM yyyy'),
        value: revenue._sum.value || 0,
      });
    }

    // Simple linear forecast based on average growth
    const avgGrowth = calculateAverageGrowth(historicalData);

    const forecastData = [];
    let lastValue = historicalData[historicalData.length - 1].value;

    for (let i = 1; i <= months; i++) {
      const forecastMonth = addMonths(now, i);
      lastValue = lastValue * (1 + avgGrowth / 100);

      forecastData.push({
        month: format(forecastMonth, 'MMM yyyy'),
        value: lastValue,
        isForecast: true,
      });
    }

    return {
      historical: historicalData,
      forecast: forecastData,
    };
  });
}

function calculateAverageGrowth(data: Array<{ month: string; value: number }>): number {
  if (data.length < 2) return 0;

  let totalGrowth = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const curr = data[i].value;

    if (prev > 0) {
      totalGrowth += ((curr - prev) / prev) * 100;
      count++;
    }
  }

  return count > 0 ? totalGrowth / count : 0;
}
```

### 2. Chart Components

**kpi-card.tsx** - Reusable KPI card:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ComponentType<any>;
}

export function KPICard({ title, value, change, format = 'number', icon: Icon }: KPICardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return formatNumber(value);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {typeof change !== 'undefined' && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span>vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**sales-funnel-chart.tsx** - Funnel visualization:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export function SalesFunnelChart({ data }: { data: any[] }) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;

          return (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-muted-foreground">
                  {stage.count} deals • {formatCurrency(stage.value)}
                </span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary flex items-center px-3 text-primary-foreground text-xs font-medium transition-all"
                  style={{ width: `${widthPercent}%` }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

**agent-leaderboard.tsx** - Top performers:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

export function AgentLeaderboard({ agents }: { agents: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((agent, index) => (
          <div key={agent.user.id} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8">
              {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
              {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
              {index === 2 && <Medal className="h-5 w-5 text-orange-600" />}
              {index > 2 && <span className="text-sm text-muted-foreground">{index + 1}</span>}
            </div>

            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.user.avatar_url || undefined} />
              <AvatarFallback>
                {agent.user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-medium">{agent.user.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{agent.metrics.dealsWon} won</span>
                <span>•</span>
                <span>{agent.metrics.winRate.toFixed(1)}% win rate</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-green-600">
                {formatCurrency(agent.metrics.revenue)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### 3. Analytics Page

**app/(platform)/crm/analytics/page.tsx**:
```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/auth-helpers';
import {
  getOverviewKPIs,
  getSalesFunnelData,
  getAgentPerformance,
  getForecast,
} from '@/lib/modules/analytics';
import { KPICard } from '@/components/(platform)/crm/analytics/kpi-card';
import { SalesFunnelChart } from '@/components/(platform)/crm/analytics/sales-funnel-chart';
import { AgentLeaderboard } from '@/components/(platform)/crm/analytics/agent-leaderboard';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function AnalyticsPage() {
  await requireAuth();

  const now = new Date();
  const [kpis, funnelData, agentPerformance] = await Promise.all([
    getOverviewKPIs(),
    getSalesFunnelData(),
    getAgentPerformance({
      start: startOfMonth(now),
      end: endOfMonth(now),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Track performance and insights
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={kpis.leads.total}
          change={kpis.leads.change}
          icon={Users}
        />
        <KPICard
          title="Pipeline Value"
          value={kpis.pipeline.totalValue}
          format="currency"
          icon={DollarSign}
        />
        <KPICard
          title="Revenue (MTD)"
          value={kpis.revenue.thisMonth}
          change={kpis.revenue.change}
          format="currency"
          icon={TrendingUp}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis.conversionRate}
          format="percentage"
          icon={Activity}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesFunnelChart data={funnelData} />
        <AgentLeaderboard agents={agentPerformance.slice(0, 5)} />
      </div>
    </div>
  );
}
```

## Dependencies

For advanced charts (optional):
```bash
npm install recharts
```

## Success Criteria

- [x] Analytics module complete
- [x] KPI calculations accurate
- [x] Charts displaying correctly
- [x] Agent performance tracking working
- [x] Forecast calculations functional
- [x] Multi-tenancy enforced on all metrics
- [x] Export functionality implemented

## Files Created

- ✅ `lib/modules/analytics/*` (6 files)
- ✅ `components/(platform)/crm/analytics/*` (7 files)
- ✅ `app/(platform)/crm/analytics/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 9: CRM Dashboard Integration**
2. ✅ Analytics complete
3. ✅ Ready to create unified dashboard

---

**Session 8 Complete:** ✅ Analytics and reporting fully implemented
