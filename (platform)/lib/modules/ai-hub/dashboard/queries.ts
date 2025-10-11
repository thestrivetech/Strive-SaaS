'use server';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export async function getDashboardStats() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const [workflows, agents, executions, teams] = await Promise.all([
    prisma.automation_workflows.findMany({
      where: { organization_id: organizationId },
    }),
    prisma.ai_agents.findMany({
      where: { organization_id: organizationId },
    }),
    prisma.workflow_executions.findMany({
      where: {
        automation_workflow: {
          organization_id: organizationId,
        },
      },
    }),
    prisma.agent_teams.findMany({
      where: { organization_id: organizationId },
    }),
  ]);

  const activeWorkflows = workflows.filter(w => w.is_active).length;
  const totalAgents = agents.length;
  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(e => e.status === 'COMPLETED').length;
  const successRate = totalExecutions > 0
    ? Math.round((completedExecutions / totalExecutions) * 100)
    : 0;

  return {
    activeWorkflows,
    totalAgents,
    totalExecutions,
    successRate,
    totalTeams: teams.length,
  };
}

export async function getRecentActivity(limit = 10) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const activities = await prisma.workflow_executions.findMany({
    where: {
      automation_workflow: {
        organization_id: organizationId,
      },
    },
    include: {
      automation_workflow: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      started_at: 'desc',
    },
    take: limit,
  });

  return activities.map(activity => {
    const statusText = activity.status.toString().toLowerCase();
    return {
      id: activity.id,
      type: 'workflow_execution' as const,
      title: `Workflow "${activity.automation_workflow?.name}" ${statusText}`,
      description: activity.error || 'Execution completed successfully',
      status: activity.status,
      timestamp: activity.started_at,
    };
  });
}
