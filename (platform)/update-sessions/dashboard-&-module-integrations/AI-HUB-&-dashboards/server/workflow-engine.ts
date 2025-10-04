import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import type { Workflow, AIAgent } from "@shared/schema";
import { wsService } from "./websocket";
import { getAgentTools, ToolExecutor } from "./ai-tools";

// the newest OpenAI model is "gpt-4o" - use this as default  
const DEFAULT_OPENAI_MODEL = "gpt-4o";
// "claude-sonnet-4-20250514" is the latest Anthropic model
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

interface NodeExecutionResult {
  nodeId: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  output: any;
  duration: number;
  error?: string;
}

interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, any>;
  agentOutputs: Record<string, any>;
}

export class WorkflowExecutionEngine {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private toolExecutor: ToolExecutor;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    this.toolExecutor = new ToolExecutor();
  }

  async executeWorkflow(workflowId: string, input: any): Promise<any> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution = await storage.createWorkflowExecution({
      workflowId,
      status: 'RUNNING',
      input,
      output: null,
      steps: [],
      executionTime: null,
      errorMessage: null,
      triggeredBy: 'manual',
    });

    wsService.notifyWorkflowStarted(workflowId, execution.id);

    const startTime = Date.now();
    const context: ExecutionContext = {
      workflowId,
      executionId: execution.id,
      variables: { ...input },
      agentOutputs: {},
    };

    try {
      const results = await this.executeNodes(workflow, context);
      const executionTime = Date.now() - startTime;
      
      const allSuccess = results.every(r => r.status === 'SUCCESS' || r.status === 'SKIPPED');
      const finalOutput = this.buildFinalOutput(results, context);

      await storage.updateWorkflowExecution(execution.id, {
        status: allSuccess ? 'SUCCESS' : 'FAILED',
        output: finalOutput,
        steps: results as any[],
        executionTime,
        errorMessage: allSuccess ? null : 'Some nodes failed',
      });

      if (allSuccess) {
        wsService.notifyWorkflowCompleted(workflowId, execution.id, finalOutput);
      } else {
        wsService.notifyWorkflowFailed(workflowId, execution.id, 'Some nodes failed');
      }

      return { success: allSuccess, results, output: finalOutput };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      await storage.updateWorkflowExecution(execution.id, {
        status: 'FAILED',
        output: null,
        steps: [],
        executionTime,
        errorMessage: error.message,
      });

      wsService.notifyWorkflowFailed(workflowId, execution.id, error.message);

      throw error;
    }
  }

  private async executeNodes(workflow: Workflow, context: ExecutionContext): Promise<NodeExecutionResult[]> {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];
    const results: NodeExecutionResult[] = [];

    const sortedNodes = this.topologicalSort(nodes, edges);

    for (const node of sortedNodes) {
      const result = await this.executeNode(node, context);
      results.push(result);

      if (result.status === 'SUCCESS') {
        context.agentOutputs[node.id] = result.output;
        context.variables[node.id] = result.output;
      }
    }

    return results;
  }

  private async executeNode(node: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    wsService.notifyNodeStarted(context.workflowId, context.executionId, node.id);

    try {
      let output: any;

      switch (node.type) {
        case 'trigger':
          output = await this.executeTriggerNode(node, context);
          break;
        case 'ai':
          output = await this.executeAINode(node, context);
          break;
        case 'action':
          output = await this.executeActionNode(node, context);
          break;
        case 'condition':
          output = await this.executeConditionNode(node, context);
          break;
        case 'api':
          output = await this.executeAPINode(node, context);
          break;
        default:
          output = { message: 'Node type not implemented', nodeType: node.type };
      }

      const result = {
        nodeId: node.id,
        status: 'SUCCESS' as const,
        output,
        duration: Date.now() - startTime,
      };

      wsService.notifyNodeCompleted(context.workflowId, context.executionId, node.id, output);

      return result;
    } catch (error: any) {
      wsService.notifyNodeFailed(context.workflowId, context.executionId, node.id, error.message);
      
      return {
        nodeId: node.id,
        status: 'FAILED',
        output: null,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private async executeTriggerNode(node: any, context: ExecutionContext): Promise<any> {
    return {
      type: 'trigger',
      label: node.data?.label || 'Trigger',
      input: context.variables,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeAINode(node: any, context: ExecutionContext): Promise<any> {
    const agentId = node.data?.agentId;
    if (!agentId) {
      return {
        type: 'ai',
        message: 'No agent specified for this AI node',
        simulated: true,
      };
    }

    const agent = await storage.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentExecution = await storage.createAgentExecution({
      agentId: agent.id,
      status: 'RUNNING',
      task: node.data?.prompt || 'Execute AI task',
      input: context.variables as any,
      output: null,
      executionTime: null,
      errorMessage: null,
      workflowExecutionId: context.executionId,
    });

    const execStartTime = Date.now();
    let agentStatusSet = false;

    try {
      try {
        await storage.updateAgent(agent.id, { status: 'BUSY' });
        agentStatusSet = true;
      } catch (err) {
      }

      const result = await this.executeAIAgent(agent, node, context);
      const executionTime = Date.now() - execStartTime;

      await storage.updateAgentExecution(agentExecution.id, {
        status: 'SUCCESS',
        output: result,
        executionTime,
      });

      return result;
    } catch (error: any) {
      const executionTime = Date.now() - execStartTime;
      
      await storage.updateAgentExecution(agentExecution.id, {
        status: 'FAILED',
        output: null,
        executionTime,
        errorMessage: error.message,
      });

      throw error;
    } finally {
      if (agentStatusSet) {
        try {
          await storage.updateAgent(agent.id, { status: 'IDLE' });
        } catch (err) {
        }
      }
    }
  }

  private async executeAIAgent(agent: AIAgent, node: any, context: ExecutionContext): Promise<any> {
    const provider = agent.modelConfig.provider;
    const model = agent.modelConfig.model;
    const prompt = this.buildPrompt(agent, node, context);

    if (provider === 'openai') {
      if (!this.openaiClient) {
        throw new Error('OpenAI API key not configured');
      }

      const agentTools = getAgentTools(agent);
      const openaiTools = agentTools.map(tool => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(agent),
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const maxTokens = agent.modelConfig.parameters?.max_tokens || 4096;
      const completionParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
        model: model || DEFAULT_OPENAI_MODEL,
        messages,
        max_tokens: maxTokens,
      };

      if (openaiTools.length > 0) {
        completionParams.tools = openaiTools;
        completionParams.tool_choice = 'auto';
      }

      const response = await this.openaiClient.chat.completions.create(completionParams);
      const message = response.choices[0].message;

      let content = message.content || '';
      const toolCalls = message.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        const toolResults = await Promise.all(
          toolCalls.map(async (toolCall) => {
            if (toolCall.type === 'function') {
              const args = JSON.parse(toolCall.function.arguments);
              return await this.toolExecutor.executeTool({
                name: toolCall.function.name,
                arguments: args,
              });
            }
            return { name: 'unknown', result: null, error: 'Unknown tool type' };
          })
        );

        messages.push(message);
        
        toolCalls.forEach((toolCall, index) => {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResults[index]),
          });
        });

        const followUpResponse = await this.openaiClient.chat.completions.create({
          model: model || DEFAULT_OPENAI_MODEL,
          messages,
          max_tokens: maxTokens,
        });

        content = followUpResponse.choices[0].message.content || '';
      }

      if (!agent.memory.conversationHistory) {
        agent.memory.conversationHistory = [];
      }

      agent.memory.conversationHistory.push({
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      });
      agent.memory.conversationHistory.push({
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      });

      await storage.updateAgent(agent.id, {
        memory: agent.memory,
      });

      return {
        provider: 'openai',
        model,
        content,
        usage: response.usage,
      };
    } else if (provider === 'anthropic') {
      if (!this.anthropicClient) {
        throw new Error('Anthropic API key not configured');
      }

      const response = await this.anthropicClient.messages.create({
        model: model || DEFAULT_ANTHROPIC_MODEL,
        system: this.buildSystemPrompt(agent),
        max_tokens: agent.modelConfig.parameters?.max_tokens || 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      if (!agent.memory.conversationHistory) {
        agent.memory.conversationHistory = [];
      }

      agent.memory.conversationHistory.push({
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      });
      agent.memory.conversationHistory.push({
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      });

      await storage.updateAgent(agent.id, {
        memory: agent.memory,
      });

      return {
        provider: 'anthropic',
        model,
        content,
        usage: response.usage,
      };
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private buildSystemPrompt(agent: AIAgent): string {
    const personality = agent.personality;
    
    return `You are ${agent.name}, ${agent.description || 'an AI assistant'}.

Personality Traits: ${personality.traits.join(', ')}
Communication Style: ${personality.communicationStyle}
Areas of Expertise: ${personality.expertise.join(', ')}

Capabilities: ${agent.capabilities.join(', ')}

Provide responses that align with your personality and expertise.`;
  }

  private buildPrompt(agent: AIAgent, node: any, context: ExecutionContext): string {
    let prompt = node.data?.prompt || node.data?.label || 'Process the input';

    const variablePattern = /\{\{(\w+)\}\}/g;
    prompt = prompt.replace(variablePattern, (_: string, varName: string) => {
      return context.variables[varName] !== undefined 
        ? JSON.stringify(context.variables[varName])
        : `{{${varName}}}`;
    });

    const recentHistory = agent.memory.conversationHistory?.slice(-5) || [];
    if (recentHistory.length > 0) {
      prompt += `\n\nRecent conversation context:\n${recentHistory.map(msg => 
        `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`
      ).join('\n')}`;
    }

    if (Object.keys(context.variables).length > 0) {
      prompt += `\n\nWorkflow context:\n${JSON.stringify(context.variables, null, 2)}`;
    }

    return prompt;
  }

  private async executeActionNode(node: any, context: ExecutionContext): Promise<any> {
    return {
      type: 'action',
      label: node.data?.label || 'Action',
      executed: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeConditionNode(node: any, context: ExecutionContext): Promise<any> {
    const condition = node.data?.condition || 'true';
    const result = this.evaluateCondition(condition, context);
    
    return {
      type: 'condition',
      condition,
      result,
      branchTaken: result ? 'true' : 'false',
    };
  }

  private async executeAPINode(node: any, context: ExecutionContext): Promise<any> {
    return {
      type: 'api',
      label: node.data?.label || 'API Call',
      executed: true,
      timestamp: new Date().toISOString(),
    };
  }

  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    try {
      const trimmed = condition.trim().toLowerCase();
      
      if (trimmed === 'true') return true;
      if (trimmed === 'false') return false;
      
      const basicComparisons = /^(\w+)\s*(===|!==|==|!=|>|<|>=|<=)\s*(.+)$/;
      const match = condition.match(basicComparisons);
      
      if (match) {
        const [, left, operator, right] = match;
        const leftValue = this.resolveValue(left.trim(), context);
        const rightValue = this.resolveValue(right.trim(), context);
        
        switch (operator) {
          case '===':
          case '==':
            return leftValue == rightValue;
          case '!==':
          case '!=':
            return leftValue != rightValue;
          case '>':
            return Number(leftValue) > Number(rightValue);
          case '<':
            return Number(leftValue) < Number(rightValue);
          case '>=':
            return Number(leftValue) >= Number(rightValue);
          case '<=':
            return Number(leftValue) <= Number(rightValue);
          default:
            return false;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }
  
  private resolveValue(value: string, context: ExecutionContext): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    if (value.includes('.')) {
      const parts = value.split('.');
      let current: any = context.variables;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    }
    
    return context.variables[value];
  }

  private buildFinalOutput(results: NodeExecutionResult[], context: ExecutionContext): any {
    return {
      summary: {
        totalNodes: results.length,
        successfulNodes: results.filter(r => r.status === 'SUCCESS').length,
        failedNodes: results.filter(r => r.status === 'FAILED').length,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      },
      nodeResults: results,
      finalVariables: context.variables,
      agentOutputs: context.agentOutputs,
    };
  }

  private topologicalSort(nodes: any[], edges: any[]): any[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      adjList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const queue: any[] = [];
    const sorted: any[] = [];

    nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node);
      }
    });

    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);

      adjList.get(node.id)?.forEach(targetId => {
        const newDegree = (inDegree.get(targetId) || 0) - 1;
        inDegree.set(targetId, newDegree);

        if (newDegree === 0) {
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) {
            queue.push(targetNode);
          }
        }
      });
    }

    return sorted.length === nodes.length ? sorted : nodes;
  }
}

export const workflowEngine = new WorkflowExecutionEngine();
