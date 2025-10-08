import { create } from 'zustand';
import { AgentPersonality, ModelConfig } from '@/lib/types/real-estate/agent';

interface AIAgent {
  id: string;
  name: string;
  description?: string;
  personality: AgentPersonality;
  modelConfig: ModelConfig;
  capabilities: string[];
  status: string;
  memory: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AgentState {
  agents: AIAgent[];
  selectedAgentId: string | null;
  isTraining: boolean;
  trainingProgress: number;
  conversations: Record<string, any[]>;
}

interface AgentActions {
  // Agent management
  addAgent: (agent: AIAgent) => void;
  updateAgent: (agentId: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (agentId: string) => void;
  selectAgent: (agentId: string | null) => void;
  
  // Agent operations
  activateAgent: (agentId: string) => void;
  deactivateAgent: (agentId: string) => void;
  cloneAgent: (agentId: string) => void;
  
  // Training management
  startTraining: (agentId: string) => void;
  stopTraining: () => void;
  updateTrainingProgress: (progress: number) => void;
  
  // Conversation management
  addMessage: (agentId: string, message: any) => void;
  clearConversation: (agentId: string) => void;
  getConversationHistory: (agentId: string) => any[];
  
  // Personality management
  updatePersonality: (agentId: string, personality: Partial<AgentPersonality>) => void;
  updateModelConfig: (agentId: string, modelConfig: Partial<ModelConfig>) => void;
  
  // Capabilities management
  addCapability: (agentId: string, capability: string) => void;
  removeCapability: (agentId: string, capability: string) => void;
  
  // Memory management
  updateMemory: (agentId: string, memory: any) => void;
  clearMemory: (agentId: string) => void;
  
  // Bulk operations
  setAgents: (agents: AIAgent[]) => void;
  clearAll: () => void;
  
  // Analytics
  getAgentStats: (agentId: string) => any;
  getActiveAgents: () => AIAgent[];
  getAgentsByStatus: (status: string) => AIAgent[];
}

const initialState: AgentState = {
  agents: [],
  selectedAgentId: null,
  isTraining: false,
  trainingProgress: 0,
  conversations: {},
};

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
  ...initialState,

  // Agent management
  addAgent: (agent) => {
    set((state) => ({
      agents: [...state.agents, agent]
    }));
  },

