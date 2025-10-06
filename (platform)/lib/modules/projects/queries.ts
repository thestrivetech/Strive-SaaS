import 'server-only';

import { prisma } from '@/lib/prisma';
import { withTenantContext } from '@/lib/database/utils';
import type { projects } from '@prisma/client';
import type { ProjectFilters } from './schemas';

/**
 * Projects Module - Query Functions
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware.
 * No need to pass organizationId manually - it's injected automatically!
 */

type ProjectWithRelations = projects & {
  customers: { id: string; name: string; email: string | null } | null;
  users: { id: string; name: string | null; email: string; avatar_url: string | null };
  tasks: { id: string; status: string }[];
};

/**
 * Get all projects for the current organization
 *
 * @param filters - Optional filters for projects
 * @returns Array of projects with related data
 */
export async function getProjects(
  filters?: ProjectFilters
): Promise<ProjectWithRelations[]> {
  return withTenantContext(async () => {
    const where: any = {};

  if (filters?.status) {
    // Support array of statuses (OR logic)
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
  }

  if (filters?.priority) {
    // Support array of priorities (OR logic)
    where.priority = Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority;
  }

  if (filters?.customerId) {
    where.customer_id = filters.customerId;
  }

  if (filters?.projectManagerId) {
    where.project_manager_id = filters.projectManagerId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Date range filters
  if (filters?.createdFrom || filters?.createdTo) {
    where.created_at = {};
    if (filters.createdFrom) {
      where.created_at.gte = filters.createdFrom;
    }
    if (filters.createdTo) {
      where.created_at.lte = filters.createdTo;
    }
  }

  if (filters?.dueFrom || filters?.dueTo) {
    where.due_date = {};
    if (filters.dueFrom) {
      where.due_date.gte = filters.dueFrom;
    }
    if (filters.dueTo) {
      where.due_date.lte = filters.dueTo;
    }
  }

    return await prisma.projects.findMany({
      where,
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
}

/**
 * Get count of projects matching filters
 *
 * @param filters - Optional filters for projects
 * @returns Number of matching projects
 */
export async function getProjectsCount(
  filters?: ProjectFilters
): Promise<number> {
  return withTenantContext(async () => {
    const where: any = {};

  if (filters?.status) {
    // Support array of statuses (OR logic)
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
  }

  if (filters?.priority) {
    // Support array of priorities (OR logic)
    where.priority = Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority;
  }

  if (filters?.customerId) {
    where.customer_id = filters.customerId;
  }

  if (filters?.projectManagerId) {
    where.project_manager_id = filters.projectManagerId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Date range filters
  if (filters?.createdFrom || filters?.createdTo) {
    where.created_at = {};
    if (filters.createdFrom) {
      where.created_at.gte = filters.createdFrom;
    }
    if (filters.createdTo) {
      where.created_at.lte = filters.createdTo;
    }
  }

  if (filters?.dueFrom || filters?.dueTo) {
    where.due_date = {};
    if (filters.dueFrom) {
      where.due_date.gte = filters.dueFrom;
    }
    if (filters.dueTo) {
      where.due_date.lte = filters.dueTo;
    }
  }

    return await prisma.projects.count({ where });
  });
}

/**
 * Get a single project by ID
 *
 * @param projectId - Project ID
 * @returns Project with related data or null
 */
export async function getProjectById(
  projectId: string
) {
  return withTenantContext(async () => {
    return await prisma.projects.findFirst({
      where: {
        id: projectId,
      },
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        tasks: {
          include: {
            users_tasks_assigned_toTousers: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  });
}

/**
 * Get project statistics for the current organization
 *
 * @returns Project statistics including counts by status and total budget
 */
export async function getProjectStats() {
  return withTenantContext(async () => {
    const [totalProjects, activeProjects, completedProjects, onHoldProjects] = await Promise.all([
      prisma.projects.count(),
      prisma.projects.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.projects.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.projects.count({
        where: { status: 'ON_HOLD' },
      }),
    ]);

    // Calculate total budget
    const budgetResult = await prisma.projects.aggregate({
      _sum: {
        budget: true,
      },
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget: budgetResult._sum.budget || 0,
    };
  });
}

export function calculateProjectProgress(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  return Math.round((completedTasks / tasks.length) * 100);
}