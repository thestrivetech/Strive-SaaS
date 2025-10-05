/**
 * Transaction Analytics Module
 *
 * Public API for transaction analytics and reporting
 *
 * Features:
 * - Transaction overview metrics (total, active, closed loops)
 * - Document/task/signature statistics
 * - Loop velocity tracking (monthly trends)
 * - Chart data formatters for visualization
 * - Completion rate calculations
 *
 * All queries automatically filtered by organization via withTenantContext
 *
 * @example
 * ```typescript
 * import { getTransactionAnalytics, getLoopVelocity } from '@/lib/modules/transactions/analytics';
 *
 * const analytics = await getTransactionAnalytics({ startDate, endDate });
 * const velocity = await getLoopVelocity({ months: 6 });
 * ```
 */

// Queries
export {
  getTransactionAnalytics,
  getLoopVelocity,
  getAnalyticsByType,
  getAnalyticsByStatus,
} from './queries';

export type {
  TransactionAnalyticsParams,
  AnalyticsOverview,
  DocumentStats,
  TaskStats,
  SignatureStats,
  TransactionAnalytics,
  LoopVelocityParams,
  LoopVelocityData,
} from './queries';

// Chart Formatters
export {
  formatDocumentStats,
  formatTaskStats,
  formatSignatureStats,
  formatLoopVelocity,
  formatStatusData,
  formatTypeData,
  calculateCompletionRate,
  calculateTaskCompletionRate,
  calculateSignatureCompletionRate,
  formatCurrency,
} from './charts';

export type {
  ChartDataPoint,
  TimeSeriesDataPoint,
} from './charts';
