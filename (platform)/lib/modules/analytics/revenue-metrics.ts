import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * Revenue Analytics Module
 *
 * Provides revenue tracking and trends:
 * - Monthly revenue history
 * - Revenue by source
 * - Revenue growth rates
 *
 * All queries automatically filtered by organization via withTenantContext
 */

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  dealsWon: number;
  avgDealSize: number;
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  count: number;
}

/**
 * Get monthly revenue for the last N months
 *
 * @param months - Number of months to fetch (default: 12)
 * @returns Array of monthly revenue data
 */
export async function getMonthlyRevenue(months = 12): Promise<MonthlyRevenue[]> {
  return withTenantContext(async () => {
    const now = new Date();
    const monthlyData: MonthlyRevenue[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const [revenueData, dealsCount] = await Promise.all([
        prisma.deals.aggregate({
          where: {
            status: 'WON',
            actual_close_date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { value: true },
          _avg: { value: true },
        }),
        prisma.deals.count({
          where: {
            status: 'WON',
            actual_close_date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        revenue: Number(revenueData._sum.value || 0),
        dealsWon: dealsCount,
        avgDealSize: Number(revenueData._avg.value || 0),
      });
    }

    return monthlyData;
  });
}

/**
 * Get revenue grouped by lead source
 *
 * Shows which sources generate the most revenue
 *
 * @returns Array of revenue by source
 */
export async function getRevenueBySource(): Promise<RevenueBySource[]> {
  return withTenantContext(async () => {
    // Get all won deals with their associated lead source
    const wonDeals = await prisma.deals.findMany({
      where: { status: 'WON' },
      include: {
        lead: {
          select: { source: true },
        },
      },
    });

    // Group by source
    const sourceMap = new Map<string, { revenue: number; count: number }>();

    wonDeals.forEach((deal: any) => {
      const source = deal.lead?.source || 'DIRECT';
      const current = sourceMap.get(source) || { revenue: 0, count: 0 };

      sourceMap.set(source, {
        revenue: current.revenue + Number(deal.value),
        count: current.count + 1,
      });
    });

    return Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      revenue: data.revenue,
      count: data.count,
    }));
  });
}

/**
 * Calculate revenue growth rate
 *
 * Compares current month to previous month
 *
 * @returns Growth rate as percentage
 */
export async function getRevenueGrowthRate(): Promise<number> {
  return withTenantContext(async () => {
    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));

    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: thisMonth,
            lte: endOfMonth(now),
          },
        },
        _sum: { value: true },
      }),
      prisma.deals.aggregate({
        where: {
          status: 'WON',
          actual_close_date: {
            gte: lastMonth,
            lte: endOfMonth(lastMonth),
          },
        },
        _sum: { value: true },
      }),
    ]);

    const current = Number(thisMonthRevenue._sum.value || 0);
    const previous = Number(lastMonthRevenue._sum.value || 0);

    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  });
}

/**
 * Get quarterly revenue comparison
 *
 * Compares last 4 quarters
 *
 * @returns Array of quarterly revenue
 */
export async function getQuarterlyRevenue(): Promise<
  Array<{ quarter: string; revenue: number; dealsWon: number }>
> {
  return withTenantContext(async () => {
    const now = new Date();
    const quarters = [];

    for (let i = 3; i >= 0; i--) {
      const quarterStart = startOfMonth(subMonths(now, i * 3 + 2));
      const quarterEnd = endOfMonth(subMonths(now, i * 3));

      const [revenueData, dealsCount] = await Promise.all([
        prisma.deals.aggregate({
          where: {
            status: 'WON',
            actual_close_date: {
              gte: quarterStart,
              lte: quarterEnd,
            },
          },
          _sum: { value: true },
        }),
        prisma.deals.count({
          where: {
            status: 'WON',
            actual_close_date: {
              gte: quarterStart,
              lte: quarterEnd,
            },
          },
        }),
      ]);

      const year = quarterStart.getFullYear();
      const quarter = Math.ceil((quarterStart.getMonth() + 1) / 3);

      quarters.push({
        quarter: `Q${quarter} ${year}`,
        revenue: Number(revenueData._sum.value || 0),
        dealsWon: dealsCount,
      });
    }

    return quarters;
  });
}
