import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { leads, Prisma } from '@prisma/client';
import type { LeadFilters } from './schemas';

/**
 * Leads Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

type LeadWithAssignee = Prisma.leadsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;

type LeadWithDetails = Prisma.leadsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    activities: {
      include: {
        created_by: {
          select: { id: true; name: true; avatar_url: true };
        };
      };
      orderBy: { created_at: 'desc' };
    };
    deals: {
      include: {
        assigned_to: {
          select: { id: true; name: true };
        };
      };
    };
  };
}>;

/**
 * Get leads with filters
 *
 * Automatically filtered by current user's organization
 *
 * @param filters - Optional filters
 * @returns List of leads
 *
 * @example
 * ```typescript
 * const leads = await getLeads({ status: 'NEW_LEAD', limit: 50 });
 * ```
 */
export async function getLeads(
  filters?: LeadFilters
): Promise<LeadWithAssignee[]> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.leadsWhereInput = {};

      // Status filter (single or array)
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      // Source filter (single or array)
      if (filters?.source) {
        where.source = Array.isArray(filters.source)
          ? { in: filters.source }
          : filters.source;
      }

      // Score filter (single or array)
      if (filters?.score) {
        where.score = Array.isArray(filters.score)
          ? { in: filters.score }
          : filters.score;
      }

      // Assignment filter
      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }

      // Search across name, email, company, phone
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Tags filter (has any of the provided tags)
      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      // Date range filters
      if (filters?.created_from || filters?.created_to) {
        where.created_at = {};
        if (filters.created_from) {
          where.created_at.gte = filters.created_from;
        }
        if (filters.created_to) {
          where.created_at.lte = filters.created_to;
        }
      }

      if (filters?.last_contact_from || filters?.last_contact_to) {
        where.last_contact_at = {};
        if (filters.last_contact_from) {
          where.last_contact_at.gte = filters.last_contact_from;
        }
        if (filters.last_contact_to) {
          where.last_contact_at.lte = filters.last_contact_to;
        }
      }

      // Sorting
      const orderBy: Prisma.leadsOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        orderBy.created_at = 'desc'; // Default sort
      }

      return await prisma.leads.findMany({
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
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeads failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead count with filters
 *
 * @param filters - Optional filters
 * @returns Count of leads
 */
export async function getLeadsCount(filters?: LeadFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.leadsWhereInput = {};

      // Apply same filters as getLeads (simplified)
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters?.source) {
        where.source = Array.isArray(filters.source)
          ? { in: filters.source }
          : filters.source;
      }

      if (filters?.score) {
        where.score = Array.isArray(filters.score)
          ? { in: filters.score }
          : filters.score;
      }

      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      return await prisma.leads.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadsCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead by ID with full details
 *
 * @param leadId - Lead ID
 * @returns Lead with details or null
 */
export async function getLeadById(
  leadId: string
): Promise<LeadWithDetails | null> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findFirst({
        where: { id: leadId },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
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
            orderBy: { created_at: 'desc' },
            take: 50, // Limit activities
          },
          deals: {
            include: {
              assigned_to: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead statistics
 *
 * @returns Lead stats by status and score
 */
export async function getLeadStats() {
  return withTenantContext(async () => {
    try {
      const [
        totalLeads,
        newLeads,
        qualifiedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
      ] = await Promise.all([
        prisma.leads.count(),
        prisma.leads.count({ where: { status: 'NEW_LEAD' } }),
        prisma.leads.count({ where: { status: 'QUALIFIED' } }),
        prisma.leads.count({ where: { score: 'HOT' } }),
        prisma.leads.count({ where: { score: 'WARM' } }),
        prisma.leads.count({ where: { score: 'COLD' } }),
      ]);

      return {
        totalLeads,
        newLeads,
        qualifiedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Search leads by name, email, company
 *
 * @param query - Search query
 * @param limit - Max results
 * @returns Matching leads
 */
export async function searchLeads(
  query: string,
  limit = 10
): Promise<leads[]> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] searchLeads failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get leads assigned to a user
 *
 * @param userId - User ID
 * @returns Leads assigned to user
 */
export async function getLeadsByAssignee(
  userId: string
): Promise<LeadWithAssignee[]> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findMany({
        where: { assigned_to_id: userId },
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
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadsByAssignee failed:', dbError);
      throw error;
    }
  });
}
