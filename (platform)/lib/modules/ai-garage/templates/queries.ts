import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext, getCurrentTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { agent_templates, Prisma } from '@prisma/client';
import type { TemplateFilters } from './schemas';

/**
 * Agent Template Queries Module
 *
 * SECURITY: Templates follow marketplace visibility rules:
 * - System templates (is_system=true): Visible to all organizations
 * - Public templates (is_public=true): Visible to all organizations
 * - Private templates (is_public=false): Only visible to creator's organization
 *
 * All queries automatically filtered by organizationId via tenant middleware
 */

type TemplateWithDetails = Prisma.agent_templatesGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    reviews: {
      select: { rating: true };
    };
  };
}>;

type TemplateWithReviews = Prisma.agent_templatesGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    reviews: {
      include: {
        reviewer: {
          select: { id: true; name: true; email: true; avatar_url: true };
        };
      };
      orderBy: { created_at: 'desc' };
    };
  };
}>;

/**
 * Get templates with marketplace visibility rules
 *
 * Returns:
 * - All system templates (is_system=true)
 * - All public templates (is_public=true)
 * - Private templates from current organization
 */
export async function getTemplates(
  filters?: TemplateFilters
): Promise<TemplateWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      const where: Prisma.agent_templatesWhereInput = {};

      // Marketplace visibility: system OR public OR current org's private templates
      // Note: withTenantContext provides organizationId automatically
      where.OR = [
        { is_system: true },
        { is_public: true },
        // Current org's templates (both public and private)
        ...(context.organizationId ? [{ organization_id: context.organizationId }] : []),
      ];

      // Category filter
      if (filters?.category) {
        where.category = filters.category;
      }

      // Visibility filters (override marketplace logic if specified)
      if (filters?.is_public !== undefined) {
        where.is_public = filters.is_public;
      }

      if (filters?.is_system !== undefined) {
        where.is_system = filters.is_system;
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

      // Rating filter (minimum rating)
      if (filters?.min_rating) {
        where.rating = {
          gte: filters.min_rating,
        };
      }

      // Usage count filter
      if (filters?.min_usage_count) {
        where.usage_count = {
          gte: filters.min_usage_count,
        };
      }

      // Sorting
      const orderBy: Prisma.agent_templatesOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        // Default: sort by popularity (usage_count)
        orderBy.usage_count = 'desc';
      }

      return await prisma.agent_templates.findMany({
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
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getTemplates failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get template count with filters
 */
export async function getTemplatesCount(filters?: TemplateFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      const where: Prisma.agent_templatesWhereInput = {};

      // Marketplace visibility
      where.OR = [
        { is_system: true },
        { is_public: true },
        ...(context.organizationId ? [{ organization_id: context.organizationId }] : []),
      ];

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.is_public !== undefined) {
        where.is_public = filters.is_public;
      }

      if (filters?.is_system !== undefined) {
        where.is_system = filters.is_system;
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

      if (filters?.min_rating) {
        where.rating = {
          gte: filters.min_rating,
        };
      }

      return await prisma.agent_templates.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getTemplatesCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get template by ID with full details including reviews
 *
 * Enforces marketplace visibility rules
 */
export async function getTemplateById(
  templateId: string
): Promise<TemplateWithReviews | null> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();
      return await prisma.agent_templates.findFirst({
        where: {
          id: templateId,
          OR: [
            { is_system: true },
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
          reviews: {
            include: {
              reviewer: {
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
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getTemplateById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(
  category: string
): Promise<TemplateWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getTemplates({
        category: category as any,
        limit: 50,
        offset: 0,
        sort_by: 'usage_count',
        sort_order: 'desc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getTemplatesByCategory failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get popular templates (high usage + good ratings)
 */
export async function getPopularTemplates(
  limit: number = 10
): Promise<TemplateWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getTemplates({
        min_rating: 4.0,
        min_usage_count: 10,
        limit,
        offset: 0,
        sort_by: 'usage_count',
        sort_order: 'desc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getPopularTemplates failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get system templates (built-in templates)
 */
export async function getSystemTemplates(): Promise<TemplateWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getTemplates({
        is_system: true,
        limit: 100,
        offset: 0,
        sort_by: 'name',
        sort_order: 'asc',
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getSystemTemplates failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get organization's private templates
 */
export async function getOrganizationTemplates(): Promise<TemplateWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const context = getCurrentTenantContext();

      if (!context.organizationId) {
        throw new Error('Organization context required');
      }

      return await prisma.agent_templates.findMany({
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
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getOrganizationTemplates failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get template statistics
 */
export async function getTemplateStats(templateId: string) {
  return withTenantContext(async () => {
    try {
      const template = await prisma.agent_templates.findUnique({
        where: { id: templateId },
        include: {
          reviews: {
            select: {
              rating: true,
              reviewer_id: true,
            },
          },
        },
      });

      if (!template) {
        return null;
      }

      const totalReviews = template.reviews.length;
      const avgRating = totalReviews > 0
        ? template.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : null;
      const uniqueUsers = new Set(template.reviews.map(r => r.reviewer_id)).size;

      return {
        template_id: templateId,
        total_usage: template.usage_count,
        avg_rating: avgRating,
        total_reviews: totalReviews,
        unique_users: uniqueUsers,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Queries] getTemplateStats failed:', dbError);
      throw error;
    }
  });
}
