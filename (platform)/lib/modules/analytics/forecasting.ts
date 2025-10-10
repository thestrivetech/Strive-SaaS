import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from 'date-fns';

/**
 * Revenue Forecasting Module
 *
 * Provides revenue predictions based on historical data:
 * - Linear trend forecasting
 * - Historical revenue analysis
 * - Growth rate projections
 *
 * All queries automatically filtered by organization via withTenantContext
 */

export interface ForecastData {
  month: string;
  value: number;
  isForecast: boolean;
}

export interface ForecastResult {
  historical: ForecastData[];
  forecast: ForecastData[];
  avgGrowthRate: number;
}

/**
 * Generate revenue forecast for the next N months
 *
 * Uses historical data from last 6 months to calculate average growth
 * and project future revenue using linear trend
 *
 * @param months - Number of months to forecast (default: 3)
 * @returns Historical data and forecast
 */
export async function getForecast(months = 3): Promise<ForecastResult> {
  return withTenantContext(async () => {
    const now = new Date();

    // Get historical revenue (last 6 months)
    const historicalData: ForecastData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const revenue = await prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { value: true },
      });

      historicalData.push({
        month: format(monthStart, 'MMM yyyy'),
        value: Number(revenue._sum.value || 0),
        isForecast: false,
      });
    }

    // Calculate average growth rate
    const avgGrowth = calculateAverageGrowth(historicalData);

    // Generate forecast
    const forecastData: ForecastData[] = [];
    let lastValue = historicalData[historicalData.length - 1].value;

    for (let i = 1; i <= months; i++) {
      const forecastMonth = addMonths(now, i);
      lastValue = lastValue * (1 + avgGrowth / 100);

      forecastData.push({
        month: format(forecastMonth, 'MMM yyyy'),
        value: lastValue,
        isForecast: true,
      });
    }

    return {
      historical: historicalData,
      forecast: forecastData,
      avgGrowthRate: avgGrowth,
    };
  });
}

/**
 * Calculate average growth rate from historical data
 *
 * @param data - Array of historical data points
 * @returns Average month-over-month growth rate as percentage
 */
function calculateAverageGrowth(data: ForecastData[]): number {
  if (data.length < 2) return 0;

  let totalGrowth = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const curr = data[i].value;

    if (prev > 0) {
      totalGrowth += ((curr - prev) / prev) * 100;
      count++;
    }
  }

  return count > 0 ? totalGrowth / count : 0;
}

/**
 * Get pipeline-based revenue forecast
 *
 * Calculates expected revenue based on current pipeline
 * and historical win rates
 *
 * @returns Expected revenue from pipeline
 */
export async function getPipelineForecast(): Promise<{
  expectedRevenue: number;
  pipelineValue: number;
  avgWinRate: number;
}> {
  return withTenantContext(async () => {
    // Get total pipeline value
    const pipeline = await prisma.deals.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { value: true },
    });

    // Calculate historical win rate
    const [wonDeals, totalClosedDeals] = await Promise.all([
      prisma.deals.count({ where: { status: 'WON' } }),
      prisma.deals.count({
        where: {
          status: {
            in: ['WON', 'LOST'],
          },
        },
      }),
    ]);

    const avgWinRate = totalClosedDeals > 0 ? (wonDeals / totalClosedDeals) * 100 : 50;
    const pipelineValue = Number(pipeline._sum.value || 0);
    const expectedRevenue = pipelineValue * (avgWinRate / 100);

    return {
      expectedRevenue,
      pipelineValue,
      avgWinRate,
    };
  });
}

/**
 * Get forecast by deal stage
 *
 * Calculates expected revenue from each pipeline stage
 * based on historical conversion rates
 *
 * @returns Array of stage forecasts
 */
export async function getForecastByStage(): Promise<
  Array<{ stage: string; pipelineValue: number; expectedRevenue: number; probability: number }>
> {
  return withTenantContext(async () => {
    // Get pipeline by stage
    const pipelineByStage = await prisma.deals.groupBy({
      by: ['stage'],
      where: { status: 'ACTIVE' },
      _sum: { value: true },
      _count: { id: true },
    });

    // Calculate conversion probability for each stage
    const stageProbabilities: Record<string, number> = {
      LEAD: 10,
      QUALIFIED: 25,
      PROPOSAL: 50,
      NEGOTIATION: 75,
      CLOSING: 90,
      CLOSED_WON: 100,
    };

    return pipelineByStage.map((stage: any) => {
      const pipelineValue = Number(stage._sum.value || 0);
      const probability = stageProbabilities[stage.stage] || 50;
      const expectedRevenue = pipelineValue * (probability / 100);

      return {
        stage: stage.stage,
        pipelineValue,
        expectedRevenue,
        probability,
      };
    });
  });
}
