import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';

/**
 * Transaction Analytics Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 *
 * @module transaction-analytics/queries
 */

export interface TransactionAnalyticsParams {
  startDate?: Date;
  endDate?: Date;
}

export interface AnalyticsOverview {
  totalLoops: number;
  activeLoops: number;
  closedLoops: number;
  avgClosingDays: number;
  totalValue: number;
}

export interface DocumentStats {
  status: string;
  _count: number;
}

export interface TaskStats {
  status: string;
  _count: number;
}

export interface SignatureStats {
  status: string;
  _count: number;
}

export interface TransactionAnalytics {
  overview: AnalyticsOverview;
  documents: DocumentStats[];
  tasks: TaskStats[];
  signatures: SignatureStats[];
}

export interface LoopVelocityParams {
  months: number;
}

export interface LoopVelocityData {
  month: string;
  count: number;
}

/**
 * Get comprehensive transaction analytics
 *
 * @param params - Date range filters
 * @returns Analytics data with overview and stats
 */
export async function getTransactionAnalytics(
  params: TransactionAnalyticsParams = {}
): Promise<TransactionAnalytics> {
  return withTenantContext(async () => {
    try {
      const where: any = {};

      if (params.startDate && params.endDate) {
        where.created_at = {
          gte: params.startDate,
          lte: params.endDate,
        };
      }

      // Run all queries in parallel for performance
      const [
        totalLoops,
        activeLoops,
        closedLoops,
        closedLoopsWithDates,
        totalValue,
        documentStats,
        taskStats,
        signatureStats,
      ] = await Promise.all([
        // Total loops count
        prisma.transaction_loops.count({ where }),

        // Active loops count
        prisma.transaction_loops.count({
          where: {
            ...where,
            status: { in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'] },
          },
        }),

        // Closed loops count
        prisma.transaction_loops.count({
          where: { ...where, status: 'CLOSED' },
        }),

        // Get closed loops with dates for avg calculation
        prisma.transaction_loops.findMany({
          where: {
            ...where,
            status: 'CLOSED',
            actual_closing: { not: null },
          },
          select: {
            created_at: true,
            actual_closing: true,
          },
        }),

        // Total value aggregate
        prisma.transaction_loops.aggregate({
          where,
          _sum: { listing_price: true },
        }),

        // Document statistics by status
        prisma.$queryRaw<DocumentStats[]>`
          SELECT d.status, COUNT(*)::int as "_count"
          FROM documents d
          INNER JOIN transaction_loops tl ON d.loop_id = tl.id
          WHERE tl.organization_id = current_setting('app.current_org_id', true)::uuid
          ${params.startDate && params.endDate ? `AND tl.created_at >= ${params.startDate} AND tl.created_at <= ${params.endDate}` : ''}
          GROUP BY d.status
        `,

        // Task statistics by status
        prisma.$queryRaw<TaskStats[]>`
          SELECT tt.status, COUNT(*)::int as "_count"
          FROM transaction_tasks tt
          INNER JOIN transaction_loops tl ON tt.loop_id = tl.id
          WHERE tl.organization_id = current_setting('app.current_org_id', true)::uuid
          ${params.startDate && params.endDate ? `AND tl.created_at >= ${params.startDate} AND tl.created_at <= ${params.endDate}` : ''}
          GROUP BY tt.status
        `,

        // Signature statistics by status
        prisma.$queryRaw<SignatureStats[]>`
          SELECT sr.status, COUNT(*)::int as "_count"
          FROM signature_requests sr
          INNER JOIN transaction_loops tl ON sr.loop_id = tl.id
          WHERE tl.organization_id = current_setting('app.current_org_id', true)::uuid
          ${params.startDate && params.endDate ? `AND tl.created_at >= ${params.startDate} AND tl.created_at <= ${params.endDate}` : ''}
          GROUP BY sr.status
        `,
      ]);

      // Calculate average closing time in days
      let avgClosingDays = 0;
      if (closedLoopsWithDates.length > 0) {
        const totalDays = closedLoopsWithDates.reduce((sum: number, loop: { created_at: Date; actual_closing: Date | null }) => {
          if (loop.actual_closing) {
            const diff = loop.actual_closing.getTime() - loop.created_at.getTime();
            return sum + diff / (1000 * 60 * 60 * 24); // Convert ms to days
          }
          return sum;
        }, 0);
        avgClosingDays = Math.round(totalDays / closedLoopsWithDates.length);
      }

      return {
        overview: {
          totalLoops,
          activeLoops,
          closedLoops,
          avgClosingDays,
          totalValue: totalValue._sum.listing_price?.toNumber() || 0,
        },
        documents: documentStats,
        tasks: taskStats,
        signatures: signatureStats,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get loop velocity (loops created per month)
 *
 * @param params - Number of months to analyze
 * @returns Monthly loop creation counts
 */
export async function getLoopVelocity(
  params: LoopVelocityParams
): Promise<LoopVelocityData[]> {
  return withTenantContext(async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - params.months);

      const loops = await prisma.transaction_loops.findMany({
        where: {
          created_at: { gte: startDate },
        },
        select: {
          created_at: true,
          status: true,
        },
      });

      // Group by month (YYYY-MM format)
      const byMonth = loops.reduce((acc: Record<string, number>, loop: { created_at: Date; status: string }) => {
        const month = loop.created_at.toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month]++;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort by month
      return Object.entries(byMonth)
        .map(([month, count]) => ({
          month,
          count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get transaction analytics by type
 *
 * @returns Loop counts grouped by transaction type
 */
export async function getAnalyticsByType(): Promise<{ type: string; count: number }[]> {
  return withTenantContext(async () => {
    try {
      const result = await prisma.transaction_loops.groupBy({
        by: ['transaction_type'],
        _count: true,
      });

      return result.map((item: { transaction_type: string; _count: number }) => ({
        type: item.transaction_type,
        count: item._count,
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get transaction analytics by status
 *
 * @returns Loop counts grouped by status
 */
export async function getAnalyticsByStatus(): Promise<{ status: string; count: number }[]> {
  return withTenantContext(async () => {
    try {
      const result = await prisma.transaction_loops.groupBy({
        by: ['status'],
        _count: true,
      });

      return result.map((item: { status: string; _count: number }) => ({
        status: item.status,
        count: item._count,
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}
