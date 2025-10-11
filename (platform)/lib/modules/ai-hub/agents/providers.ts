import 'server-only';

import type { ModelConfig } from './schemas';
import { calculateTokenCost, estimateTokenCount } from './utils';

/**
 * Execute agent with OpenAI
 */
export async function executeWithOpenAI(
  config: ModelConfig,
  task: string,
  context?: Record<string, any>
): Promise<{
  content: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: context?.systemPrompt || 'You are a helpful AI assistant.',
      },
      {
        role: 'user',
        content: task,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty || 0,
        presence_penalty: config.presence_penalty || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    const content = data.choices[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const tokensUsed = data.usage?.total_tokens || 0;

    const cost = calculateTokenCost('openai', config.model, inputTokens, outputTokens);

    return {
      content,
      tokensUsed,
      inputTokens,
      outputTokens,
      cost,
    };
  } catch (error: any) {
    throw new Error(`OpenAI execution failed: ${error.message}`);
  }
}

/**
 * Execute agent with Anthropic Claude
 */
export async function executeWithAnthropic(
  config: ModelConfig,
  task: string,
  context?: Record<string, any>
): Promise<{
  content: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: task,
          },
        ],
        system: context?.systemPrompt || 'You are a helpful AI assistant.',
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        top_p: config.top_p,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    const content = data.content[0]?.text || '';
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const tokensUsed = inputTokens + outputTokens;

    const cost = calculateTokenCost('anthropic', config.model, inputTokens, outputTokens);

    return {
      content,
      tokensUsed,
      inputTokens,
      outputTokens,
      cost,
    };
  } catch (error: any) {
    throw new Error(`Anthropic execution failed: ${error.message}`);
  }
}

/**
 * Execute agent with Groq
 */
export async function executeWithGroq(
  config: ModelConfig,
  task: string,
  context?: Record<string, any>
): Promise<{
  content: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: context?.systemPrompt || 'You are a helpful AI assistant.',
      },
      {
        role: 'user',
        content: task,
      },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    const content = data.choices[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const tokensUsed = data.usage?.total_tokens || 0;

    const cost = calculateTokenCost('groq', config.model, inputTokens, outputTokens);

    return {
      content,
      tokensUsed,
      inputTokens,
      outputTokens,
      cost,
    };
  } catch (error: any) {
    throw new Error(`Groq execution failed: ${error.message}`);
  }
}

/**
 * Validate API key for provider
 */
export function validateProviderApiKey(provider: string): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'groq':
      return !!process.env.GROQ_API_KEY;
    default:
      return false;
  }
}

/**
 * Get available providers (those with API keys configured)
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];

  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.GROQ_API_KEY) providers.push('groq');

  return providers;
}
