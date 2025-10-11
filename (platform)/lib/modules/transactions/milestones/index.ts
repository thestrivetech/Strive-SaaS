/**
 * Milestones Module
 *
 * Provides milestone tracking and progress calculation functionality
 * for transaction loops.
 *
 * @module milestones
 */

// Calculator functions (Server Actions)
export {
  calculateLoopProgress,
  recalculateAllLoopProgress,
  getProgressSummary,
} from './calculator';

// Utility functions (Pure functions - can be used client or server)
export {
  getMilestonesForType,
  getCurrentMilestone,
  getNextMilestone,
  type Milestone,
  TRANSACTION_MILESTONES,
} from './utils';
