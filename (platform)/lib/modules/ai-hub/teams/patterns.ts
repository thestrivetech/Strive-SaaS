import 'server-only';

import { TeamStructure, TeamRole } from '@prisma/client';
import { executeAgent } from '../agents/execution';
import type { CoordinationConfig } from './schemas';
import { aggregateResults } from './utils';

interface TeamMember {
  id: string;
  agent_id: string;
  role: TeamRole;
  priority: number;
  agent: {
    id: string;
    name: string;
    model_config: any;
  };
}

interface ExecutionContext {
  organizationId: string;
  teamId: string;
  task: string;
  context?: Record<string, any>;
  workflowExecutionId?: string;
}

interface AgentResult {
  agentId: string;
  agentName: string;
  role: TeamRole;
  output: any;
  tokensUsed: number;
  cost: number;
  duration: number;
  stage?: string;
  isLeaderSynthesis?: boolean;
  isWinner?: boolean;
}

/**
 * Execute team using HIERARCHICAL pattern
 * Leader delegates tasks to workers, synthesizes results
 */
export async function executeHierarchical(
  members: TeamMember[],
  context: ExecutionContext,
  config: CoordinationConfig
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  // Step 1: Find leader
  const leader = members.find((m) => m.role === 'LEADER');
  if (!leader) {
    throw new Error('Hierarchical team requires a LEADER');
  }

  const workers = members.filter((m) => m.role === 'WORKER');

  // Step 2: Leader breaks down task
  const leaderDelegationTask = `You are the team leader. Break down this task into ${workers.length} subtasks for your team members:

Task: ${context.task}

Provide a JSON response with subtasks array:
{
  "subtasks": [
    "Subtask 1 description",
    "Subtask 2 description",
    ...
  ],
  "coordination": "How workers should coordinate"
}`;

  const delegationResult = await executeAgent(
    leader.agent_id,
    context.organizationId,
    leaderDelegationTask,
    context.context,
    context.workflowExecutionId
  );

  results.push({
    agentId: leader.agent_id,
    agentName: leader.agent.name,
    role: leader.role,
    output: delegationResult.output,
    tokensUsed: delegationResult.tokensUsed,
    cost: delegationResult.cost,
    duration: delegationResult.duration,
    stage: 'delegation',
  });

  // Step 3: Parse subtasks
  let subtasks: string[] = [];
  try {
    const delegationOutput = delegationResult.output.content || delegationResult.output;
    const parsed = typeof delegationOutput === 'string' ? JSON.parse(delegationOutput) : delegationOutput;
    subtasks = parsed.subtasks || [];
  } catch (error) {
    // Fallback: assign same task to all workers
    subtasks = workers.map(() => context.task);
  }

  // Step 4: Workers execute subtasks in parallel
  const workerPromises = workers.map(async (worker, index) => {
    const subtask = subtasks[index] || context.task;
    const workerResult = await executeAgent(
      worker.agent_id,
      context.organizationId,
      subtask,
      context.context,
      context.workflowExecutionId
    );

    return {
      agentId: worker.agent_id,
      agentName: worker.agent.name,
      role: worker.role,
      output: workerResult.output,
      tokensUsed: workerResult.tokensUsed,
      cost: workerResult.cost,
      duration: workerResult.duration,
      stage: 'execution',
    };
  });

  const workerResults = await Promise.all(workerPromises);
  results.push(...workerResults);

  // Step 5: Leader synthesizes results
  const synthesisTask = `You are the team leader. Synthesize these worker results into a final output:

Original Task: ${context.task}

Worker Results:
${workerResults.map((r, i) => `Worker ${i + 1} (${r.agentName}): ${JSON.stringify(r.output)}`).join('\n\n')}

Provide a comprehensive synthesis that combines all worker outputs.`;

  const synthesisResult = await executeAgent(
    leader.agent_id,
    context.organizationId,
    synthesisTask,
    context.context,
    context.workflowExecutionId
  );

  results.push({
    agentId: leader.agent_id,
    agentName: leader.agent.name,
    role: leader.role,
    output: synthesisResult.output,
    tokensUsed: synthesisResult.tokensUsed,
    cost: synthesisResult.cost,
    duration: synthesisResult.duration,
    stage: 'synthesis',
    isLeaderSynthesis: true,
  });

  return results;
}

/**
 * Execute team using COLLABORATIVE pattern
 * All agents work on same task, consensus from results
 */
export async function executeCollaborative(
  members: TeamMember[],
  context: ExecutionContext,
  config: CoordinationConfig
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  // Step 1: All agents work on same task in parallel
  const agentPromises = members.map(async (member) => {
    const agentResult = await executeAgent(
      member.agent_id,
      context.organizationId,
      context.task,
      context.context,
      context.workflowExecutionId
    );

    const weight = config.contributionWeights?.[member.agent_id] || 1;

    return {
      agentId: member.agent_id,
      agentName: member.agent.name,
      role: member.role,
      output: agentResult.output,
      tokensUsed: agentResult.tokensUsed,
      cost: agentResult.cost,
      duration: agentResult.duration,
      weight,
    };
  });

  const agentResults = await Promise.all(agentPromises);
  results.push(...agentResults);

  // Step 2: Build consensus
  const consensus = aggregateResults('COLLABORATIVE', agentResults, config);

  // Add consensus as final result
  results.push({
    agentId: 'consensus',
    agentName: 'Team Consensus',
    role: 'COORDINATOR' as TeamRole,
    output: { consensus, allContributions: agentResults.map((r) => r.output) },
    tokensUsed: 0,
    cost: 0,
    duration: 0,
    stage: 'consensus',
  });

  return results;
}

