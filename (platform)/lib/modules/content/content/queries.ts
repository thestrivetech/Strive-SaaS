'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { ContentFilters } from './schemas';
import { cache } from 'react';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Content Module - Data Queries
 *
 * All queries enforce multi-tenancy via RLS context and organizationId filtering.
 * Uses React cache() for request-level memoization.
 */

/**
 * Set RLS context for PostgreSQL queries
 * CRITICAL: Must be called before any database queries to enforce multi-tenancy
 */
async function withContentContext<T>(callback: () => Promise<T>): Promise<T> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Set RLS context variables for PostgreSQL
  await prisma.$executeRaw`
    SET app.current_user_id = ${user.id};
    SET app.current_org_id = ${organizationId};
  `;

  return await callback();
}

/**
 * Get content items with optional filters
 *
 * @param filters - Optional filters (status, type, category, search, etc.)
 * @returns Promise<ContentItem[]> - Array of content items with relations
 */
export const getContentItems = cache(async (filters?: ContentFilters) => {
  return withContentContext(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const organization_id = getUserOrganizationId(user);
    const where: any = {
      organization_id, // Multi-tenant isolation
    };

    // Apply filters
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.category_id) where.category_id = filters.category_id;
    if (filters?.author_id) where.author_id = filters.author_id;

    // Search across title, content, excerpt
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Tag filtering
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          slug: { in: filters.tags },
        },
      };
    }

    return await prisma.content_items.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            revisions: true,
          },
        },
      },
      orderBy: [{ updated_at: 'desc' }],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
});

/**
 * Get single content item by ID
 *
 * @param id - Content item ID
 * @returns Promise<ContentItem | null> - Content item with full relations
 */
export const getContentItemById = cache(async (id: string) => {
  return withContentContext(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const organization_id = getUserOrganizationId(user);

    return await prisma.content_items.findFirst({
      where: {
        id,
        organization_id, // Ensure org isolation
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        category: true,
        tags: true,
        revisions: {
          orderBy: { created_at: 'desc' },
          take: 10, // Latest 10 revisions
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
        comments: {
          where: { status: 'APPROVED' }, // Only approved comments
          include: {
            author: {
              select: { id: true, name: true, avatar_url: true },
            },
          },
        },
      },
    });
  });
});

/**
 * Get content by slug (for public viewing)
 * NOTE: This is for published content only, no auth required
 *
 * @param slug - Content slug
 * @param orgId - Organization ID
 * @returns Promise<ContentItem | null> - Published content item
 */
export const getContentBySlug = cache(async (slug: string, org_id: string) => {
  return await prisma.content_items.findFirst({
    where: {
      slug,
      organization_id: org_id,
      status: 'PUBLISHED', // Only published content
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
      category: true,
      tags: true,
    },
  });
});

/**
 * Get content statistics for dashboard
 *
 * @returns Promise<object> - Content stats (total, published, draft, scheduled)
 */
export const getContentStats = cache(async () => {
  return withContentContext(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const organization_id = getUserOrganizationId(user);

    const [total, published, draft, scheduled] = await Promise.all([
      prisma.content_items.count({
        where: { organization_id },
      }),
      prisma.content_items.count({
        where: {
          organization_id,
          status: 'PUBLISHED',
        },
      }),
      prisma.content_items.count({
        where: {
          organization_id,
          status: 'DRAFT',
        },
      }),
      prisma.content_items.count({
        where: {
          organization_id,
          status: 'SCHEDULED',
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      scheduled,
    };
  });
});

/**
 * Get content count with filters
 *
 * @param filters - Optional filters
 * @returns Promise<number> - Count of matching content items
 */
export const getContentCount = cache(async (filters?: ContentFilters) => {
  return withContentContext(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const organization_id = getUserOrganizationId(user);
    const where: any = {
      organization_id,
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.category_id) where.category_id = filters.category_id;

    return await prisma.content_items.count({ where });
  });
});
