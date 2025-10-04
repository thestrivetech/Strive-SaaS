import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { deals, Prisma } from '@prisma/client';
import type { DealFilters } from './schemas';

/**
 * Deals Queries Module
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

type DealWithRelations = Prisma.dealsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    contact: {
      select: { id: true; name: true; email: true; phone: true };
    };
    lead: {
      select: { id: true; name: true; email: true; phone: true; status: true };
    };
    listing: {
      select: { id: true; title: true; address: true; city: true; state: true; property_type: true };
    };
    activities: {
      include: {
        created_by: {
          select: { id: true; name: true; avatar_url: true };
        };
      };
      orderBy: { created_at: 'desc' };
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
 * Get deals with filters and pagination
 */
export async function getDeals(filters?: DealFilters) {
  return withTenantContext(async () => {
    try {
      const {
        search,
        stage,
        status,
        assigned_to_id,
        contact_id,
        lead_id,
        listing_id,
        min_value,
        max_value,
        expected_close_before,
        expected_close_after,
        sort_by = 'created_at',
        sort_order = 'desc',
        limit = 25,
        offset = 0,
      } = filters || {};

      // Build where clause
      const where: Prisma.dealsWhereInput = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (stage) {
        where.stage = stage;
      }

      if (status) {
        where.status = status;
      }

      if (assigned_to_id) {
        where.assigned_to_id = assigned_to_id;
      }

      if (contact_id) {
        where.contact_id = contact_id;
      }

      if (lead_id) {
        where.lead_id = lead_id;
      }

      if (listing_id) {
        where.listing_id = listing_id;
      }

      if (min_value !== undefined || max_value !== undefined) {
        where.value = {};
        if (min_value !== undefined) {
          where.value.gte = min_value;
        }
        if (max_value !== undefined) {
          where.value.lte = max_value;
        }
      }

      if (expected_close_before !== undefined || expected_close_after !== undefined) {
        where.expected_close_date = {};
        if (expected_close_before !== undefined) {
          where.expected_close_date.lte = expected_close_before;
        }
        if (expected_close_after !== undefined) {
          where.expected_close_date.gte = expected_close_after;
        }
      }

      const deals = await prisma.deals.findMany({
        where,
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          [sort_by]: sort_order,
        },
        take: limit,
        skip: offset,
      });

      return deals;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Queries] getDeals failed:', dbError);
      throw new Error('Failed to fetch deals');
    }
  });
}

/**
 * Get a single deal by ID with full relations
 */
export async function getDealById(id: string): Promise<DealWithRelations | null> {
  return withTenantContext(async () => {
    try {
      const deal = await prisma.deals.findUnique({
        where: { id },
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
              email: true,
              phone: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              state: true,
              property_type: true,
            },
          },
          activities: {
            include: {
              created_by: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      return deal;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Queries] getDealById failed:', dbError);
      throw new Error('Failed to fetch deal');
    }
  });
}

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

          const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

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
      console.error('[Deals Queries] getDealsByStage failed:', dbError);
      throw new Error('Failed to fetch pipeline data');
    }
  });
}

/**
 * Get deal metrics for dashboard
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
      console.error('[Deals Queries] getDealMetrics failed:', dbError);
      throw new Error('Failed to fetch deal metrics');
    }
  });
}

/**
 * Get deal count with filters (for pagination)
 */
export async function getDealsCount(filters?: DealFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const {
        search,
        stage,
        status,
        assigned_to_id,
        contact_id,
        lead_id,
        listing_id,
        min_value,
        max_value,
        expected_close_before,
        expected_close_after,
      } = filters || {};

      const where: Prisma.dealsWhereInput = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (stage) {
        where.stage = stage;
      }

      if (status) {
        where.status = status;
      }

      if (assigned_to_id) {
        where.assigned_to_id = assigned_to_id;
      }

      if (contact_id) {
        where.contact_id = contact_id;
      }

      if (lead_id) {
        where.lead_id = lead_id;
      }

      if (listing_id) {
        where.listing_id = listing_id;
      }

      if (min_value !== undefined || max_value !== undefined) {
        where.value = {};
        if (min_value !== undefined) {
          where.value.gte = min_value;
        }
        if (max_value !== undefined) {
          where.value.lte = max_value;
        }
      }

      if (expected_close_before !== undefined || expected_close_after !== undefined) {
        where.expected_close_date = {};
        if (expected_close_before !== undefined) {
          where.expected_close_date.lte = expected_close_before;
        }
        if (expected_close_after !== undefined) {
          where.expected_close_date.gte = expected_close_after;
        }
      }

      const count = await prisma.deals.count({ where });

      return count;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Queries] getDealsCount failed:', dbError);
      throw new Error('Failed to count deals');
    }
  });
}

/**
 * Get deals for a specific contact
 */
export async function getDealsByContact(contactId: string) {
  return withTenantContext(async () => {
    try {
      const deals = await prisma.deals.findMany({
        where: {
          contact_id: contactId,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return deals;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Queries] getDealsByContact failed:', dbError);
      throw new Error('Failed to fetch deals for contact');
    }
  });
}

/**
 * Get deals for a specific lead
 */
export async function getDealsByLead(leadId: string) {
  return withTenantContext(async () => {
    try {
      const deals = await prisma.deals.findMany({
        where: {
          lead_id: leadId,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return deals;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Deals Queries] getDealsByLead failed:', dbError);
      throw new Error('Failed to fetch deals for lead');
    }
  });
}

/**
 * Export types for use in components
 */
export type {
  DealWithAssignee,
  DealWithRelations,
  DealsByStageResult,
};
