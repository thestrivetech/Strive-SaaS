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

// Check if mock mode is enabled
import { dataConfig } from '@/lib/data/config';

// KPIs - Use mock data if enabled
export const getOverviewKPIs = dataConfig.useMocks
  ? async () => (await import('@/lib/data/providers/analytics-provider')).getOverviewKPIs()
  : async () => (await import('./kpis')).getOverviewKPIs();

export type { OverviewKPIs } from './kpis';

// Pipeline Metrics - Use mock data if enabled
export const getSalesFunnelData = dataConfig.useMocks
  ? async () => (await import('@/lib/data/providers/analytics-provider')).getSalesFunnelData()
  : async () => (await import('./pipeline-metrics')).getSalesFunnelData();

export const getPipelineByStage = dataConfig.useMocks
  ? async () => []
  : async () => (await import('./pipeline-metrics')).getPipelineByStage();

export const getStageConversionRates = dataConfig.useMocks
  ? async () => []
  : async () => (await import('./pipeline-metrics')).getStageConversionRates();

export const getAverageTimeInStage = dataConfig.useMocks
  ? async () => []
  : async () => (await import('./pipeline-metrics')).getAverageTimeInStage();

export type { SalesFunnelStage, PipelineByStage } from './pipeline-metrics';

// Revenue Metrics
export {
  getMonthlyRevenue,
  getRevenueBySource,
  getRevenueGrowthRate,
  getQuarterlyRevenue,
} from './revenue-metrics';
export type { MonthlyRevenue, RevenueBySource } from './revenue-metrics';

// Performance Metrics - Use mock data if enabled
export const getAgentPerformance = dataConfig.useMocks
  ? async (timeRange: any) => (await import('@/lib/data/providers/analytics-provider')).getAgentPerformance(timeRange)
  : async (timeRange: any) => (await import('./performance-metrics')).getAgentPerformance(timeRange);

export const getAgentPerformanceById = dataConfig.useMocks
  ? async () => null
  : async (agentId: string, timeRange: any) => (await import('./performance-metrics')).getAgentPerformanceById(agentId, timeRange);

export const getTeamActivityStats = dataConfig.useMocks
  ? async () => []
  : async () => (await import('./performance-metrics')).getTeamActivityStats();

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
