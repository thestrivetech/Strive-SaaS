'use server';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

/**
 * AI Hub Workflows Queries
 *
 * Query automation_workflows table with organization filtering
 * All queries enforce multi-tenancy via organizationId
 */

export interface WorkflowStats {
  total: number;
  active: number;
  totalExecutions: number;
  avgSuccessRate: number;
}

export async function getWorkflowStats(): Promise<WorkflowStats> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const workflows = await prisma.automation_workflows.findMany({
    where: { organization_id: organizationId },
  });

  const total = workflows.length;
  const active = workflows.filter(w => w.is_active).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);

  const workflowsWithExecutions = workflows.filter(w => (w.execution_count || 0) > 0);
  const avgSuccessRate = workflowsWithExecutions.length > 0
    ? workflowsWithExecutions.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflowsWithExecutions.length
    : 0;

  return {
    total,
    active,
    totalExecutions,
    avgSuccessRate,
  };
}

export async function getRecentWorkflowExecutions(limit = 10) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  return await prisma.workflow_executions.findMany({
    where: {
      automation_workflow: {
        organization_id: organizationId,
      },
    },
    include: {
      automation_workflow: {
        select: {
          name: true,
          description: true,
        },
      },
    },
    orderBy: {
      started_at: 'desc',
    },
    take: limit,
  });
}

export async function getActiveWorkflows() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  return await prisma.automation_workflows.findMany({
    where: {
      organization_id: organizationId,
      is_active: true,
    },
    orderBy: {
      updated_at: 'desc',
    },
  });
}
