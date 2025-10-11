import { z } from 'zod';
import { AgentStatus, ExecutionStatus } from '@prisma/client';

/**
 * AI Providers supported
 */
export const AI_PROVIDERS = ['openai', 'anthropic', 'groq'] as const;
export type AIProvider = typeof AI_PROVIDERS[number];

/**
 * AI Models per provider
 */
export const AI_MODELS = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  groq: ['llama3-70b-8192', 'mixtral-8x7b-32768'],
} as const;

/**
 * Personality Schema
 */
export const personalitySchema = z.object({
  traits: z.array(z.string()).default([]),
  tone: z.enum(['professional', 'casual', 'friendly', 'technical', 'creative']).default('professional'),
  expertise: z.array(z.string()).default([]),
  communication_style: z.string().optional(),
});

/**
 * Model Configuration Schema
 */
export const modelConfigSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(1).max(32000).default(4000),
  top_p: z.number().min(0).max(1).default(1),
  frequency_penalty: z.number().min(-2).max(2).default(0).optional(),
  presence_penalty: z.number().min(-2).max(2).default(0).optional(),
});

/**
 * Memory Schema
 */
export const memorySchema = z.object({
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string(),
  })).default([]),
  context_window: z.number().default(10),
  knowledge_base: z.array(z.string()).default([]),
});

/**
 * Agent Creation Schema
 */
export const createAgentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(1000).optional(),
  avatar: z.string().url().optional(),
  personality: personalitySchema.default({}),
  model_config: modelConfigSchema,
  capabilities: z.array(z.string()).default([]),
  memory: memorySchema.default({}),
  is_active: z.boolean().default(true),
  organizationId: z.string().uuid(),
});

/**
 * Agent Update Schema
 */
export const updateAgentSchema = createAgentSchema.partial().extend({
  id: z.string().uuid(),
  status: z.nativeEnum(AgentStatus).optional(),
});

/**
 * Agent Filters Schema
 */
export const agentFiltersSchema = z.object({
  status: z.nativeEnum(AgentStatus).optional(),
  provider: z.enum(AI_PROVIDERS).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  capabilities: z.array(z.string()).optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'execution_count', 'success_rate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Agent Execution Input Schema
 */
export const executeAgentSchema = z.object({
  agentId: z.string().uuid(),
  task: z.string().min(1, 'Task is required'),
  context: z.record(z.string(), z.any()).optional(),
  maxTokens: z.number().int().positive().max(32000).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

/**
 * Execution Filters Schema
 */
export const executionFiltersSchema = z.object({
  status: z.nativeEnum(ExecutionStatus).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Export types
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentFilters = z.infer<typeof agentFiltersSchema>;
export type ExecuteAgentInput = z.infer<typeof executeAgentSchema>;
export type ExecutionFilters = z.infer<typeof executionFiltersSchema>;
export type Personality = z.infer<typeof personalitySchema>;
export type ModelConfig = z.infer<typeof modelConfigSchema>;
export type Memory = z.infer<typeof memorySchema>;
