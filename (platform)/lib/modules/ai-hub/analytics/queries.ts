'use server';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export async function getExecutionMetrics(days = 30) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const executions = await prisma.workflow_executions.findMany({
    where: {
      automation_workflow: {
        organization_id: organizationId,
      },
      started_at: {
        gte: startDate,
      },
    },
    orderBy: {
      started_at: 'asc',
    },
  });

  const totalExecutions = executions.length;
  const completed = executions.filter(e => e.status === 'COMPLETED').length;
  const failed = executions.filter(e => e.status === 'FAILED').length;
  const totalTokens = executions.reduce((sum, e) => sum + (e.tokens_used || 0), 0);
  const totalCost = executions.reduce((sum, e) => sum + parseFloat(e.cost?.toString() || '0'), 0);

  const successRate = totalExecutions > 0 ? (completed / totalExecutions) * 100 : 0;

  return {
    totalExecutions,
    completed,
    failed,
    successRate,
    totalTokens,
    totalCost,
    executions: executions.map(e => ({
      date: e.started_at,
      status: e.status,
      tokens: e.tokens_used || 0,
      cost: parseFloat(e.cost?.toString() || '0'),
    })),
  };
}

export async function getTeamStats() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const teams = await prisma.agent_teams.findMany({
    where: { organization_id: organizationId },
    include: {
      _count: {
        select: {
          team_members: true,
        },
      },
    },
  });

  const total = teams.length;
  const avgMembers = teams.length > 0
    ? teams.reduce((sum, t) => sum + t._count.team_members, 0) / teams.length
    : 0;

  return {
    total,
    avgMembers: Math.round(avgMembers),
  };
}
