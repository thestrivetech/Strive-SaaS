/**
 * Analytics Module
 *
 * Public API for CRM analytics and reporting
 *
 * Features:
 * - KPI calculations (leads, pipeline, revenue)
 * - Sales funnel metrics
 * - Revenue tracking and trends
 * - Agent performance tracking
 * - Revenue forecasting
 *
 * All queries automatically filtered by organization via withTenantContext
 *
 * @example
 * ```typescript
 * import { getOverviewKPIs, getSalesFunnelData } from '@/lib/modules/analytics';
 *
 * const kpis = await getOverviewKPIs();
 * const funnel = await getSalesFunnelData();
 * ```
 */

// KPIs
export { getOverviewKPIs } from './kpis';
export type { OverviewKPIs } from './kpis';

// Pipeline Metrics
export {
  getSalesFunnelData,
  getPipelineByStage,
  getStageConversionRates,
  getAverageTimeInStage,
} from './pipeline-metrics';
export type { SalesFunnelStage, PipelineByStage } from './pipeline-metrics';

// Revenue Metrics
export {
  getMonthlyRevenue,
  getRevenueBySource,
  getRevenueGrowthRate,
  getQuarterlyRevenue,
} from './revenue-metrics';
export type { MonthlyRevenue, RevenueBySource } from './revenue-metrics';

// Performance Metrics
export {
  getAgentPerformance,
  getAgentPerformanceById,
  getTeamActivityStats,
} from './performance-metrics';
export type {
  AgentMetrics,
  AgentPerformance,
  TimeRange,
} from './performance-metrics';

// Forecasting
export {
  getForecast,
  getPipelineForecast,
  getForecastByStage,
} from './forecasting';
export type { ForecastData, ForecastResult } from './forecasting';
