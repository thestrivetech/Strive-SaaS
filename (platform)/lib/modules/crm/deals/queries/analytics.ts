import 'server-only';

import { prisma } from '@/lib/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';

/**
 * Deal Analytics Queries
 *
 * Analytics and metrics for deal performance, forecasting, and insights.
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

/**
 * Get deal metrics for dashboard
 *
 * Calculates aggregate metrics across ALL deals for accuracy.
 * Aggregate metrics (sums, counts, averages) are not paginated by design.
 *
 * @returns Deal performance metrics including pipeline value, win rate, and deal counts
 * @throws {Error} If database query fails
 *
 * @security
 * - Automatically filtered by organizationId via tenant middleware
 * - No additional permissions required (read-only metrics)
 *
 * @example
 * ```typescript
 * const metrics = await getDealMetrics();
 * console.log(metrics.pipelineValue); // Total active pipeline value
 * console.log(metrics.winRate); // Win rate percentage
 * ```
 */
export async function getDealMetrics() {
  return withTenantContext(async () => {
    try {
      const [totalValue, wonValue, lostValue, activeDeals, wonDeals, lostDeals, totalDeals] = await Promise.all([
        prisma.deals.aggregate({
          where: { status: 'ACTIVE' },
          _sum: { value: true },
        }),
        prisma.deals.aggregate({
          where: { status: 'WON' },
          _sum: { value: true },
        }),
        prisma.deals.aggregate({
          where: { status: 'LOST' },
          _sum: { value: true },
        }),
        prisma.deals.count({ where: { status: 'ACTIVE' } }),
        prisma.deals.count({ where: { status: 'WON' } }),
        prisma.deals.count({ where: { status: 'LOST' } }),
        prisma.deals.count(),
      ]);

      const closedDeals = wonDeals + lostDeals;
      const winRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;
      const averageDealValue = activeDeals > 0 ? Number(totalValue._sum.value || 0) / activeDeals : 0;

      return {
        pipelineValue: Number(totalValue._sum.value || 0),
        wonValue: Number(wonValue._sum.value || 0),
        lostValue: Number(lostValue._sum.value || 0),
        activeDeals,
        wonDeals,
        lostDeals,
        totalDeals,
        winRate,
        averageDealValue,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Deals:Analytics] getDealMetrics failed:', dbError);
      throw new Error(
        `[CRM:Deals:Analytics] Failed to fetch deal metrics: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}
