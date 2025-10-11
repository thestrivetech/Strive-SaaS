import { z } from 'zod';
import { TeamStructure, TeamRole, ExecutionStatus } from '@prisma/client';

/**
 * Team Coordination Configuration Schema
 */
export const coordinationConfigSchema = z.object({
  // Hierarchical pattern config
  leaderDelegationStrategy: z.enum(['round_robin', 'capability_match', 'workload_balance']).optional(),
  workerReportingFormat: z.enum(['structured', 'narrative', 'metrics']).optional(),

  // Collaborative pattern config
  contributionWeights: z.record(z.string(), z.number()).optional(), // agentId -> weight
  consensusThreshold: z.number().min(0).max(1).default(0.6).optional(),

  // Pipeline pattern config
  pipelineOrder: z.array(z.string()).optional(), // array of agent IDs in order
  intermediateStorage: z.boolean().default(false).optional(),

  // Democratic pattern config
  votingMethod: z.enum(['majority', 'weighted', 'unanimous']).default('majority').optional(),
  tieBreaker: z.enum(['leader', 'random', 'first']).default('leader').optional(),

  // Common config
  maxRetries: z.number().int().min(0).max(5).default(2),
  timeout: z.number().int().min(1000).max(300000).default(60000), // milliseconds
  parallelExecution: z.boolean().default(false),
});

/**
 * Team Creation Schema
 */
export const createTeamSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(1000).optional(),
  structure: z.nativeEnum(TeamStructure),
  coordination: coordinationConfigSchema.default({}),
  organizationId: z.string().uuid(),
});

/**
 * Team Update Schema
 */
export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Add Team Member Schema
 */
export const addTeamMemberSchema = z.object({
  teamId: z.string().uuid(),
  agentId: z.string().uuid(),
  role: z.nativeEnum(TeamRole),
  priority: z.number().int().min(0).max(100).default(0),
});

/**
 * Update Team Member Schema
 */
export const updateTeamMemberSchema = z.object({
  id: z.string().uuid(),
  role: z.nativeEnum(TeamRole).optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

/**
 * Execute Team Schema
 */
export const executeTeamSchema = z.object({
  teamId: z.string().uuid(),
  task: z.string().min(1, 'Task is required'),
  context: z.record(z.string(), z.any()).optional(),
  patternOverride: z.nativeEnum(TeamStructure).optional(),
  maxTokens: z.number().int().positive().max(100000).optional(),
});

/**
 * Team Filters Schema
 */
export const teamFiltersSchema = z.object({
  structure: z.nativeEnum(TeamStructure).optional(),
  search: z.string().optional(),
  minMembers: z.number().int().positive().optional(),
  maxMembers: z.number().int().positive().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'execution_count', 'success_rate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Team Execution Filters Schema
 */
export const teamExecutionFiltersSchema = z.object({
  status: z.nativeEnum(ExecutionStatus).optional(),
  pattern: z.nativeEnum(TeamStructure).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Export types
export type CoordinationConfig = z.infer<typeof coordinationConfigSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type ExecuteTeamInput = z.infer<typeof executeTeamSchema>;
export type TeamFilters = z.infer<typeof teamFiltersSchema>;
export type TeamExecutionFilters = z.infer<typeof teamExecutionFiltersSchema>;
