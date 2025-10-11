'use server';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export interface AgentStats {
  total: number;
  active: number;
  idle: number;
  busy: number;
  avgSuccessRate: number;
}

export async function getAgentStats(): Promise<AgentStats> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const agents = await prisma.ai_agents.findMany({
    where: { organization_id: organizationId },
  });

  const total = agents.length;
  const active = agents.filter(a => a.is_active).length;
  const idle = agents.filter(a => a.status === 'IDLE').length;
  const busy = agents.filter(a => a.status === 'BUSY').length;

  const agentsWithExecutions = agents.filter(a => (a.execution_count || 0) > 0);
  const avgSuccessRate = agentsWithExecutions.length > 0
    ? agentsWithExecutions.reduce((sum, a) => sum + (a.success_rate || 0), 0) / agentsWithExecutions.length
    : 0;

  return {
    total,
    active,
    idle,
    busy,
    avgSuccessRate,
  };
}

export async function getTopPerformingAgents(limit = 5) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  return await prisma.ai_agents.findMany({
    where: {
      organization_id: organizationId,
      execution_count: { gt: 0 },
    },
    orderBy: [
      { success_rate: 'desc' },
      { execution_count: 'desc' },
    ],
    take: limit,
  });
}
