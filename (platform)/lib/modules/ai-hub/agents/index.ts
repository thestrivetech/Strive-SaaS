/**
 * AI Hub Agents Module - Public API
 *
 * Backend module for AI agent management and execution
 * Database table: ai_agents (AI agent configurations)
 *
 * Multi-tenancy: ALL queries filtered by organizationId
 * RBAC: AI Hub access required (GROWTH tier minimum)
 */

// Export Server Actions
export {
  createAgent,
  updateAgent,
  executeAgent,
  deleteAgent,
  toggleAgentStatus,
  resetAgentStatus,
} from './actions';

// Export Data Queries
export {
  getAgents,
  getAgentById,
  getAgentStats,
  getAgentExecutions,
  getAllExecutions,
} from './queries';

// Export Schemas and Types
export {
  createAgentSchema,
  updateAgentSchema,
  agentFiltersSchema,
  executeAgentSchema,
  executionFiltersSchema,
  personalitySchema,
  modelConfigSchema,
  memorySchema,
  AI_PROVIDERS,
  AI_MODELS,
  type CreateAgentInput,
  type UpdateAgentInput,
  type AgentFilters,
  type ExecuteAgentInput,
  type ExecutionFilters,
  type Personality,
  type ModelConfig,
  type Memory,
  type AIProvider,
} from './schemas';

// Export Utilities
export {
  calculateTokenCost,
  validateAgentConfig,
  formatAgentResponse,
  calculateAgentMetrics,
  estimateTokenCount,
  getModelDisplayName,
  validateExecutionInput,
} from './utils';

// Export Providers
export {
  executeWithOpenAI,
  executeWithAnthropic,
  executeWithGroq,
  validateProviderApiKey,
  getAvailableProviders,
} from './providers';

// Export Execution Engine (also export direct function)
export { executeAgent as executeAgentEngine } from './execution';

// Re-export for workflow integration
export { executeAgent as executeAgentDirect } from './execution';

// Re-export Prisma types
export type { ai_agents as Agent, agent_executions as AgentExecution } from '@prisma/client';
