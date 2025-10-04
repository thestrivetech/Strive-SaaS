import { requireAuth } from '@/lib/auth/auth-helpers';
import {
  getOverviewKPIs,
  getSalesFunnelData,
  getAgentPerformance,
  getMonthlyRevenue,
  getPipelineByStage,
} from '@/lib/modules/analytics';
import { KPICard } from '@/components/(platform)/crm/analytics/kpi-card';
import { SalesFunnelChart } from '@/components/(platform)/crm/analytics/sales-funnel-chart';
import { AgentLeaderboard } from '@/components/(platform)/crm/analytics/agent-leaderboard';
import { RevenueChart } from '@/components/(platform)/crm/analytics/revenue-chart';
import { PipelineValueChart } from '@/components/(platform)/crm/analytics/pipeline-value-chart';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Analytics Dashboard Page
 *
 * Main CRM analytics dashboard showing:
 * - Key performance indicators (KPIs)
 * - Sales funnel visualization
 * - Revenue trends
 * - Pipeline metrics
 * - Agent performance leaderboard
 *
 * All data automatically filtered by organization
 * RBAC: Requires authentication
 */

export default async function AnalyticsPage() {
  // Require authentication
  await requireAuth();

  const now = new Date();

  // Fetch all analytics data in parallel
  const [kpis, funnelData, agentPerformance, monthlyRevenue, pipelineByStage] = await Promise.all([
    getOverviewKPIs(),
    getSalesFunnelData(),
    getAgentPerformance({
      start: startOfMonth(now),
      end: endOfMonth(now),
    }),
    getMonthlyRevenue(12),
    getPipelineByStage(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Track performance and insights across your CRM
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Revenue Trend Chart */}
      <div className="grid gap-6">
        <RevenueChart data={monthlyRevenue} />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesFunnelChart data={funnelData} />
        <PipelineValueChart data={pipelineByStage} />
      </div>

      {/* Agent Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AgentLeaderboard agents={agentPerformance.slice(0, 5)} />

        {/* Additional Stats Card */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Deals</span>
                <span className="font-bold">{kpis.pipeline.activeDealCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Deal Value</span>
                <span className="font-bold">
                  ${kpis.pipeline.avgDealValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Deals Won (MTD)</span>
                <span className="font-bold">{kpis.revenue.wonDeals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Activities (30d)</span>
                <span className="font-bold">{kpis.activitiesLast30Days}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
