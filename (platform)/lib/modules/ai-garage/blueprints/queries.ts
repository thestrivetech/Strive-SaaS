import 'server-only';

import { prisma } from '@/lib/prisma';
import { withTenantContext, getCurrentTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { tool_blueprints, Prisma } from '@prisma/client';
import type { BlueprintFilters } from './schemas';

/**
 * Tool Blueprint Queries Module
 *
 * SECURITY: Blueprints follow marketplace visibility rules:
 * - Public blueprints (is_public=true): Visible to all organizations
 * - Private blueprints (is_public=false): Only visible to creator's organization
 *
 * All queries automatically filtered by organizationId via tenant middleware
 */

type BlueprintWithDetails = Prisma.tool_blueprintsGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;

/**
 * Get blueprints with marketplace visibility rules
 *
 * Returns:
 * - All public blueprints (is_public=true)
 * - Private blueprints from current organization
 */
export async function getBlueprints(
  filters?: BlueprintFilters
): Promise<BlueprintWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      const where: Prisma.tool_blueprintsWhereInput = {};

      // Marketplace visibility: public OR current org's private blueprints
      where.OR = [
        { is_public: true },
        // Current org's blueprints (both public and private)
        ...(context.organizationId ? [{ organization_id: context.organizationId }] : []),
      ];

      // Category filter
      if (filters?.category) {
        where.category = filters.category;
      }

      // Visibility filter (override marketplace logic if specified)
      if (filters?.is_public !== undefined) {
        where.is_public = filters.is_public;
      }

      // Complexity filter
      if (filters?.complexity) {
        where.complexity = filters.complexity;
      }

      // Search across name, description
      if (filters?.search) {
        where.AND = [
          {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      // Tags filter (check if any tag matches)
      if (filters?.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags,
        };
      }

      // Usage count filter
      if (filters?.min_usage_count) {
        where.usage_count = {
          gte: filters.min_usage_count,
        };
      }

      // Sorting
      const orderBy: Prisma.tool_blueprintsOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        // Default: sort by popularity (usage_count)
        orderBy.usage_count = 'desc';
      }

      return await prisma.tool_blueprints.findMany({
        where,
        include: {
          creator: {
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
      console.error('[Blueprints Queries] getBlueprints failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get blueprint count with filters
 */
export async function getBlueprintsCount(filters?: BlueprintFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      const where: Prisma.tool_blueprintsWhereInput = {};

      // Marketplace visibility
      where.OR = [
        { is_public: true },
        ...(context.organizationId ? [{ organization_id: context.organizationId }] : []),
      ];

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.is_public !== undefined) {
        where.is_public = filters.is_public;
      }

      if (filters?.complexity) {
        where.complexity = filters.complexity;
      }

      if (filters?.search) {
        where.AND = [
          {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags,
        };
      }

      return await prisma.tool_blueprints.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getBlueprintsCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get blueprint by ID with full details
 *
 * Enforces marketplace visibility rules
 */
export async function getBlueprintById(
  blueprintId: string
): Promise<BlueprintWithDetails | null> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      return await prisma.tool_blueprints.findFirst({
        where: {
          id: blueprintId,
          OR: [
            { is_public: true },
            ...(context.organizationId ? [{ organization_id: context.organizationId }] : []),
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getBlueprintById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get blueprints by category
 */
export async function getBlueprintsByCategory(
  category: string
): Promise<BlueprintWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getBlueprints({
        category: category as any,
        limit: 50,
        offset: 0,
        sort_by: 'usage_count',
        sort_order: 'desc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getBlueprintsByCategory failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get popular blueprints (high usage)
 */
export async function getPopularBlueprints(
  limit: number = 10
): Promise<BlueprintWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getBlueprints({
        min_usage_count: 10,
        limit,
        offset: 0,
        sort_by: 'usage_count',
        sort_order: 'desc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getPopularBlueprints failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get organization's private blueprints
 */
export async function getOrganizationBlueprints(): Promise<BlueprintWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();

      if (!context.organizationId) {
        throw new Error('Organization context required');
      }

      return await prisma.tool_blueprints.findMany({
        where: {
          organization_id: context.organizationId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getOrganizationBlueprints failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get blueprint statistics
 */
export async function getBlueprintStats(blueprintId: string) {
  return withTenantContext(async () => {
    try {
      const blueprint = await prisma.tool_blueprints.findUnique({
        where: { id: blueprintId },
      });

      if (!blueprint) {
        return null;
      }

      // Count clones (blueprints with same component structure)
      // This is a simplified version - could be enhanced with actual clone tracking
      const totalClones = 0; // TODO: Implement clone tracking

      return {
        blueprint_id: blueprintId,
        total_usage: blueprint.usage_count,
        total_clones: totalClones,
        unique_users: blueprint.usage_count, // Simplified - could track unique users
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getBlueprintStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get blueprints by complexity level
 */
export async function getBlueprintsByComplexity(
  complexity: string
): Promise<BlueprintWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getBlueprints({
        complexity: complexity as any,
        limit: 50,
        offset: 0,
        sort_by: 'usage_count',
        sort_order: 'desc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Queries] getBlueprintsByComplexity failed:', dbError);
      throw error;
    }
  });
}
