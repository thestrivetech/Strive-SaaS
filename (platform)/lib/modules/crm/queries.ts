import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Customer, Prisma } from '@prisma/client';
import type { CustomerFilters } from './schemas';

/**
 * CRM Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

type CustomerWithAssignee = Prisma.CustomerGetPayload<{
  include: { assignedTo: { select: { id: true; name: true; email: true; avatarUrl: true } } };
}>;

/**
 * Get customers with filters
 *
 * Automatically filtered by current user's organization
 *
 * @param filters - Optional filters
 * @returns List of customers
 *
 * @example
 * ```typescript
 * const customers = await getCustomers({ status: 'ACTIVE', limit: 50 });
 * ```
 */
export async function getCustomers(
  filters?: CustomerFilters
): Promise<CustomerWithAssignee[]> {
  return withTenantContext(async () => {
    try {
      const where: Record<string, unknown> = {};

  if (filters?.status) {
    // Support array of statuses (OR logic)
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
  }

  if (filters?.source) {
    // Support array of sources (OR logic)
    where.source = Array.isArray(filters.source) ? { in: filters.source } : filters.source;
  }

  if (filters?.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  // Date range filters
  if (filters?.createdFrom || filters?.createdTo) {
    where.createdAt = {};
    if (filters.createdFrom) {
      where.createdAt.gte = filters.createdFrom;
    }
    if (filters.createdTo) {
      where.createdAt.lte = filters.createdTo;
    }
  }

      return await prisma.customers.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM Queries] getCustomers failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get count of customers with filters
 *
 * Automatically filtered by current user's organization
 *
 * @param filters - Optional filters
 * @returns Count of customers
 */
export async function getCustomersCount(
  filters?: CustomerFilters
): Promise<number> {
  return withTenantContext(async () => {
    try {
      const where: Record<string, unknown> = {};

  if (filters?.status) {
    // Support array of statuses (OR logic)
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
  }

  if (filters?.source) {
    // Support array of sources (OR logic)
    where.source = Array.isArray(filters.source) ? { in: filters.source } : filters.source;
  }

  if (filters?.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  // Date range filters
  if (filters?.createdFrom || filters?.createdTo) {
    where.createdAt = {};
    if (filters.createdFrom) {
      where.createdAt.gte = filters.createdFrom;
    }
    if (filters.createdTo) {
      where.createdAt.lte = filters.createdTo;
    }
  }

      return await prisma.customers.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM Queries] getCustomersCount failed:', dbError);
      throw error;
    }
  });
}

type CustomerWithDetails = Prisma.CustomerGetPayload<{
  include: {
    assignedTo: { select: { id: true; name: true; email: true; avatarUrl: true } };
    projects: {
      include: {
        projectManager: { select: { id: true; name: true; email: true } };
      };
    };
    appointments: {
      include: {
        assignedTo: { select: { id: true; name: true } };
      };
    };
  };
}>;

/**
 * Get customer by ID
 *
 * Automatically filtered by current user's organization
 *
 * @param customerId - Customer ID
 * @returns Customer with details or null
 */
export async function getCustomerById(
  customerId: string
): Promise<CustomerWithDetails | null> {
  return withTenantContext(async () => {
    try {
      return await prisma.customers.findFirst({
        where: {
          id: customerId,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          projects: {
            include: {
              projectManager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          appointments: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { start_time: 'desc' },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM Queries] getCustomerById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get customer statistics
 *
 * Automatically filtered by current user's organization
 *
 * @returns Customer stats by status
 */
export async function getCustomerStats() {
  return withTenantContext(async () => {
    try {
      const [totalCustomers, activeCustomers, leadCount, prospectCount] = await Promise.all([
        prisma.customers.count(),
        prisma.customers.count({ where: { status: 'ACTIVE' } }),
        prisma.customers.count({ where: { status: 'LEAD' } }),
        prisma.customers.count({ where: { status: 'PROSPECT' } }),
      ]);

      return {
        totalCustomers,
        activeCustomers,
        leadCount,
        prospectCount,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM Queries] getCustomerStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Search customers by name, email, or company
 *
 * Automatically filtered by current user's organization
 *
 * @param query - Search query
 * @param limit - Maximum results
 * @returns Matching customers
 */
export async function searchCustomers(
  query: string,
  limit = 10
): Promise<Customer[]> {
  return withTenantContext(async () => {
    try {
      return await prisma.customers.findMany({
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
      console.error('[CRM Queries] searchCustomers failed:', dbError);
      throw error;
    }
  });
}