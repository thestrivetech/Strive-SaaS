/**
 * AI Hub - Agent Teams Module
 *
 * Team orchestration with coordination patterns:
 * - Hierarchical: Leader-worker delegation
 * - Collaborative: Equal contribution consensus
 * - Pipeline: Sequential processing
 * - Democratic: Voting-based decisions
 */

// ========================================
// SCHEMAS & TYPES
// ========================================

export {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberSchema,
  executeTeamSchema,
  teamFiltersSchema,
  teamExecutionFiltersSchema,
  coordinationConfigSchema,
  type CoordinationConfig,
  type CreateTeamInput,
  type UpdateTeamInput,
  type AddTeamMemberInput,
  type UpdateTeamMemberInput,
  type ExecuteTeamInput,
  type TeamFilters,
  type TeamExecutionFilters,
} from './schemas';

// ========================================
// QUERIES (Data Fetching)
// ========================================

export {
  getTeams,
  getTeamById,
  getTeamStats,
  getTeamExecutions,
  getTeamMember,
  isAgentInTeam,
  getTeamsWithAgent,
} from './queries';

// ========================================
// ACTIONS (Server Actions)
// ========================================

export {
  createTeam,
  updateTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  executeTeam,
  deleteTeam,
} from './actions';

// ========================================
// EXECUTION ENGINE
// ========================================

export { executeTeam as executeTeamDirect } from './execution';

// ========================================
// UTILITIES
// ========================================

export {
  validateTeamStructure,
  calculateTeamMetrics,
  formatTeamResponse,
  assignTasksByRole,
  aggregateResults,
  validateExecutionInput,
  extractMemberIds,
  calculateTotalCost,
  calculateTotalTokens,
} from './utils';

// ========================================
// PATTERNS (Coordination Strategies)
// ========================================

export {
  executeHierarchical,
  executeCollaborative,
  executePipeline,
  executeDemocratic,
  executePattern,
} from './patterns';
