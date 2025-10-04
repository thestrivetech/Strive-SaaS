/**
 * Transaction Activity Module
 *
 * Public API for transaction activity feeds and audit logs
 *
 * Features:
 * - Activity feed from transaction audit logs
 * - Filter by loop or organization-wide
 * - Human-readable activity descriptions
 * - Activity icons and colors for UI
 *
 * All queries automatically filtered by organization via withTenantContext
 *
 * @example
 * ```typescript
 * import {
 *   getActivityFeed,
 *   getLoopActivity,
 *   formatActivityDescription
 * } from '@/lib/modules/transaction-activity';
 *
 * const activities = await getActivityFeed({ loopId: '123', limit: 20 });
 * const description = formatActivityDescription(activities[0]);
 * ```
 */

// Queries
export {
  getActivityFeed,
  getLoopActivity,
  getRecentActivity,
  getActivityByEntity,
  getLoopActivityCount,
} from './queries';

export type {
  ActivityFeedParams,
  Activity,
} from './queries';

// Formatters
export {
  formatActivityDescription,
  getActivityIcon,
  getActivityColor,
} from './formatters';
