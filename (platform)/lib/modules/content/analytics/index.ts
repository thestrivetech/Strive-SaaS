/**
 * Content Analytics Module - Public API
 *
 * Exports all analytics queries and utilities.
 */

// Content Analytics
export {
  getContentPerformance,
  getContentTrends,
  getTopPerformingContent,
  getContentPerformanceByType,
} from './content-analytics';

// Campaign Analytics
export {
  getCampaignMetrics,
  getEmailCampaignMetrics,
  getCampaignTrends,
  getTopCampaigns,
} from './campaign-analytics';

// Reports
export { generateAnalyticsReport, formatForExport } from './reports';
export type { AnalyticsReport } from './reports';
