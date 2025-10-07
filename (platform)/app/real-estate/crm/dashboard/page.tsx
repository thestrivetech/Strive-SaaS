import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOverviewKPIs, getSalesFunnelData, getAgentPerformance } from '@/lib/modules/analytics';
import { getLeads } from '@/lib/modules/crm/leads';
import { getUpcomingAppointments } from '@/lib/modules/appointments';
import { getRecentActivities } from '@/lib/modules/activities';
import { KPICard } from '@/components/real-estate/crm/analytics/kpi-card';
import { AgentLeaderboard } from '@/components/real-estate/crm/analytics/agent-leaderboard';
import { LeadCard } from '@/components/real-estate/crm/leads/lead-card';
import { RecentActivity } from '@/components/real-estate/crm/dashboard/recent-activity';
import { QuickCreateMenu } from '@/components/real-estate/crm/dashboard/quick-create-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { subDays } from 'date-fns';

/**
 * CRM Dashboard Page
 *
 * Main dashboard for CRM with KPIs, recent leads, pipeline overview,
 * upcoming appointments, recent activity, and top performers
 *
 * @protected - Requires authentication
 */

export default async function CRMDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Time range for agent performance (last 30 days)
  const now = new Date();
  const timeRange = {
    start: subDays(now, 30),
    end: now,
  };

  // Fetch all dashboard data in parallel for performance
  const [kpis, recentLeads, funnelData, appointments, activities, agentPerformance] = await Promise.all([
    getOverviewKPIs(),
    getLeads({ limit: 4, offset: 0, sort_order: 'desc', sort_by: 'created_at' }),
    getSalesFunnelData(),
    getUpcomingAppointments(user.id, 5),
    getRecentActivities({ limit: 10 }),
    getAgentPerformance(timeRange),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here&apos;s your CRM overview.
          </p>
        </div>
        <QuickCreateMenu organizationId={organizationId} />
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="New Leads"
          value={kpis.leads.new}
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
          icon={CheckCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/real-estate/crm/leads" className="flex items-center gap-1">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No leads yet. Create your first lead to get started.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      organizationId={organizationId}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pipeline Overview</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/real-estate/crm/deals" className="flex items-center gap-1">
                    View pipeline
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {funnelData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No deals in pipeline
                </p>
              ) : (
                <div className="space-y-3">
                  {funnelData.slice(0, 5).map((stage) => (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.count} {stage.count === 1 ? 'deal' : 'deals'}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        ${(stage.value / 1000).toFixed(1)}K
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/real-estate/crm/calendar" className="flex items-center gap-1">
                    View calendar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming appointments
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {apt.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {apt.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {apt.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <AgentLeaderboard agents={agentPerformance.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
