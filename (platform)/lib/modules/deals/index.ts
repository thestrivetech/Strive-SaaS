/**
 * Deals Module - Public API
 *
 * Central export point for all deals-related functionality
 * This module handles deal management, pipeline visualization, and forecasting
 *
 * Features:
 * - Create, read, update, delete deals
 * - Pipeline stage management
 * - Deal forecasting and metrics
 * - Multi-tenancy support
 * - RBAC enforcement
 */

// Schemas and Types
export {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  closeDealSchema,
  dealFiltersSchema,
  bulkUpdateDealsSchema,
  deleteDealSchema,
  type CreateDealInput,
  type UpdateDealInput,
  type UpdateDealStageInput,
  type CloseDealInput,
  type DealFilters,
  type BulkUpdateDealsInput,
  type DeleteDealInput,
} from './schemas';

// Queries
export {
  getDeals,
  getDealById,
  getDealsByStage,
  getDealMetrics,
  getDealsCount,
  getDealsByContact,
  getDealsByLead,
  type DealWithAssignee,
  type DealWithRelations,
  type DealsByStageResult,
} from './queries';

// Actions
export {
  createDeal,
  updateDeal,
  updateDealStage,
  closeDeal,
  bulkUpdateDeals,
  deleteDeal,
} from './actions';

// Pipeline utilities
export {
  PIPELINE_STAGES,
  getStageConfig,
  getStageTitle,
  getStageProbability,
  getStageColor,
  validateStageTransition,
  calculateWeightedValue,
  calculatePipelineForecast,
  analyzePipelineHealth,
  getNextStage,
  calculateStageStats,
  type StageConfig,
  type PipelineForecast,
  type PipelineHealth,
  type StageStats,
} from './pipeline';

// Re-export Prisma types
export type { deals, DealStage, DealStatus } from '@prisma/client';
