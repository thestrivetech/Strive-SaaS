import 'server-only';

import { prisma } from '@/lib/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';

/**
 * Activities Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 *
 * @module activities/queries
 */

type ActivityWithRelations = Prisma.activitiesGetPayload<{
  include: {
    created_by: {
      select: { id: true; name: true; avatar_url: true };
    };
    lead: {
      select: { id: true; name: true };
    };
    contact: {
      select: { id: true; name: true };
    };
    deal: {
      select: { id: true; title: true };
    };
    listing: {
      select: { id: true; address: true };
    };
  };
}>;

export interface GetRecentActivitiesOptions {
  limit?: number;
  userId?: string;
}

/**
 * Get recent activities
 *
 * @param options - Filter options
 * @returns Recent activities with related entities
 */
export async function getRecentActivities(
  options: GetRecentActivitiesOptions = {}
): Promise<ActivityWithRelations[]> {
  return withTenantContext(async () => {
    try {
      const { limit = 10, userId } = options;

      const where: Prisma.activitiesWhereInput = {};

      if (userId) {
        where.created_by_id = userId;
      }

      return await prisma.activities.findMany({
        where,
        include: {
          created_by: {
            select: { id: true, name: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          listing: {
            select: { id: true, address: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get activities by entity
 *
 * @param entityType - Type of entity (lead, contact, deal, listing)
 * @param entityId - ID of the entity
 * @returns Activities for the specified entity
 */
export async function getActivitiesByEntity(
  entityType: 'lead' | 'contact' | 'deal' | 'listing',
  entityId: string
): Promise<ActivityWithRelations[]> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.activitiesWhereInput = {
        [`${entityType}_id`]: entityId,
      };

      return await prisma.activities.findMany({
        where,
        include: {
          created_by: {
            select: { id: true, name: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          listing: {
            select: { id: true, address: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}
