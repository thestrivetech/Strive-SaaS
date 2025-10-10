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

// Queries - Core
export {
  getDeals,
  getDealById,
  getDealsCount,
  getDealsByContact,
  getDealsByLead,
} from './queries';

// Queries - Pipeline
export {
  getDealsByStage,
} from './queries/pipeline';

// Queries - Analytics
export {
  getDealMetrics,
} from './queries/analytics';

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
} from './pipeline';

// Re-export Prisma types
export type { deals, DealStage, DealStatus } from '@prisma/client';