  updateAgent: (agentId, updates) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates, updatedAt: new Date() } : agent
      )
    }));
  },

  deleteAgent: (agentId) => {
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== agentId),
      selectedAgentId: state.selectedAgentId === agentId ? null : state.selectedAgentId,
      conversations: Object.fromEntries(
        Object.entries(state.conversations).filter(([id]) => id !== agentId)
      )
    }));
  },

  selectAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  // Agent operations
  activateAgent: (agentId) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'ACTIVE', updatedAt: new Date() } : agent
      )
    }));
  },

  deactivateAgent: (agentId) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'IDLE', updatedAt: new Date() } : agent
      )
    }));
  },

  cloneAgent: (agentId) => {
    const { agents } = get();
    const agentToClone = agents.find(agent => agent.id === agentId);
    if (!agentToClone) return;

    const clonedAgent: AIAgent = {
      ...agentToClone,
      id: `${agentToClone.id}-clone-${Date.now()}`,
      name: `${agentToClone.name} (Copy)`,
      status: 'IDLE',
      memory: {
        vectorEmbeddings: [],
        conversationHistory: [],
        knowledgeBase: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      agents: [...state.agents, clonedAgent]
    }));
  },

  // Training management
  startTraining: (agentId) => {
    set({ isTraining: true, trainingProgress: 0 });
    
    // Simulate training progress
    const interval = setInterval(() => {
      const { trainingProgress, isTraining } = get();
      if (!isTraining) {
        clearInterval(interval);
        return;
      }
      
      const newProgress = trainingProgress + Math.random() * 10;
      if (newProgress >= 100) {
        set({ trainingProgress: 100, isTraining: false });
        clearInterval(interval);
      } else {
        set({ trainingProgress: newProgress });
      }
    }, 500);
  },

  stopTraining: () => {
    set({ isTraining: false, trainingProgress: 0 });
  },

  updateTrainingProgress: (progress) => {
    set({ trainingProgress: Math.min(100, Math.max(0, progress)) });
  },

  // Conversation management
  addMessage: (agentId, message) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [agentId]: [...(state.conversations[agentId] || []), {
          ...message,
          timestamp: new Date().toISOString(),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }]
      }
    }));
  },

  clearConversation: (agentId) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [agentId]: []
      }
    }));
  },

  getConversationHistory: (agentId) => {
    const { conversations } = get();
    return conversations[agentId] || [];
  },

  // Personality management
  updatePersonality: (agentId, personalityUpdates) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              personality: { ...agent.personality, ...personalityUpdates },
              updatedAt: new Date()
            } 
          : agent
      )
    }));
  },

  updateModelConfig: (agentId, modelConfigUpdates) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              modelConfig: { ...agent.modelConfig, ...modelConfigUpdates },
              updatedAt: new Date()
            } 
          : agent
      )
    }));
  },

  // Capabilities management
  addCapability: (agentId, capability) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              capabilities: [...agent.capabilities, capability],
              updatedAt: new Date()
            } 
          : agent
      )
    }));
  },

  removeCapability: (agentId, capability) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              capabilities: agent.capabilities.filter((c: string) => c !== capability),
              updatedAt: new Date()
            } 
          : agent
      )
    }));
  },

  // Memory management
  updateMemory: (agentId, memoryUpdates) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              memory: { ...agent.memory, ...memoryUpdates },
              updatedAt: new Date()
            } 
          : agent
      )
    }));
  },

  clearMemory: (agentId) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId 
          ? { 
              ...agent, 
              memory: {
                vectorEmbeddings: [],
                conversationHistory: [],
                knowledgeBase: []
              },
              updatedAt: new Date()
            } 
          : agent
      ),
      conversations: {
        ...state.conversations,
        [agentId]: []
      }
    }));
  },

  // Bulk operations
  setAgents: (agents) => {
    set({ agents });
  },

  clearAll: () => {
    set({
      agents: [],
      selectedAgentId: null,
      conversations: {},
      isTraining: false,
      trainingProgress: 0
    });
  },

  // Analytics
  getAgentStats: (agentId) => {
    const { agents, conversations } = get();
    const agent = agents.find(a => a.id === agentId);
    const conversation = conversations[agentId] || [];
    
    if (!agent) return null;

    return {
      totalMessages: conversation.length,
      averageResponseTime: conversation.length > 0 
        ? conversation.reduce((sum, msg) => sum + (msg.responseTime || 0), 0) / conversation.length 
        : 0,
      successRate: conversation.length > 0 
        ? conversation.filter(msg => msg.status === 'success').length / conversation.length * 100 
        : 0,
      capabilityCount: agent.capabilities.length,
      personalityTraits: agent.personality.traits.length,
      lastActivity: agent.updatedAt,
      status: agent.status
    };
  },

  getActiveAgents: () => {
    const { agents } = get();
    return agents.filter(agent => agent.status === 'ACTIVE');
  },

  getAgentsByStatus: (status) => {
    const { agents } = get();
    return agents.filter(agent => agent.status === status);
  }
}));

// Selectors for computed values
export const useAgents = () => useAgentStore(state => state.agents);
export const useSelectedAgent = () => {
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const agents = useAgentStore(state => state.agents);
  return selectedAgentId ? agents.find(agent => agent.id === selectedAgentId) : null;
};
export const useIsTraining = () => useAgentStore(state => state.isTraining);
export const useTrainingProgress = () => useAgentStore(state => state.trainingProgress);

// Agent statistics
export const useAgentStats = () => {
  const agents = useAgentStore(state => state.agents);
  
  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'ACTIVE').length,
    idleAgents: agents.filter(a => a.status === 'IDLE').length,
    busyAgents: agents.filter(a => a.status === 'BUSY').length,
    offlineAgents: agents.filter(a => a.status === 'OFFLINE').length,
    agentsByProvider: agents.reduce((acc, agent) => {
      const provider = agent.modelConfig.provider;
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgCapabilities: agents.length > 0 
      ? agents.reduce((sum, agent) => sum + agent.capabilities.length, 0) / agents.length 
      : 0
  };
};

// Conversation selectors
export const useAgentConversation = (agentId: string) => {
  return useAgentStore(state => state.conversations[agentId] || []);
};

export const useConversationStats = (agentId: string) => {
  const conversation = useAgentConversation(agentId);
  
  return {
    totalMessages: conversation.length,
    recentMessages: conversation.slice(-10),
    averageLength: conversation.length > 0 
      ? conversation.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / conversation.length 
      : 0
  };
};
