import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';

/**
 * Deal Pipeline Queries
 *
 * Pipeline-specific queries for Kanban board views, stage management,
 * and pipeline visualization.
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

type DealWithAssignee = Prisma.dealsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;

type DealsByStageResult = {
  stage: string;
  deals: DealWithAssignee[];
  totalValue: number;
  count: number;
}[];

/**
 * Get deals grouped by pipeline stage
 * Used for Kanban board view
 */
export async function getDealsByStage(): Promise<DealsByStageResult> {
  return withTenantContext(async () => {
    try {
      const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSING'];

      const dealsByStage = await Promise.all(
        stages.map(async (stage) => {
          const deals = await prisma.deals.findMany({
            where: {
              stage: stage as any,
              status: 'ACTIVE', // Only show active deals in pipeline
            },
            include: {
              assigned_to: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar_url: true,
                },
              },
              contact: {
                select: {
                  id: true,
                  name: true,
                },
              },
              lead: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          });

          const totalValue = deals.reduce((sum: number, deal: { value: number }) => sum + Number(deal.value), 0);

          return {
            stage,
            deals,
            totalValue,
            count: deals.length,
          };
        })
      );

      return dealsByStage;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Pipeline] getDealsByStage failed:', dbError);
      throw new Error('Failed to fetch pipeline data');
    }
  });
}

/**
 * Export types for use in components
 */
export type {
  DealsByStageResult,
};
