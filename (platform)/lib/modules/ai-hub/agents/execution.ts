import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { ExecutionStatus, AgentStatus } from '@prisma/client';
import { executeWithOpenAI, executeWithAnthropic, executeWithGroq } from './providers';
import { validateAgentConfig, validateExecutionInput, calculateAgentMetrics } from './utils';
import type { ModelConfig, Memory } from './schemas';

/**
 * Execute an AI agent with a task
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeAgent(
  agentId: string,
  organizationId: string,
  task: string,
  context?: Record<string, any>,
  workflowExecutionId?: string
): Promise<{
  id: string;
  output: any;
  tokensUsed: number;
  cost: number;
  duration: number;
}> {
  await setTenantContext({ organizationId });

  // Validate execution input
  const validation = validateExecutionInput(task);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get agent
  const agent = await prisma.ai_agents.findFirst({
    where: { id: agentId, organization_id: organizationId },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  if (!agent.is_active) {
    throw new Error('Agent is not active');
  }

  // Validate agent configuration
  const modelConfig = agent.model_config as unknown as ModelConfig;
  const configValidation = validateAgentConfig(modelConfig);
  if (!configValidation.valid) {
    throw new Error(`Invalid agent configuration: ${configValidation.error}`);
  }

  // Create execution record
  const execution = await prisma.agent_executions.create({
    data: {
      id: `agent_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent_id: agentId,
      workflow_execution_id: workflowExecutionId,
      task,
      input: context || {},
      status: ExecutionStatus.PENDING,
    },
  });

  // Update agent status to BUSY
  await prisma.ai_agents.update({
    where: { id: agentId },
    data: { status: AgentStatus.BUSY },
  });

  const startTime = Date.now();

  try {
    // Update execution to RUNNING
    await prisma.agent_executions.update({
      where: { id: execution.id },
      data: { status: ExecutionStatus.RUNNING },
    });

    // Build system prompt with personality
    const personality = agent.personality as any;
    const memory = agent.memory as unknown as Memory;

    let systemPrompt = context?.systemPrompt || 'You are a helpful AI assistant.';

    if (personality?.traits && personality.traits.length > 0) {
      systemPrompt += `\n\nYour personality traits: ${personality.traits.join(', ')}.`;
    }

    if (personality?.tone) {
      systemPrompt += `\nCommunication tone: ${personality.tone}.`;
    }

    if (personality?.expertise && personality.expertise.length > 0) {
      systemPrompt += `\nExpertise areas: ${personality.expertise.join(', ')}.`;
    }

    // Add conversation history if available
    if (memory?.conversation_history && memory.conversation_history.length > 0) {
      const recentHistory = memory.conversation_history.slice(-(memory.context_window || 10));
      systemPrompt += `\n\nRecent conversation history:\n${recentHistory
        .map((h: any) => `${h.role}: ${h.content}`)
        .join('\n')}`;
    }

    const enhancedContext = {
      ...context,
      systemPrompt,
    };

    // Execute with appropriate provider
    let result: {
      content: string;
      tokensUsed: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };

    switch (modelConfig.provider) {
      case 'openai':
        result = await executeWithOpenAI(modelConfig, task, enhancedContext);
        break;
      case 'anthropic':
        result = await executeWithAnthropic(modelConfig, task, enhancedContext);
        break;
      case 'groq':
        result = await executeWithGroq(modelConfig, task, enhancedContext);
        break;
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }

    const duration = Date.now() - startTime;

    // Update execution as COMPLETED
    await prisma.agent_executions.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.COMPLETED,
        completed_at: new Date(),
        duration,
        output: { content: result.content },
        tokens_used: result.tokensUsed,
        cost: result.cost,
        model: modelConfig.model,
        provider: modelConfig.provider,
      },
    });

    // Update agent memory with new conversation
    const updatedMemory = memory || { conversation_history: [], context_window: 10 };
    updatedMemory.conversation_history = [
      ...(updatedMemory.conversation_history || []),
      {
        role: 'user' as const,
        content: task,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant' as const,
        content: result.content,
        timestamp: new Date().toISOString(),
      },
    ].slice(-(updatedMemory.context_window || 10) * 2); // Keep last N conversations (user + assistant pairs)

    // Update agent metrics
    const recentExecutions = await prisma.agent_executions.findMany({
      where: { agent_id: agentId },
      select: { duration: true, status: true },
      orderBy: { started_at: 'desc' },
      take: 100, // Last 100 executions for metrics
    });

    const metrics = await calculateAgentMetrics(recentExecutions);

    await prisma.ai_agents.update({
      where: { id: agentId },
      data: {
        status: AgentStatus.IDLE,
        execution_count: { increment: 1 },
        memory: updatedMemory as any,
        avg_response_time: metrics.avgResponseTime,
        success_rate: metrics.successRate,
      },
    });

    return {
      id: execution.id,
      output: { content: result.content },
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      duration,
    };
  } catch (error: any) {
    // Update execution as FAILED
    await prisma.agent_executions.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.FAILED,
        completed_at: new Date(),
        duration: Date.now() - startTime,
        output: { error: error.message },
      },
    });

    // Update agent status
    await prisma.ai_agents.update({
      where: { id: agentId },
      data: {
        status: AgentStatus.ERROR,
        execution_count: { increment: 1 },
      },
    });

    // Recalculate metrics including failed execution
    const recentExecutions = await prisma.agent_executions.findMany({
      where: { agent_id: agentId },
      select: { duration: true, status: true },
      orderBy: { started_at: 'desc' },
      take: 100,
    });

    const metrics = await calculateAgentMetrics(recentExecutions);

    await prisma.ai_agents.update({
      where: { id: agentId },
      data: {
        avg_response_time: metrics.avgResponseTime,
        success_rate: metrics.successRate,
      },
    });

    throw error;
  }
}
