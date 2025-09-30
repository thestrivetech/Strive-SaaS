// AI Configuration for tier-based model access and rate limiting
export type AIProvider = 'openrouter' | 'groq';
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
}

export interface TierConfig {
  providers: AIProvider[];
  models: AIModel[];
  rateLimit: {
    requests: number; // -1 for unlimited
    window: number; // in seconds
  };
}

// Available AI models
export const AI_MODELS: Record<string, AIModel> = {
  // Groq models (fast open-source)
  'llama-3.1-8b-instant': {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: 'groq',
    description: 'Fast, lightweight model for simple tasks',
  },
  'mixtral-8x7b-32768': {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Balanced performance and speed',
  },
  'llama-3.1-70b-versatile': {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    description: 'Advanced open-source model',
  },
  'llama-3.3-70b-versatile': {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    description: 'Latest Llama model with improved capabilities',
  },

  // OpenRouter models (proprietary)
  'gpt-3.5-turbo': {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openrouter',
    description: 'Fast and efficient ChatGPT model',
  },
  'claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    description: 'Fast Claude model for simple tasks',
  },
  'gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    description: 'Advanced reasoning and analysis',
  },
  'claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    description: 'Most capable Claude model',
  },
  'gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    description: 'Latest GPT-4 with vision capabilities',
  },
};

// Tier-based model access configuration
export const TIER_MODELS: Record<SubscriptionTier, TierConfig> = {
  FREE: {
    providers: ['groq'],
    models: [
      AI_MODELS['llama-3.1-8b-instant'],
      AI_MODELS['mixtral-8x7b-32768'],
    ],
    rateLimit: {
      requests: 10, // 10 requests per hour
      window: 3600,
    },
  },
  BASIC: {
    providers: ['groq', 'openrouter'],
    models: [
      AI_MODELS['llama-3.1-70b-versatile'],
      AI_MODELS['gpt-3.5-turbo'],
      AI_MODELS['claude-3-haiku'],
    ],
    rateLimit: {
      requests: 100, // 100 requests per hour
      window: 3600,
    },
  },
  PRO: {
    providers: ['groq', 'openrouter'],
    models: [
      AI_MODELS['llama-3.3-70b-versatile'],
      AI_MODELS['gpt-4-turbo'],
      AI_MODELS['claude-3.5-sonnet'],
    ],
    rateLimit: {
      requests: 500, // 500 requests per hour
      window: 3600,
    },
  },
  ENTERPRISE: {
    providers: ['groq', 'openrouter'],
    models: Object.values(AI_MODELS),
    rateLimit: {
      requests: -1, // Unlimited
      window: 3600,
    },
  },
};

// Get models available for a specific tier
export function getModelsForTier(tier: SubscriptionTier): AIModel[] {
  return TIER_MODELS[tier].models;
}

// Check if a model is available for a tier
export function isModelAvailable(tier: SubscriptionTier, modelId: string): boolean {
  return TIER_MODELS[tier].models.some((m) => m.id === modelId);
}

// Get provider for a model ID
export function getProviderForModel(modelId: string): AIProvider {
  const model = Object.values(AI_MODELS).find((m) => m.id === modelId);
  return model?.provider || 'groq';
}

// Get rate limit for tier
export function getRateLimitForTier(tier: SubscriptionTier) {
  return TIER_MODELS[tier].rateLimit;
}