import { 
  type User, 
  type InsertUser,
  type Workflow,
  type InsertWorkflow,
  type AIAgent,
  type InsertAIAgent,
  type AgentTeam,
  type InsertAgentTeam,
  type TeamMember,
  type InsertTeamMember,
  type Integration,
  type InsertIntegration,
  type WorkflowExecution,
  type InsertWorkflowExecution,
  type AgentExecution,
  type InsertAgentExecution,
  type Template,
  type InsertTemplate,
  users,
  workflows,
  aiAgents,
  agentTeams,
  teamMembers,
  integrations,
  workflowExecutions,
  agentExecutions,
  templates
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workflow operations
  getWorkflows(userId: string): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;

  // AI Agent operations
  getAgents(userId: string): Promise<AIAgent[]>;
  getAgent(id: string): Promise<AIAgent | undefined>;
  createAgent(agent: InsertAIAgent): Promise<AIAgent>;
  updateAgent(id: string, agent: Partial<InsertAIAgent>): Promise<AIAgent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Agent Team operations
  getTeams(userId: string): Promise<AgentTeam[]>;
  getTeam(id: string): Promise<AgentTeam | undefined>;
  createTeam(team: InsertAgentTeam): Promise<AgentTeam>;
  updateTeam(id: string, team: Partial<InsertAgentTeam>): Promise<AgentTeam | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Team Member operations
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(id: string): Promise<boolean>;

  // Integration operations
  getIntegrations(userId: string): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  // Execution operations
  getWorkflowExecutions(workflowId?: string, limit?: number): Promise<WorkflowExecution[]>;
  getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined>;
  createWorkflowExecution(execution: InsertWorkflowExecution): Promise<WorkflowExecution>;
  updateWorkflowExecution(id: string, execution: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined>;

  // Agent Execution operations
  getAgentExecutions(agentId?: string, limit?: number): Promise<AgentExecution[]>;
  createAgentExecution(execution: InsertAgentExecution): Promise<AgentExecution>;
  updateAgentExecution(id: string, execution: Partial<InsertAgentExecution>): Promise<AgentExecution | undefined>;

  // Template operations
  getTemplates(category?: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  getPublicTemplates(): Promise<Template[]>;

  // Analytics operations
  getExecutionMetrics(userId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    successRate: number;
  }>;
  getAgentPerformanceMetrics(userId: string): Promise<Array<{
    agentId: string;
    agentName: string;
    totalExecutions: number;
    successfulExecutions: number;
    successRate: number;
  }>>;
  getCostMetrics(userId: string): Promise<{
    totalTokens: number;
    totalCost: number;
    costByModel: Array<{
      model: string;
      tokens: number;
      cost: number;
    }>;
  }>;
}


// Database Storage Implementation
export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Workflow operations
  async getWorkflows(userId: string): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.userId, userId));
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    const result = await db.select().from(workflows).where(eq(workflows.id, id));
    return result[0];
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const result = await db.insert(workflows).values(insertWorkflow).returning();
    return result[0];
  }

  async updateWorkflow(id: string, update: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const result = await db.update(workflows).set(update).where(eq(workflows.id, id)).returning();
    return result[0];
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id)).returning();
    return result.length > 0;
  }

  // AI Agent operations
  async getAgents(userId: string): Promise<AIAgent[]> {
    return await db.select().from(aiAgents).where(eq(aiAgents.userId, userId));
  }

  async getAgent(id: string): Promise<AIAgent | undefined> {
    const result = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return result[0];
  }

  async createAgent(insertAgent: InsertAIAgent): Promise<AIAgent> {
    const result = await db.insert(aiAgents).values(insertAgent as any).returning();
    return result[0];
  }

  async updateAgent(id: string, update: Partial<InsertAIAgent>): Promise<AIAgent | undefined> {
    const result = await db.update(aiAgents).set(update as any).where(eq(aiAgents.id, id)).returning();
    return result[0];
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(aiAgents).where(eq(aiAgents.id, id)).returning();
    return result.length > 0;
  }

  // Agent Team operations
  async getTeams(userId: string): Promise<AgentTeam[]> {
    return await db.select().from(agentTeams).where(eq(agentTeams.userId, userId));
  }

  async getTeam(id: string): Promise<AgentTeam | undefined> {
    const result = await db.select().from(agentTeams).where(eq(agentTeams.id, id));
    return result[0];
  }

  async createTeam(insertTeam: InsertAgentTeam): Promise<AgentTeam> {
    const result = await db.insert(agentTeams).values(insertTeam as any).returning();
    return result[0];
  }

  async updateTeam(id: string, update: Partial<InsertAgentTeam>): Promise<AgentTeam | undefined> {
    const result = await db.update(agentTeams).set(update as any).where(eq(agentTeams.id, id)).returning();
    return result[0];
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(agentTeams).where(eq(agentTeams.id, id)).returning();
    return result.length > 0;
  }

  // Team Member operations
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async addTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const result = await db.insert(teamMembers).values(insertMember as any).returning();
    return result[0];
  }

  async removeTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return result.length > 0;
  }

  // Integration operations
  async getIntegrations(userId: string): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const result = await db.select().from(integrations).where(eq(integrations.id, id));
    return result[0];
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const result = await db.insert(integrations).values(insertIntegration as any).returning();
    return result[0];
  }

  async updateIntegration(id: string, update: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const result = await db.update(integrations).set(update as any).where(eq(integrations.id, id)).returning();
    return result[0];
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id)).returning();
    return result.length > 0;
  }

  // Execution operations
  async getWorkflowExecutions(workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
    if (workflowId) {
      return await db.select().from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, workflowId))
        .orderBy(desc(workflowExecutions.createdAt))
        .limit(limit);
    }
    return await db.select().from(workflowExecutions)
      .orderBy(desc(workflowExecutions.createdAt))
      .limit(limit);
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    const result = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
    return result[0];
  }

  async createWorkflowExecution(insertExecution: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const result = await db.insert(workflowExecutions).values(insertExecution).returning();
    return result[0];
  }

  async updateWorkflowExecution(id: string, update: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined> {
    const result = await db.update(workflowExecutions).set(update).where(eq(workflowExecutions.id, id)).returning();
    return result[0];
  }

  // Agent Execution operations
  async getAgentExecutions(agentId?: string, limit = 50): Promise<AgentExecution[]> {
    if (agentId) {
      return await db.select().from(agentExecutions)
        .where(eq(agentExecutions.agentId, agentId))
        .orderBy(desc(agentExecutions.createdAt))
        .limit(limit);
    }
    return await db.select().from(agentExecutions)
      .orderBy(desc(agentExecutions.createdAt))
      .limit(limit);
  }

  async createAgentExecution(insertExecution: InsertAgentExecution): Promise<AgentExecution> {
    const result = await db.insert(agentExecutions).values(insertExecution).returning();
    return result[0];
  }

  async updateAgentExecution(id: string, update: Partial<InsertAgentExecution>): Promise<AgentExecution | undefined> {
    const result = await db.update(agentExecutions).set(update).where(eq(agentExecutions.id, id)).returning();
    return result[0];
  }

  // Template operations
  async getTemplates(category?: string): Promise<Template[]> {
    if (category) {
      return await db.select().from(templates).where(eq(templates.category, category));
    }
    return await db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const result = await db.insert(templates).values(insertTemplate as any).returning();
    return result[0];
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isPublic, true));
  }

  // Analytics operations
  async getExecutionMetrics(userId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    successRate: number;
  }> {
    const userWorkflows = await this.getWorkflows(userId);
    const workflowIds = userWorkflows.map(w => w.id);
    
    if (workflowIds.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageDuration: 0,
        successRate: 0,
      };
    }

    const allExecutions: WorkflowExecution[] = [];
    for (const workflowId of workflowIds) {
      const executions = await this.getWorkflowExecutions(workflowId, 1000);
      allExecutions.push(...executions);
    }

    const totalExecutions = allExecutions.length;
    const successfulExecutions = allExecutions.filter(e => e.status === 'SUCCESS').length;
    const failedExecutions = allExecutions.filter(e => e.status === 'FAILED').length;
    
    const durations = allExecutions
      .filter(e => e.executionTime !== null && e.executionTime !== undefined)
      .map(e => e.executionTime!);
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;
    
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageDuration,
      successRate,
    };
  }

  async getAgentPerformanceMetrics(userId: string): Promise<Array<{
    agentId: string;
    agentName: string;
    totalExecutions: number;
    successfulExecutions: number;
    successRate: number;
  }>> {
    const userAgents = await this.getAgents(userId);
    
    const metrics = await Promise.all(
      userAgents.map(async (agent) => {
        const executions = await this.getAgentExecutions(agent.id, 1000);
        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter(e => e.status === 'SUCCESS').length;
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

        return {
          agentId: agent.id,
          agentName: agent.name,
          totalExecutions,
          successfulExecutions,
          successRate,
        };
      })
    );

    return metrics.sort((a, b) => b.totalExecutions - a.totalExecutions);
  }

  async getCostMetrics(userId: string): Promise<{
    totalTokens: number;
    totalCost: number;
    costByModel: Array<{
      model: string;
      tokens: number;
      cost: number;
    }>;
  }> {
    const userAgents = await this.getAgents(userId);
    
    const allExecutions: AgentExecution[] = [];
    for (const agent of userAgents) {
      const executions = await this.getAgentExecutions(agent.id, 1000);
      allExecutions.push(...executions);
    }

    const modelCosts: Record<string, { tokens: number; cost: number }> = {};
    let totalTokens = 0;
    let totalCost = 0;

    const TOKEN_COSTS: Record<string, number> = {
      'gpt-4': 0.03 / 1000,
      'gpt-4-turbo': 0.01 / 1000,
      'gpt-3.5-turbo': 0.0015 / 1000,
      'claude-3-opus': 0.015 / 1000,
      'claude-3-sonnet': 0.003 / 1000,
      'claude-3-haiku': 0.00025 / 1000,
    };

    for (const execution of allExecutions) {
      const estimatedTokens = execution.executionTime ? Math.floor(execution.executionTime / 10) : 0;
      if (estimatedTokens > 0) {
        const agent = userAgents.find(a => a.id === execution.agentId);
        const model = agent?.modelConfig?.model || 'gpt-3.5-turbo';
        const tokens = estimatedTokens;
        const costPerToken = TOKEN_COSTS[model] || 0.001 / 1000;
        const cost = tokens * costPerToken;

        if (!modelCosts[model]) {
          modelCosts[model] = { tokens: 0, cost: 0 };
        }
        modelCosts[model].tokens += tokens;
        modelCosts[model].cost += cost;

        totalTokens += tokens;
        totalCost += cost;
      }
    }

    const costByModel = Object.entries(modelCosts).map(([model, data]) => ({
      model,
      tokens: data.tokens,
      cost: data.cost,
    }));

    return {
      totalTokens,
      totalCost,
      costByModel,
    };
  }
}

export const storage = new DbStorage();
