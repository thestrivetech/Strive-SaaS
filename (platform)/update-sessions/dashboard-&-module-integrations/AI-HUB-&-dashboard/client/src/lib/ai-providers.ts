// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229".

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  contextWindow: number;
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: AIModel[];
  requiresApiKey: boolean;
  website: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry-leading language models with broad capabilities',
    requiresApiKey: true,
    website: 'https://openai.com',
    models: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Most advanced OpenAI model with superior reasoning',
        maxTokens: 8192,
        contextWindow: 128000
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Fast, multimodal flagship model',
        maxTokens: 4096,
        contextWindow: 128000
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Affordable and intelligent small model',
        maxTokens: 4096,
        contextWindow: 128000
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast, cost-effective model for simple tasks',
        maxTokens: 4096,
        contextWindow: 16384
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Constitutional AI models focused on being helpful, harmless, and honest',
    requiresApiKey: true,
    website: 'https://anthropic.com',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'Latest Claude model with enhanced reasoning capabilities',
        maxTokens: 8192,
        contextWindow: 200000
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Balanced model with strong performance across tasks',
        maxTokens: 8192,
        contextWindow: 200000
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'High-performance model for complex reasoning',
        maxTokens: 8192,
        contextWindow: 200000
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Fast and cost-effective for everyday tasks',
        maxTokens: 4096,
        contextWindow: 200000
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference for real-time applications',
    requiresApiKey: true,
    website: 'https://groq.com',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        description: 'Powerful open-source model with excellent performance',
        maxTokens: 8192,
        contextWindow: 131072
      },
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B',
        description: 'High-quality open-source model for diverse tasks',
        maxTokens: 8192,
        contextWindow: 131072
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Mixture of experts model with strong performance',
        maxTokens: 8192,
        contextWindow: 32768
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        description: 'Google\'s efficient open model',
        maxTokens: 4096,
        contextWindow: 8192
      }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Real-time search-augmented AI models',
    requiresApiKey: true,
    website: 'https://perplexity.ai',
    models: [
      {
        id: 'llama-3.1-sonar-large-128k-online',
        name: 'Llama 3.1 Sonar Large Online',
        description: 'Search-enhanced model with real-time web access',
        maxTokens: 8192,
        contextWindow: 127072
      },
      {
        id: 'llama-3.1-sonar-small-128k-online',
        name: 'Llama 3.1 Sonar Small Online',
        description: 'Efficient search-enhanced model',
        maxTokens: 4096,
        contextWindow: 127072
      },
      {
        id: 'llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B Instruct',
        description: 'Fast offline model for general tasks',
        maxTokens: 4096,
        contextWindow: 131072
      }
    ]
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Google\'s Gemini models with multimodal capabilities',
    requiresApiKey: true,
    website: 'https://ai.google.dev',
    models: [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: 'Latest experimental Gemini model',
        maxTokens: 8192,
        contextWindow: 1000000
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Most capable Gemini model',
        maxTokens: 8192,
        contextWindow: 2000000
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and versatile Gemini model',
        maxTokens: 8192,
        contextWindow: 1000000
      }
    ]
  }
];

export function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

export function getModel(providerId: string, modelId: string): AIModel | undefined {
  const provider = getProvider(providerId);
  return provider?.models.find(m => m.id === modelId);
}

export function getModelOptions(providerId: string): AIModel[] {
  const provider = getProvider(providerId);
  return provider?.models || [];
}

export function getDefaultModel(providerId: string): AIModel | undefined {
  const provider = getProvider(providerId);
  return provider?.models[0];
}

export function validateModelConfig(providerId: string, modelId: string, parameters: any): boolean {
  const model = getModel(providerId, modelId);
  if (!model) return false;

  // Validate max_tokens parameter
  if (parameters.max_tokens && parameters.max_tokens > model.maxTokens) {
    return false;
  }

  // Validate max_completion_tokens parameter (for newer models)
  if (parameters.max_completion_tokens && parameters.max_completion_tokens > model.maxTokens) {
    return false;
  }

  return true;
}

export function getProviderDisplayName(providerId: string): string {
  const provider = getProvider(providerId);
  return provider?.name || providerId;
}

export function getModelDisplayName(providerId: string, modelId: string): string {
  const model = getModel(providerId, modelId);
  return model?.name || modelId;
}

// Provider-specific configuration helpers
export function getProviderRequirements(providerId: string): string[] {
  const requirements: Record<string, string[]> = {
    openai: ['API Key from OpenAI Platform'],
    anthropic: ['API Key from Anthropic Console'],
    groq: ['API Key from Groq Cloud'],
    perplexity: ['API Key from Perplexity AI'],
    google: ['API Key from Google AI Studio']
  };
  
  return requirements[providerId] || ['API Key required'];
}

export function getProviderInstructions(providerId: string): string {
  const instructions: Record<string, string> = {
    openai: 'Get your API key from https://platform.openai.com/api-keys',
    anthropic: 'Get your API key from https://console.anthropic.com/account/keys',
    groq: 'Get your API key from https://console.groq.com/keys',
    perplexity: 'Get your API key from https://perplexity.ai/settings/api',
    google: 'Get your API key from https://aistudio.google.com/app/apikey'
  };
  
  return instructions[providerId] || 'Contact the provider for API access instructions';
}
