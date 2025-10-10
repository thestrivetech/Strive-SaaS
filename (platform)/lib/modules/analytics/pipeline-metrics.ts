import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import type { DealStage } from '@prisma/client';

/**
 * Pipeline Analytics Module
 *
 * Provides pipeline and sales funnel metrics:
 * - Sales funnel by stage
 * - Pipeline value by stage
 * - Stage conversion rates
 *
 * All queries automatically filtered by organization via withTenantContext
 */

export interface SalesFunnelStage {
  stage: string;
  count: number;
  value: number;
}

export interface PipelineByStage {
  stage: string;
  count: number;
  value: number;
}

/**
 * Get sales funnel data showing deals at each stage
 *
 * Shows the complete funnel from LEAD to CLOSED_WON
 * Includes both count and total value for each stage
 *
 * @returns Array of funnel stages with metrics
 */
export async function getSalesFunnelData(): Promise<SalesFunnelStage[]> {
  return withTenantContext(async () => {
    const stages: DealStage[] = [
      'LEAD',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSING',
      'CLOSED_WON',
    ];

    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const count = await prisma.deals.count({
          where: { stage },
        });

        const value = await prisma.deals.aggregate({
          where: { stage },
          _sum: { value: true },
        });

        return {
          stage,
          count,
          value: Number(value._sum.value || 0),
        };
      })
    );

    return funnelData;
  });
}

/**
 * Get pipeline value grouped by stage (active deals only)
 *
 * Shows current active pipeline distribution across stages
 *
 * @returns Array of stages with counts and values
 */
export async function getPipelineByStage(): Promise<PipelineByStage[]> {
  return withTenantContext(async () => {
    const dealsByStage = await prisma.deals.groupBy({
      by: ['stage'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      _sum: { value: true },
    });

    return dealsByStage.map((group: any) => ({
      stage: group.stage,
      count: group._count.id,
      value: Number(group._sum.value || 0),
    }));
  });
}

/**
 * Calculate conversion rates between stages
 *
 * Shows what percentage of deals move from one stage to the next
 *
 * @returns Array of stage conversion rates
 */
export async function getStageConversionRates(): Promise<
  Array<{ fromStage: string; toStage: string; rate: number }>
> {
  return withTenantContext(async () => {
    const stages: DealStage[] = [
      'LEAD',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSING',
      'CLOSED_WON',
    ];

    const conversions = [];

    for (let i = 0; i < stages.length - 1; i++) {
      const fromStage = stages[i];
      const toStage = stages[i + 1];

      const fromCount = await prisma.deals.count({
        where: { stage: fromStage },
      });

      const toCount = await prisma.deals.count({
        where: { stage: toStage },
      });

      const rate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;

      conversions.push({
        fromStage,
        toStage,
        rate,
      });
    }

    return conversions;
  });
}

/**
 * Get average time in each stage (in days)
 *
 * Calculates how long deals typically stay in each stage
 *
 * @returns Array of stages with average days
 */
export async function getAverageTimeInStage(): Promise<
  Array<{ stage: string; avgDays: number }>
> {
  return withTenantContext(async () => {
    const stages: DealStage[] = [
      'LEAD',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSING',
      'CLOSED_WON',
    ];

    const stageMetrics = await Promise.all(
      stages.map(async (stage) => {
        // Get deals that have moved past this stage
        const deals = await prisma.deals.findMany({
          where: { stage },
          select: {
            created_at: true,
            updated_at: true,
          },
        });

        if (deals.length === 0) {
          return { stage, avgDays: 0 };
        }

        const totalDays = deals.reduce((sum: number, deal: any) => {
          const diffMs = deal.updated_at.getTime() - deal.created_at.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0);

        return {
          stage,
          avgDays: totalDays / deals.length,
        };
      })
    );

    return stageMetrics;
  });
}
