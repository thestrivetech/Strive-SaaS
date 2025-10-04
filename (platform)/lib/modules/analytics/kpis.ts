import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Analytics KPIs Module
 *
 * Provides core KPI calculations for CRM analytics:
 * - Lead metrics (total, new, conversion rate)
 * - Pipeline metrics (active deals, total value, avg deal value)
 * - Revenue metrics (MTD, MoM growth, won deals)
 * - Activity metrics
 *
 * All queries automatically filtered by organization via withTenantContext
 */

export interface OverviewKPIs {
  leads: {
    total: number;
    new: number;
    change: number;
  };
  pipeline: {
    activeDealCount: number;
    totalValue: number;
    avgDealValue: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    wonDeals: number;
  };
  conversionRate: number;
  activitiesLast30Days: number;
}

/**
 * Get overview KPIs for the dashboard
 *
 * Calculates all primary KPIs in parallel for performance
 * Includes month-over-month comparisons
 *
 * @returns Overview KPIs with all metrics
 */
export async function getOverviewKPIs(): Promise<OverviewKPIs> {
  return withTenantContext(async () => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const lastMonth = subMonths(now, 1);

    const [
      // Leads metrics
      totalLeads,
      newLeadsLast30Days,
      leadsLastMonth,
      conversionRate,

      // Pipeline metrics
      activeDealCount,
      pipelineValue,
      avgDealValue,

      // Revenue metrics
      wonDealsThisMonth,
      revenueThisMonth,
      revenueLastMonth,

      // Activities
      activitiesLast30Days,
    ] = await Promise.all([
      // Total leads
      prisma.leads.count(),

      // New leads last 30 days
      prisma.leads.count({
        where: { created_at: { gte: last30Days } },
      }),

      // Leads from last month
      prisma.leads.count({
        where: {
          created_at: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
      }),

      // Conversion rate (leads to deals)
      calculateConversionRate(),

      // Active deals
      prisma.deals.count({
        where: { status: 'ACTIVE' },
      }),

      // Pipeline value
      prisma.deals.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { value: true },
      }),

      // Average deal value
      prisma.deals.aggregate({
        where: { status: 'ACTIVE' },
        _avg: { value: true },
      }),

      // Won deals this month
      prisma.deals.count({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
      }),

      // Revenue this month
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
        _sum: { value: true },
      }),

      // Revenue last month
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
        _sum: { value: true },
      }),

      // Activities last 30 days
      prisma.activities.count({
        where: { created_at: { gte: last30Days } },
      }),
    ]);

    // Calculate month-over-month changes
    const leadsMoM = calculatePercentageChange(newLeadsLast30Days, leadsLastMonth);
    const revenueMoM = calculatePercentageChange(
      Number(revenueThisMonth._sum.value || 0),
      Number(revenueLastMonth._sum.value || 0)
    );

    return {
      leads: {
        total: totalLeads,
        new: newLeadsLast30Days,
        change: leadsMoM,
      },
      pipeline: {
        activeDealCount,
        totalValue: Number(pipelineValue._sum.value || 0),
        avgDealValue: Number(avgDealValue._avg.value || 0),
      },
      revenue: {
        thisMonth: Number(revenueThisMonth._sum.value || 0),
        lastMonth: Number(revenueLastMonth._sum.value || 0),
        change: revenueMoM,
        wonDeals: wonDealsThisMonth,
      },
      conversionRate,
      activitiesLast30Days,
    };
  });
}

/**
 * Calculate conversion rate from leads to converted status
 *
 * @returns Conversion rate as percentage
 */
async function calculateConversionRate(): Promise<number> {
  const [totalLeads, convertedLeads] = await Promise.all([
    prisma.leads.count(),
    prisma.leads.count({ where: { status: 'CONVERTED' } }),
  ]);

  return totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
}

/**
 * Calculate percentage change between two values
 *
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
