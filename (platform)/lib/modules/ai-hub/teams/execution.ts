import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { ExecutionStatus, TeamStructure } from '@prisma/client';
import { executePattern } from './patterns';
import { validateTeamStructure, validateExecutionInput, calculateTeamMetrics, formatTeamResponse, calculateTotalCost, calculateTotalTokens } from './utils';
import type { CoordinationConfig } from './schemas';

/**
 * Execute a team task with pattern-based orchestration
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeTeam(
  teamId: string,
  organizationId: string,
  task: string,
  context?: Record<string, any>,
  patternOverride?: TeamStructure,
  workflowExecutionId?: string
): Promise<{
  id: string;
  output: any;
  status: ExecutionStatus;
  duration: number;
  totalTokens: number;
  totalCost: number;
  agentResults: any[];
}> {
  await setTenantContext({ organizationId });

  // Validate execution input
  const validation = validateExecutionInput(task);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get team with members
  const team = await prisma.agent_teams.findFirst({
    where: {
      id: teamId,
      organization_id: organizationId,
    },
    include: {
      members: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatar: true,
              personality: true,
              model_config: true,
              capabilities: true,
              status: true,
              is_active: true,
            },
          },
        },
        orderBy: {
          priority: 'asc',
        },
      },
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Validate team structure
  const structureValidation = validateTeamStructure(
    patternOverride || team.structure,
    team.members.map(m => ({ role: m.role, agent_id: m.agent_id }))
  );

  if (!structureValidation.valid) {
    throw new Error(structureValidation.error);
  }

  // Check all agents are active
  const inactiveAgents = team.members.filter((m) => !m.agent.is_active);
  if (inactiveAgents.length > 0) {
    throw new Error(
      `Team has inactive agents: ${inactiveAgents.map((m) => m.agent.name).join(', ')}`
    );
  }

  // Create execution record
  const execution = await prisma.team_executions.create({
    data: {
      id: `team_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      team_id: teamId,
      task,
      pattern: patternOverride || team.structure,
      input: context || {},
      status: ExecutionStatus.PENDING,
    },
  });

  const startTime = Date.now();

  try {
    // Update execution to RUNNING
    await prisma.team_executions.update({
      where: { id: execution.id },
      data: { status: ExecutionStatus.RUNNING },
    });

    // Execute team using pattern
    const pattern = patternOverride || team.structure;
    const coordination = team.coordination as unknown as CoordinationConfig;

    const agentResults = await executePattern(
      pattern,
      team.members,
      {
        organizationId,
        teamId,
        task,
        context,
        workflowExecutionId,
      },
      coordination
    );

    const duration = Date.now() - startTime;

    // Calculate metrics
    const totalTokens = calculateTotalTokens(agentResults);
    const totalCost = calculateTotalCost(agentResults);

    // Format final output
    const { output, summary } = formatTeamResponse(pattern, agentResults);

    // Update execution as COMPLETED
    await prisma.team_executions.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.COMPLETED,
        completed_at: new Date(),
        duration,
        output: { result: output, summary },
        agent_results: agentResults.map((r) => ({
          agentId: r.agentId,
          agentName: r.agentName,
          role: r.role,
          output: r.output,
          tokensUsed: r.tokensUsed,
          cost: r.cost,
          duration: r.duration,
          stage: r.stage,
          isLeaderSynthesis: r.isLeaderSynthesis,
          isWinner: r.isWinner,
        })),
      },
    });

    // Update team metrics
    const recentExecutions = await prisma.team_executions.findMany({
      where: { team_id: teamId },
      select: { duration: true, status: true },
      orderBy: { started_at: 'desc' },
      take: 100, // Last 100 executions for metrics
    });

    const metrics = calculateTeamMetrics(recentExecutions.map(e => ({
      status: e.status,
      duration: e.duration
    })));

    await prisma.agent_teams.update({
      where: { id: teamId },
      data: {
        execution_count: { increment: 1 },
        success_rate: metrics.successRate,
      },
    });

    return {
      id: execution.id,
      output,
      status: ExecutionStatus.COMPLETED,
      duration,
      totalTokens,
      totalCost,
      agentResults: agentResults.map((r) => ({
        agentId: r.agentId,
        agentName: r.agentName,
        role: r.role,
        output: r.output,
        tokensUsed: r.tokensUsed,
        cost: r.cost,
        duration: r.duration,
        stage: r.stage,
      })),
    };
  } catch (error: any) {
    // Update execution as FAILED
    await prisma.team_executions.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.FAILED,
        completed_at: new Date(),
        duration: Date.now() - startTime,
        output: { error: error.message },
      },
    });

    // Update team metrics (including failed execution)
    await prisma.agent_teams.update({
      where: { id: teamId },
      data: {
        execution_count: { increment: 1 },
      },
    });

    // Recalculate metrics including failed execution
    const recentExecutions = await prisma.team_executions.findMany({
      where: { team_id: teamId },
      select: { duration: true, status: true },
      orderBy: { started_at: 'desc' },
      take: 100,
    });

    const metrics = calculateTeamMetrics(recentExecutions.map(e => ({
      status: e.status,
      duration: e.duration
    })));

    await prisma.agent_teams.update({
      where: { id: teamId },
      data: {
        success_rate: metrics.successRate,
      },
    });

    throw error;
  }
}
