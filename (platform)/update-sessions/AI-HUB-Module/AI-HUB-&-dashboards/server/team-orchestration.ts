import { storage } from './storage';
import { workflowEngine } from './workflow-engine';
import type { AIAgent } from '@shared/schema';

interface TeamExecutionContext {
  teamId: string;
  task: string;
  agents: AIAgent[];
  agentRoles: Map<string, string>;
  structure: 'HIERARCHICAL' | 'COLLABORATIVE' | 'PIPELINE' | 'DEMOCRATIC';
  configuration: any;
}

interface AgentMessage {
  from: string;
  to?: string;
  content: string;
  timestamp: string;
  metadata?: any;
}

interface TeamExecutionResult {
  success: boolean;
  output: any;
  agentOutputs: Record<string, any>;
  messages: AgentMessage[];
  executionTime: number;
  pattern: string;
}

export class TeamOrchestrationEngine {
  private messageHistory: Map<string, AgentMessage[]> = new Map();

  constructor() {
  }

  async executeTeamTask(teamId: string, task: string): Promise<TeamExecutionResult> {
    const startTime = Date.now();
    
    const team = await storage.getTeam(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const teamMembers = await storage.getTeamMembers(teamId);
    const agents = await Promise.all(
      teamMembers.map(member => storage.getAgent(member.agentId))
    );
    const validAgents = agents.filter(agent => agent !== undefined) as AIAgent[];

    if (validAgents.length === 0) {
      throw new Error('No valid agents found in team');
    }

    const agentRoles = new Map<string, string>();
    teamMembers.forEach(member => {
      agentRoles.set(member.agentId, member.role);
    });

    const rolesConfig = team.configuration?.roles || {};
    const orderedAgents = this.orderAgentsByRole(validAgents, agentRoles, rolesConfig, team.structure);

    const context: TeamExecutionContext = {
      teamId,
      task,
      agents: orderedAgents,
      agentRoles,
      structure: team.structure,
      configuration: team.configuration,
    };

    this.messageHistory.set(teamId, []);

    let result: any;
    
    switch (team.structure) {
      case 'HIERARCHICAL':
        result = await this.executeHierarchical(context);
        break;
      case 'COLLABORATIVE':
        result = await this.executeCollaborative(context);
        break;
      case 'PIPELINE':
        result = await this.executePipeline(context);
        break;
      case 'DEMOCRATIC':
        result = await this.executeDemocratic(context);
        break;
      default:
        throw new Error(`Unknown team structure: ${team.structure}`);
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: result.output,
      agentOutputs: result.agentOutputs,
      messages: this.messageHistory.get(teamId) || [],
      executionTime,
      pattern: team.structure,
    };
  }

  private async executeHierarchical(context: TeamExecutionContext): Promise<any> {
    const leader = context.agents.find(agent => context.agentRoles.get(agent.id) === 'leader') || context.agents[0];
    const workers = context.agents.filter(agent => agent.id !== leader.id);
    
    const leaderPrompt = `You are the team leader. Analyze the following task and break it down into ${workers.length} specific subtasks, one for each team member:\n\n${context.task}\n\nFor each subtask, provide clear, individualized instructions. Format as a numbered list.`;
    
    const leaderResult = await this.executeAgent(leader, leaderPrompt, context);
    
    this.addMessage({
      from: leader.id,
      content: `Leader Analysis: ${JSON.stringify(leaderResult)}`,
      timestamp: new Date().toISOString(),
    }, context.teamId);

    const subtasks = this.extractSubtasks(leaderResult.content || JSON.stringify(leaderResult), workers.length);

    const workerResults = await Promise.all(
      workers.map(async (worker, index) => {
        const assignedTask = subtasks[index] || `Help with aspect ${index + 1} of the task`;
        const workerPrompt = `You are ${worker.name}, a team member. Execute this specific subtask:\n\n${assignedTask}\n\nContext: ${context.task}`;
        
        const result = await this.executeAgent(worker, workerPrompt, context);
        
        this.addMessage({
          from: worker.id,
          to: leader.id,
          content: `${worker.name} Result: ${JSON.stringify(result)}`,
          timestamp: new Date().toISOString(),
        }, context.teamId);
        
        return result;
      })
    );

    const finalSynthesisPrompt = `As the team leader, synthesize these worker results into a final output:\n\n${JSON.stringify(workerResults, null, 2)}`;
    
    const finalResult = await this.executeAgent(leader, finalSynthesisPrompt, context);

    return {
      output: finalResult,
      agentOutputs: {
        leader: leaderResult,
        workers: workerResults,
        final: finalResult,
      },
    };
  }

  private extractSubtasks(content: string, count: number): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const numbered = lines.filter(line => /^\d+\./.test(line.trim()));
    
    if (numbered.length >= count) {
      return numbered.slice(0, count).map(line => line.replace(/^\d+\.\s*/, ''));
    }
    
    if (lines.length >= count) {
      return lines.slice(0, count);
    }
    
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(lines[i % lines.length] || 'Complete part of the task');
    }
    return result;
  }

  private orderAgentsByRole(agents: AIAgent[], roles: Map<string, string>, rolesConfig: any, structure: string): AIAgent[] {
    if (structure === 'HIERARCHICAL') {
      const leader = agents.find(agent => roles.get(agent.id) === 'leader');
      const workers = agents.filter(agent => roles.get(agent.id) !== 'leader');
      return leader ? [leader, ...workers] : agents;
    }
    
    if (structure === 'PIPELINE') {
      const ordering = rolesConfig.pipelineOrder || [];
      const ordered = ordering
        .map((agentId: string) => agents.find(a => a.id === agentId))
        .filter((a: AIAgent | undefined) => a !== undefined) as AIAgent[];
      const remaining = agents.filter(a => !ordering.includes(a.id));
      return [...ordered, ...remaining];
    }
    
    return agents;
  }

  private async executeCollaborative(context: TeamExecutionContext): Promise<any> {
    const agentOutputs: Record<string, any> = {};
    
    for (const agent of context.agents) {
      const prompt = `Working collaboratively with the team on this task:\n\n${context.task}\n\nProvide your analysis and contribution.`;
      
      const result = await this.executeAgent(agent, prompt, context);
      agentOutputs[agent.id] = result;
      
      this.addMessage({
        from: agent.id,
        content: `${agent.name}: ${JSON.stringify(result)}`,
        timestamp: new Date().toISOString(),
      }, context.teamId);
    }

    const collaborativePrompt = `Synthesize all team contributions into a unified response:\n\n${JSON.stringify(agentOutputs, null, 2)}`;
    
    const coordinator = context.agents[0];
    const finalResult = await this.executeAgent(coordinator, collaborativePrompt, context);

    return {
      output: finalResult,
      agentOutputs,
    };
  }

  private async executePipeline(context: TeamExecutionContext): Promise<any> {
    let pipelineOutput = context.task;
    const agentOutputs: Record<string, any> = {};
    
    for (let i = 0; i < context.agents.length; i++) {
      const agent = context.agents[i];
      const isFirst = i === 0;
      const isLast = i === context.agents.length - 1;
      
      let prompt: string;
      if (isFirst) {
        prompt = `You are the first agent in the pipeline. Process the following task:\n\n${context.task}`;
      } else if (isLast) {
        prompt = `You are the final agent in the pipeline. Finalize the output from the previous agent:\n\n${pipelineOutput}`;
      } else {
        prompt = `You are agent ${i + 1} in the pipeline. Process the output from the previous agent:\n\n${pipelineOutput}`;
      }
      
      const result = await this.executeAgent(agent, prompt, context);
      pipelineOutput = result.content || JSON.stringify(result);
      agentOutputs[agent.id] = result;
      
      this.addMessage({
        from: agent.id,
        to: i < context.agents.length - 1 ? context.agents[i + 1].id : undefined,
        content: `Pipeline Stage ${i + 1}: ${JSON.stringify(result)}`,
        timestamp: new Date().toISOString(),
      }, context.teamId);
    }

    return {
      output: pipelineOutput,
      agentOutputs,
    };
  }

  private async executeDemocratic(context: TeamExecutionContext): Promise<any> {
    const proposals: any[] = [];
    const agentOutputs: Record<string, any> = {};
    
    for (const agent of context.agents) {
      const prompt = `Propose your solution to the following task:\n\n${context.task}`;
      
      const result = await this.executeAgent(agent, prompt, context);
      proposals.push({
        agentId: agent.id,
        agentName: agent.name,
        proposal: result,
      });
      agentOutputs[agent.id] = result;
      
      this.addMessage({
        from: agent.id,
        content: `Proposal from ${agent.name}: ${JSON.stringify(result)}`,
        timestamp: new Date().toISOString(),
      }, context.teamId);
    }

    const votingPrompt = `Review the following proposals and select the best one:\n\n${JSON.stringify(proposals, null, 2)}\n\nReturn the index (0-based) of the best proposal.`;
    
    const votes: number[] = [];
    for (const agent of context.agents) {
      const voteResult = await this.executeAgent(agent, votingPrompt, context);
      const voteIndex = this.extractVoteIndex(voteResult, proposals.length);
      votes.push(voteIndex);
      
      this.addMessage({
        from: agent.id,
        content: `Vote: ${voteIndex}`,
        timestamp: new Date().toISOString(),
      }, context.teamId);
    }

    const winningIndex = this.getMostVoted(votes);
    const winningProposal = proposals[winningIndex];

    return {
      output: winningProposal.proposal,
      agentOutputs,
      votingResults: {
        proposals,
        votes,
        winner: winningProposal,
      },
    };
  }

  private async executeAgent(agent: AIAgent, prompt: string, context: TeamExecutionContext): Promise<any> {
    const tempWorkflow = {
      id: context.teamId,
      name: `Team Task - ${context.teamId}`,
      description: 'Team orchestration workflow',
      nodes: [{
        id: `agent-${agent.id}`,
        type: 'ai',
        data: {
          agentId: agent.id,
          prompt,
        },
      }],
      edges: [],
      status: 'ACTIVE' as const,
      userId: agent.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await workflowEngine.executeWorkflow(context.teamId, { task: context.task, prompt });
      return result.output || result;
    } catch (error: any) {
      return {
        type: 'error',
        message: error.message,
        content: `Failed to execute agent ${agent.name}`,
      };
    }
  }

  private addMessage(message: AgentMessage, teamId: string): void {
    const messages = this.messageHistory.get(teamId) || [];
    messages.push(message);
    this.messageHistory.set(teamId, messages);
  }

  private extractVoteIndex(voteResult: any, maxIndex: number): number {
    const content = typeof voteResult === 'string' ? voteResult : JSON.stringify(voteResult);
    
    const numberMatch = content.match(/\b\d+\b/);
    if (numberMatch) {
      const index = parseInt(numberMatch[0], 10);
      if (index >= 0 && index < maxIndex) {
        return index;
      }
    }
    
    return 0;
  }

  private getMostVoted(votes: number[]): number {
    const counts = votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let maxCount = 0;
    let winningIndex = 0;

    for (const [index, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        winningIndex = parseInt(index, 10);
      }
    }

    return winningIndex;
  }
}

export const teamOrchestrationEngine = new TeamOrchestrationEngine();
