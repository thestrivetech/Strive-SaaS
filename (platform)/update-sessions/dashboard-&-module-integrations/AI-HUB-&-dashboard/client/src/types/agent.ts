export interface AgentPersonality {
  traits: string[];
  communicationStyle: string;
  expertise: string[];
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'groq' | 'perplexity';
  model: string;
  parameters: Record<string, any>;
}

export interface AgentMemory {
  vectorEmbeddings?: any[];
  conversationHistory?: any[];
  knowledgeBase?: any[];
}

export type AgentStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'OFFLINE';
export type TeamStructure = 'HIERARCHICAL' | 'COLLABORATIVE' | 'PIPELINE' | 'DEMOCRATIC';

export interface AgentRole {
  name: string;
  permissions: string[];
  responsibilities: string[];
}

export interface TeamConfiguration {
  roles: Record<string, AgentRole>;
  communicationPatterns: string[];
  decisionMaking: string;
}
