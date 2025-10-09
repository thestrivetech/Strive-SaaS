import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOverviewKPIs, getSalesFunnelData, getAgentPerformance } from '@/lib/modules/analytics';
import { getLeads } from '@/lib/modules/crm/leads';
import { getUpcomingAppointments } from '@/lib/modules/appointments';
import { getRecentActivities } from '@/lib/modules/activities';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';
import { AgentLeaderboard } from '@/components/real-estate/crm/analytics/agent-leaderboard';
import { LeadCard } from '@/components/real-estate/crm/leads/lead-card';
import { RecentActivity } from '@/components/real-estate/crm/dashboard/recent-activity';
import { QuickCreateMenu } from '@/components/real-estate/crm/dashboard/quick-create-menu';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { subDays } from 'date-fns';

/**
 * CRM Dashboard Page
 *
 * Main dashboard for CRM with ModuleHeroSection, KPIs, recent leads, pipeline overview,
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
  const [recentLeads, funnelData, appointmentsResult, activities, agentPerformance] = await Promise.all([
    getLeads({ limit: 4, offset: 0, sort_order: 'desc', sort_by: 'created_at' }),
    getSalesFunnelData(),
    getUpcomingAppointments(user.id, 5),
    getRecentActivities({ limit: 10 }),
    getAgentPerformance(timeRange),
  ]);

  // Handle potential database errors for appointments
  const appointments = Array.isArray(appointmentsResult) ? appointmentsResult : [];

  return (
    <div className="space-y-6">
      {/* Hero Section with KPIs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper organizationId={organizationId} user={user} />
      </Suspense>

      {/* Quick Create Menu in Header Position */}
      <div className="flex justify-end px-4 sm:px-6">
        <QuickCreateMenu organizationId={organizationId} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Leads */}
          <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
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
                      lead={lead as any}
                      organizationId={organizationId}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </EnhancedCard>

          {/* Pipeline Overview */}
          <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
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
          </EnhancedCard>

          {/* Recent Activity */}
          <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={true}>
            <RecentActivity activities={activities as any} />
          </EnhancedCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
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
          </EnhancedCard>

          {/* Top Performers */}
          <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
            <AgentLeaderboard agents={agentPerformance.slice(0, 4) as any} />
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches KPI data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({ user }: { organizationId?: string; user: any }) {
  const kpis = await getOverviewKPIs();

  const stats = [
    {
      label: 'New Leads',
      value: kpis.leads.new,
      change: kpis.leads.change,
      changeType: 'count' as const,
      icon: 'customers' as const,
    },
    {
      label: 'Pipeline Value',
      value: `$${(kpis.pipeline.totalValue / 1000).toFixed(1)}K`,
      icon: 'revenue' as const,
    },
    {
      label: 'Revenue (MTD)',
      value: `$${(kpis.revenue.thisMonth / 1000).toFixed(1)}K`,
      change: kpis.revenue.change,
      changeType: 'percentage' as const,
      icon: 'revenue' as const,
    },
    {
      label: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      icon: 'tasks' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="CRM Dashboard"
      moduleDescription="Manage your contacts, leads, and pipeline"
      stats={stats}
    />
  );
}
