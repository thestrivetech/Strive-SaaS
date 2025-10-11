import 'server-only';

import { TeamStructure, TeamRole, ExecutionStatus } from '@prisma/client';
import type { CoordinationConfig } from './schemas';

/**
 * Validate team structure requirements
 */
export function validateTeamStructure(
  structure: TeamStructure,
  members: Array<{ role: TeamRole; agent_id: string }>
): { valid: boolean; error?: string } {
  // Check minimum members
  if (members.length === 0) {
    return { valid: false, error: 'Team must have at least one member' };
  }

  // Structure-specific validation
  switch (structure) {
    case 'HIERARCHICAL':
      const leaders = members.filter((m) => m.role === 'LEADER');
      if (leaders.length === 0) {
        return { valid: false, error: 'Hierarchical team requires at least one LEADER' };
      }
      if (leaders.length > 1) {
        return { valid: false, error: 'Hierarchical team can have only one LEADER' };
      }
      if (members.length < 2) {
        return { valid: false, error: 'Hierarchical team requires at least one WORKER' };
      }
      break;

    case 'COLLABORATIVE':
      // All agents contribute equally, no specific role requirements
      if (members.length < 2) {
        return { valid: false, error: 'Collaborative team requires at least 2 members' };
      }
      break;

    case 'PIPELINE':
      // Sequential processing requires priority ordering
      if (members.length < 2) {
        return { valid: false, error: 'Pipeline team requires at least 2 members' };
      }
      // Priority should be unique for proper ordering
      const priorities = members.map((m) => (m as any).priority || 0);
      const uniquePriorities = new Set(priorities);
      if (uniquePriorities.size !== members.length) {
        return {
          valid: false,
          error: 'Pipeline team requires unique priority values for proper ordering',
        };
      }
      break;

    case 'DEMOCRATIC':
      if (members.length < 3) {
        return { valid: false, error: 'Democratic team requires at least 3 members for voting' };
      }
      break;

    default:
      return { valid: false, error: `Unknown team structure: ${structure}` };
  }

  return { valid: true };
}

/**
 * Calculate team metrics from agent results
 */
export function calculateTeamMetrics(executions: Array<{ status: string; duration: number | null }>) {
  if (executions.length === 0) {
    return {
      successRate: 0,
      avgResponseTime: 0,
    };
  }

  const completedExecutions = executions.filter((e) => e.status === 'COMPLETED');
  const successRate = (completedExecutions.length / executions.length) * 100;

  const validDurations = executions.filter((e) => e.duration !== null && e.duration > 0);
  const avgResponseTime =
    validDurations.length > 0
      ? validDurations.reduce((sum, e) => sum + (e.duration || 0), 0) / validDurations.length
      : 0;

  return {
    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    avgResponseTime: Math.round(avgResponseTime),
  };
}

/**
 * Format team execution response
 */
export function formatTeamResponse(
  pattern: TeamStructure,
  agentResults: Array<any>
): { output: any; summary: string } {
  switch (pattern) {
    case 'HIERARCHICAL':
      // Leader's final synthesis is the output
      const leaderResult = agentResults.find((r) => r.role === 'LEADER' && r.stage === 'synthesis');
      return {
        output: leaderResult?.output || {},
        summary: `Hierarchical execution: Leader synthesized ${agentResults.length - 1} worker results`,
      };

    case 'COLLABORATIVE':
      // Combine all agent contributions
      return {
        output: {
          consensus: agentResults[agentResults.length - 1]?.output || {},
          allContributions: agentResults.map((r) => ({
            agentId: r.agentId,
            contribution: r.output,
          })),
        },
        summary: `Collaborative execution: ${agentResults.length} agents contributed`,
      };

    case 'PIPELINE':
      // Final agent's output is the result
      const finalResult = agentResults[agentResults.length - 1];
      return {
        output: finalResult?.output || {},
        summary: `Pipeline execution: ${agentResults.length} stages completed`,
      };

    case 'DEMOCRATIC':
      // Voting winner is the output
      const winner = agentResults.find((r) => r.isWinner);
      return {
        output: winner?.output || {},
        summary: `Democratic execution: Winner selected from ${agentResults.length} proposals`,
      };

    default:
      return {
        output: agentResults,
        summary: `Unknown pattern: ${pattern}`,
      };
  }
}

/**
 * Assign tasks based on team roles and capabilities
 */
export function assignTasksByRole(
  task: string,
  members: Array<{ agent_id: string; role: TeamRole; agent: any }>
): Map<string, string> {
  const assignments = new Map<string, string>();

  // Find leader for hierarchical delegation
  const leader = members.find((m) => m.role === 'LEADER');

  if (leader) {
    // Leader gets the full task for delegation
    assignments.set(leader.agent_id, `Analyze and delegate this task: ${task}`);

    // Workers get subtasks (will be assigned by leader's output)
    const workers = members.filter((m) => m.role === 'WORKER');
    workers.forEach((worker) => {
      assignments.set(worker.agent_id, 'Awaiting task assignment from leader');
    });
  } else {
    // Non-hierarchical: all agents get the same task
    members.forEach((member) => {
      assignments.set(member.agent_id, task);
    });
  }

  return assignments;
}

/**
 * Aggregate agent results by coordination pattern
 */
export function aggregateResults(
  pattern: TeamStructure,
  results: Array<{ agentId: string; output: any; weight?: number }>,
  config: CoordinationConfig
): any {
  switch (pattern) {
    case 'HIERARCHICAL':
      // Leader synthesis is already the final result
      return results.find((r) => (r as any).isLeaderSynthesis)?.output || results[results.length - 1]?.output;

    case 'COLLABORATIVE':
      // Weighted average or consensus
      const weights = config.contributionWeights || {};
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0) || results.length;

      // Simple string concatenation with weights for now
      const aggregated = results
        .map((r) => {
          const weight = weights[r.agentId] || 1;
          return { ...r.output, weight };
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return aggregated;

    case 'PIPELINE':
      // Final output is the result
      return results[results.length - 1]?.output;

    case 'DEMOCRATIC':
      // Voting - count occurrences
      const votes = new Map<string, number>();
      results.forEach((r) => {
        const output = JSON.stringify(r.output);
        votes.set(output, (votes.get(output) || 0) + (r.weight || 1));
      });

      // Find winner
      let maxVotes = 0;
      let winner = results[0]?.output;
      votes.forEach((count, output) => {
        if (count > maxVotes) {
          maxVotes = count;
          winner = JSON.parse(output);
        }
      });

      return winner;

    default:
      return results.map((r) => r.output);
  }
}

/**
 * Validate execution input
 */
export function validateExecutionInput(task: string): { valid: boolean; error?: string } {
  if (!task || task.trim().length === 0) {
    return { valid: false, error: 'Task cannot be empty' };
  }

  if (task.length > 10000) {
    return { valid: false, error: 'Task exceeds maximum length of 10,000 characters' };
  }

  return { valid: true };
}

/**
 * Extract team member IDs for quick lookup
 */
export function extractMemberIds(members: Array<{ agent_id: string }>): string[] {
  return members.map((m) => m.agent_id);
}

/**
 * Calculate total cost from agent executions
 */
export function calculateTotalCost(agentResults: Array<{ cost?: number }>): number {
  return agentResults.reduce((sum, r) => sum + (r.cost || 0), 0);
}

/**
 * Calculate total tokens from agent executions
 */
export function calculateTotalTokens(agentResults: Array<{ tokensUsed?: number }>): number {
  return agentResults.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
}
