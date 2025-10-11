import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { WorkflowOverview } from '@/components/real-estate/ai-hub/dashboard/WorkflowOverview';
import { AgentStatus } from '@/components/real-estate/ai-hub/dashboard/AgentStatus';
import { ExecutionMetrics } from '@/components/real-estate/ai-hub/dashboard/ExecutionMetrics';
import { QuickActions } from '@/components/real-estate/ai-hub/dashboard/QuickActions';
import { ActivityFeed } from '@/components/real-estate/ai-hub/dashboard/ActivityFeed';
import { getDashboardStats, getRecentActivity } from '@/lib/modules/ai-hub/dashboard/queries';
import { getWorkflowStats, getRecentWorkflowExecutions } from '@/lib/modules/ai-hub/workflows/queries';
import { getAgentStats } from '@/lib/modules/ai-hub/agents/queries';
import { getExecutionMetrics } from '@/lib/modules/ai-hub/analytics/queries';

export const metadata: Metadata = {
  title: 'AI Hub Dashboard | Strive Platform',
  description: 'Unified control center for AI automation and agents',
};

export default async function AIHubDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <WorkflowOverviewWrapper />
          </Suspense>

          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <AgentStatusWrapper />
            </Suspense>

            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <ExecutionMetricsWrapper />
            </Suspense>
          </div>

          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <ActivityFeedWrapper />
          </Suspense>
        </div>

        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

async function HeroSectionWrapper({ user }: { user: UserWithOrganization }) {
  const dashboardStats = await getDashboardStats();

  const stats = [
    {
      label: 'Active Workflows',
      value: dashboardStats.activeWorkflows.toString(),
      icon: 'projects' as const,
    },
    {
      label: 'AI Agents',
      value: dashboardStats.totalAgents.toString(),
      icon: 'customers' as const,
    },
    {
      label: 'Total Executions',
      value: dashboardStats.totalExecutions.toString(),
      icon: 'tasks' as const,
    },
    {
      label: 'Success Rate',
      value: `${dashboardStats.successRate}%`,
      icon: 'trend' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="AI Hub"
      moduleDescription="Unified control center for AI automation, agents, and integrations"
      stats={stats}
    />
  );
}

async function WorkflowOverviewWrapper() {
  const workflowStats = await getWorkflowStats();
  const recentExecutions = await getRecentWorkflowExecutions(5);

  return (
    <WorkflowOverview
      activeWorkflows={workflowStats.active}
      totalExecutions={workflowStats.totalExecutions}
      successRate={Math.round(workflowStats.avgSuccessRate)}
      recentExecutions={recentExecutions}
    />
  );
}

async function AgentStatusWrapper() {
  const agentStats = await getAgentStats();

  return (
    <AgentStatus
      totalAgents={agentStats.total}
      activeAgents={agentStats.active}
      idleAgents={agentStats.idle}
      busyAgents={agentStats.busy}
    />
  );
}

async function ExecutionMetricsWrapper() {
  const metrics = await getExecutionMetrics(30);

  return (
    <ExecutionMetrics
      totalExecutions={metrics.totalExecutions}
      successRate={Math.round(metrics.successRate)}
      totalTokens={metrics.totalTokens}
      totalCost={metrics.totalCost}
    />
  );
}

async function ActivityFeedWrapper() {
  const activities = await getRecentActivity(10);

  return <ActivityFeed activities={activities} />;
}
