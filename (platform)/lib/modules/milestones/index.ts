/**
 * Milestones Module
 *
 * Provides milestone tracking and progress calculation functionality
 * for transaction loops.
 *
 * @module milestones
 */

// Calculator functions
export {
  calculateLoopProgress,
  recalculateAllLoopProgress,
  getProgressSummary,
} from './calculator';

// Schemas and utilities
export {
  MilestoneSchema,
  TRANSACTION_MILESTONES,
  getMilestonesForType,
  getCurrentMilestone,
  getNextMilestone,
} from './schemas';

// Types
export type { Milestone } from './schemas';
