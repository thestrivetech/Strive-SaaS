import OpenAI from 'openai';
import type { AIProvider } from './config';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatOptions {
  model: string;
  provider: AIProvider;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private openrouterClient: OpenAI | null = null;
  private groqClient: OpenAI | null = null;

  constructor() {
    // Initialize OpenRouter client (OpenAI-compatible)
    if (process.env.OPENROUTER_API_KEY) {
      this.openrouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://app.strivetech.ai',
          'X-Title': 'Strive Tech SaaS Platform',
        },
      });
    }

    // Initialize Groq client (OpenAI-compatible)
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
  }

  /**
   * Send a chat message and get a response
   */
  async chat(messages: AIMessage[], options: ChatOptions): Promise<AIResponse> {
    const client = options.provider === 'groq' ? this.groqClient : this.openrouterClient;

    if (!client) {
      throw new Error(
        `${options.provider === 'groq' ? 'Groq' : 'OpenRouter'} client not initialized. Check API keys.`
      );
    }

    try {
      const response = await client.chat.completions.create({
        model: options.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No response from AI model');
      }

      return {
        content: choice.message.content,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      console.error('AI Service Error:', error);

      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes('rate_limit')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.message.includes('insufficient_quota')) {
          throw new Error('Insufficient API quota. Please contact support.');
        }
        throw error;
      }

      throw new Error('Failed to get AI response');
    }
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: AIProvider): boolean {
    return provider === 'groq' ? this.groqClient !== null : this.openrouterClient !== null;
  }

  /**
   * Get the default provider based on availability
   */
  getDefaultProvider(): AIProvider {
    if (this.groqClient) return 'groq';
    if (this.openrouterClient) return 'openrouter';
    throw new Error('No AI providers configured');
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}