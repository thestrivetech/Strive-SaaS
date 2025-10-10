import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { custom_agent_orders, Prisma } from '@prisma/client';

/**
 * Agent Orders Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 */

type OrderWithDetails = Prisma.custom_agent_ordersGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    assignee: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    milestones: true;
    build_logs: {
      orderBy: { created_at: 'desc' };
      take: 50;
    };
  };
}>;

/**
 * Get orders with filters
 */
export async function getOrders(
  filters?: OrderFilters
): Promise<OrderWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.custom_agent_ordersWhereInput = {};

      // Status filter
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      // Complexity filter
      if (filters?.complexity) {
        where.complexity = Array.isArray(filters.complexity)
          ? { in: filters.complexity }
          : filters.complexity;
      }

      // Priority filter
      if (filters?.priority) {
        where.priority = Array.isArray(filters.priority)
          ? { in: filters.priority }
          : filters.priority;
      }

      // Assignment filters
      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }
      if (filters?.created_by_id) {
        where.created_by_id = filters.created_by_id;
      }

      // Search across title, description, use_case
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { use_case: { contains: filters.search, mode: 'insensitive' } },
        ];
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

      if (filters?.submitted_from || filters?.submitted_to) {
        where.submitted_at = {};
        if (filters.submitted_from) {
          where.submitted_at.gte = filters.submitted_from;
        }
        if (filters.submitted_to) {
          where.submitted_at.lte = filters.submitted_to;
        }
      }

      // Sorting
      const orderBy: Prisma.custom_agent_ordersOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        orderBy.created_at = 'desc';
      }

      return await prisma.custom_agent_orders.findMany({
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
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          milestones: {
            orderBy: { sort_order: 'asc' },
          },
          build_logs: {
            orderBy: { created_at: 'desc' },
            take: 50,
          },
        },
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrders failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order count with filters
 */
export async function getOrdersCount(filters?: OrderFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.custom_agent_ordersWhereInput = {};

      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters?.complexity) {
        where.complexity = Array.isArray(filters.complexity)
          ? { in: filters.complexity }
          : filters.complexity;
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await prisma.custom_agent_orders.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrdersCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(
  orderId: string
): Promise<OrderWithDetails | null> {
  return withTenantContext(async () => {
    try {
      return await prisma.custom_agent_orders.findFirst({
        where: { id: orderId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          milestones: {
            orderBy: { sort_order: 'asc' },
          },
          build_logs: {
            orderBy: { created_at: 'desc' },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrderById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  return withTenantContext(async () => {
    try {
      const [
        totalOrders,
        draftOrders,
        activeOrders,
        completedOrders,
      ] = await Promise.all([
        prisma.custom_agent_orders.count(),
        prisma.custom_agent_orders.count({ where: { status: 'DRAFT' } }),
        prisma.custom_agent_orders.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.custom_agent_orders.count({ where: { status: 'COMPLETED' } }),
      ]);

      return {
        totalOrders,
        draftOrders,
        activeOrders,
        completedOrders,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrderStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get orders assigned to a user
 */
export async function getOrdersByAssignee(
  userId: string
): Promise<OrderWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getOrders({
        assigned_to_id: userId,
        limit: 50,
        offset: 0,
        sort_order: 'desc'
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrdersByAssignee failed:', dbError);
      throw error;
    }
  });
}