/**
 * Execute team using PIPELINE pattern
 * Sequential agent processing, output N → input N+1
 */
export async function executePipeline(
  members: TeamMember[],
  context: ExecutionContext,
  config: CoordinationConfig
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  // Sort members by priority (defines pipeline order)
  const sortedMembers = [...members].sort((a, b) => a.priority - b.priority);

  // Sequential execution
  let currentInput = context.task;
  let currentContext = { ...context.context };

  for (let i = 0; i < sortedMembers.length; i++) {
    const member = sortedMembers[i];

    const agentResult = await executeAgent(
      member.agent_id,
      context.organizationId,
      currentInput,
      currentContext,
      context.workflowExecutionId
    );

    results.push({
      agentId: member.agent_id,
      agentName: member.agent.name,
      role: member.role,
      output: agentResult.output,
      tokensUsed: agentResult.tokensUsed,
      cost: agentResult.cost,
      duration: agentResult.duration,
      stage: `pipeline_stage_${i + 1}`,
    });

    // Output becomes input for next agent
    currentInput =
      typeof agentResult.output === 'string'
        ? agentResult.output
        : agentResult.output.content || JSON.stringify(agentResult.output);

    currentContext = {
      ...currentContext,
      previousStage: i + 1,
      previousAgent: member.agent.name,
      previousOutput: agentResult.output,
    };
  }

  return results;
}

/**
 * Execute team using DEMOCRATIC pattern
 * All agents propose solutions, voting selects winner
 */
export async function executeDemocratic(
  members: TeamMember[],
  context: ExecutionContext,
  config: CoordinationConfig
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  // Step 1: All agents provide proposals/solutions
  const proposalPromises = members.map(async (member) => {
    const proposalTask = `Provide your proposal/solution for this task:

${context.task}

Give a clear, actionable solution.`;

    const proposalResult = await executeAgent(
      member.agent_id,
      context.organizationId,
      proposalTask,
      context.context,
      context.workflowExecutionId
    );

    return {
      agentId: member.agent_id,
      agentName: member.agent.name,
      role: member.role,
      output: proposalResult.output,
      tokensUsed: proposalResult.tokensUsed,
      cost: proposalResult.cost,
      duration: proposalResult.duration,
      stage: 'proposal',
    };
  });

  const proposals = await Promise.all(proposalPromises);
  results.push(...proposals);

  // Step 2: Voting phase - each agent votes on all proposals
  const votingPromises = members.map(async (member) => {
    const votingTask = `Review these proposals and vote for the best one:

${proposals
  .map(
    (p, i) => `
Proposal ${i + 1} from ${p.agentName}:
${JSON.stringify(p.output)}
`
  )
  .join('\n')}

Respond with ONLY the number (1-${proposals.length}) of your chosen proposal.`;

    const voteResult = await executeAgent(
      member.agent_id,
      context.organizationId,
      votingTask,
      context.context,
      context.workflowExecutionId
    );

    return {
      agentId: member.agent_id,
      vote: voteResult.output,
    };
  });

  const votes = await Promise.all(votingPromises);

  // Step 3: Count votes
  const voteCounts = new Map<number, number>();
  votes.forEach((v) => {
    try {
      const voteNum =
        typeof v.vote === 'number' ? v.vote : parseInt(String(v.vote).match(/\d+/)?.[0] || '0');
      if (voteNum > 0 && voteNum <= proposals.length) {
        voteCounts.set(voteNum, (voteCounts.get(voteNum) || 0) + 1);
      }
    } catch (error) {
      // Invalid vote, skip
    }
  });

  // Step 4: Determine winner
  let winnerIndex = 0;
  let maxVotes = 0;
  voteCounts.forEach((count, index) => {
    if (count > maxVotes) {
      maxVotes = count;
      winnerIndex = index - 1; // Convert to 0-based index
    }
  });

  // Mark winner
  if (results[winnerIndex]) {
    results[winnerIndex].isWinner = true;
  }

  return results;
}

/**
 * Main pattern executor router
 */
export async function executePattern(
  pattern: TeamStructure,
  members: TeamMember[],
  context: ExecutionContext,
  config: CoordinationConfig
): Promise<AgentResult[]> {
  switch (pattern) {
    case 'HIERARCHICAL':
      return executeHierarchical(members, context, config);

    case 'COLLABORATIVE':
      return executeCollaborative(members, context, config);

    case 'PIPELINE':
      return executePipeline(members, context, config);

    case 'DEMOCRATIC':
      return executeDemocratic(members, context, config);

    default:
      throw new Error(`Unsupported team pattern: ${pattern}`);
  }
}
