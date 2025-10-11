import 'server-only';

import type { AIProvider, ModelConfig } from './schemas';

/**
 * Cost rates per model (USD per 1M tokens)
 * Updated as of 2025-10-10
 */
const COST_RATES: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-4': { input: 30, output: 60 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },

  // Anthropic Claude
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'claude-3-sonnet-20240229': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },

  // Groq
  'llama3-70b-8192': { input: 0.59, output: 0.79 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
};

/**
 * Calculate token cost based on provider, model, and token usage
 */
export function calculateTokenCost(
  provider: AIProvider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = COST_RATES[model];

  if (!rates) {
    console.warn(`No cost rates found for model: ${model}, using default rates`);
    return ((inputTokens * 1) + (outputTokens * 2)) / 1000000; // Default fallback
  }

  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;

  return inputCost + outputCost;
}

/**
 * Validate agent configuration
 */
export function validateAgentConfig(config: ModelConfig): {
  valid: boolean;
  error?: string;
} {
  // Validate provider
  if (!['openai', 'anthropic', 'groq'].includes(config.provider)) {
    return { valid: false, error: 'Invalid provider' };
  }

  // Validate temperature
  if (config.temperature < 0 || config.temperature > 2) {
    return { valid: false, error: 'Temperature must be between 0 and 2' };
  }

  // Validate max_tokens
  if (config.max_tokens < 1 || config.max_tokens > 32000) {
    return { valid: false, error: 'Max tokens must be between 1 and 32000' };
  }

  // Validate top_p
  if (config.top_p < 0 || config.top_p > 1) {
    return { valid: false, error: 'Top P must be between 0 and 1' };
  }

  return { valid: true };
}

/**
 * Format agent response for client
 */
export function formatAgentResponse(response: {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}) {
  return {
    content: response.content,
    tokens: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
      total: response.usage?.total_tokens || 0,
    },
  };
}

/**
 * Track agent metrics and update averages
 */
export async function calculateAgentMetrics(agentExecutions: {
  duration: number | null;
  status: string;
}[]): Promise<{
  avgResponseTime: number | null;
  successRate: number | null;
}> {
  if (agentExecutions.length === 0) {
    return { avgResponseTime: null, successRate: null };
  }

  // Calculate average response time (only completed executions with duration)
  const completedWithDuration = agentExecutions.filter(
    (e) => e.status === 'COMPLETED' && e.duration !== null
  );

  const avgResponseTime =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) /
        completedWithDuration.length
      : null;

  // Calculate success rate
  const successfulExecutions = agentExecutions.filter(
    (e) => e.status === 'COMPLETED'
  ).length;

  const successRate =
    agentExecutions.length > 0
      ? (successfulExecutions / agentExecutions.length) * 100
      : null;

  return { avgResponseTime, successRate };
}

/**
 * Estimate token count (rough approximation)
 * More accurate methods require tokenizer libraries
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ~= 4 characters for English
  return Math.ceil(text.length / 4);
}

/**
 * Get model display name
 */
export function getModelDisplayName(model: string): string {
  const displayNames: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'llama3-70b-8192': 'Llama 3 70B',
    'mixtral-8x7b-32768': 'Mixtral 8x7B',
  };

  return displayNames[model] || model;
}

/**
 * Validate execution input
 */
export function validateExecutionInput(
  task: string,
  maxTokens?: number
): { valid: boolean; error?: string } {
  if (!task || task.trim().length === 0) {
    return { valid: false, error: 'Task cannot be empty' };
  }

  if (task.length > 10000) {
    return { valid: false, error: 'Task is too long (max 10000 characters)' };
  }

  if (maxTokens && (maxTokens < 1 || maxTokens > 32000)) {
    return { valid: false, error: 'Max tokens must be between 1 and 32000' };
  }

  return { valid: true };
}
