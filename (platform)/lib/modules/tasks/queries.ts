import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { TaskStatus, Priority } from '@prisma/client';
import { TaskFilters } from './schemas';

/**
 * Tasks Module - Query Functions
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware.
 * Tasks are organization-scoped through their parent project relationship.
 */

/**
 * Type for task with assignee details
 */
export type TaskWithAssignee = Prisma.tasksGetPayload<{
  include: {
    users_tasks_assigned_toTousers: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar_url: true;
      };
    };
  };
}>;

/**
 * Type for task with full details (assignee + project + customer)
 */
export type TaskWithDetails = Prisma.tasksGetPayload<{
  include: {
    users_tasks_assigned_toTousers: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar_url: true;
      };
    };
    projects: {
      select: {
        id: true;
        name: true;
        organization_id: true;
        customers: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

/**
 * Type for task with project info
 */
export type TaskWithProject = Prisma.tasksGetPayload<{
  include: {
    users_tasks_assigned_toTousers: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar_url: true;
      };
    };
    projects: {
      select: {
        id: true;
        name: true;
        status: true;
      };
    };
  };
}>;

/**
 * Get tasks for a project with optional filters
 *
 * @param projectId - Project ID
 * @param filters - Optional filters for tasks
 * @returns Array of tasks with assignee details
 */
export async function getTasks(
  projectId: string,
  filters?: TaskFilters
): Promise<TaskWithAssignee[]> {
  return withTenantContext(async () => {
    const where: Prisma.tasksWhereInput = {
      project_id: projectId,
    };

    // Apply optional filters
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assigned_to = filters.assignedToId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.tasks.findMany({
      where,
      include: {
        users_tasks_assigned_toTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Group by status
        { position: 'asc' }, // Then by position
        { created_at: 'desc' }, // Then by creation date
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return tasks;
  });
}

/**
 * Get count of tasks for a project with optional filters
 *
 * @param projectId - Project ID
 * @param filters - Optional filters for tasks
 * @returns Number of matching tasks
 */
export async function getTasksCount(
  projectId: string,
  filters?: TaskFilters
): Promise<number> {
  return withTenantContext(async () => {
    const where: Prisma.tasksWhereInput = {
      project_id: projectId,
    };

    // Apply optional filters
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assigned_to = filters.assignedToId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.tasks.count({ where });
  });
}

/**
 * Get single task by ID with full details
 *
 * @param taskId - Task ID
 * @returns Task with full details or null
 */
export async function getTaskById(
  taskId: string
): Promise<TaskWithDetails | null> {
  return withTenantContext(async () => {
    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
      },
      include: {
        users_tasks_assigned_toTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            organization_id: true,
            customers: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return task;
  });
}

/**
 * Get task statistics for a project
 *
 * @param projectId - Project ID
 * @returns Task statistics by status
 */
export async function getTaskStats(projectId: string) {
  return withTenantContext(async () => {
    const [totalTasks, todoTasks, inProgressTasks, reviewTasks, doneTasks, overdueTasks] =
      await Promise.all([
        // Total tasks
        prisma.tasks.count({
          where: { project_id: projectId },
        }),
        // TODO tasks
        prisma.tasks.count({
          where: { project_id: projectId, status: TaskStatus.TODO },
        }),
        // In Progress tasks
        prisma.tasks.count({
          where: { project_id: projectId, status: TaskStatus.IN_PROGRESS },
        }),
        // In Review tasks
        prisma.tasks.count({
          where: { project_id: projectId, status: TaskStatus.REVIEW },
        }),
        // Done tasks
        prisma.tasks.count({
          where: { project_id: projectId, status: TaskStatus.DONE },
        }),
        // Overdue tasks (not done and due date in the past)
        prisma.tasks.count({
          where: {
            project_id: projectId,
            status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
            due_date: { lt: new Date() },
          },
        }),
      ]);

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks: reviewTasks,
      doneTasks,
      overdueTasks,
    };
  });
}

/**
 * Get tasks assigned to a user across all projects in current organization
 *
 * @param userId - User ID
 * @param filters - Optional filters for tasks
 * @returns Array of tasks with project details
 */
export async function getUserTasks(
  userId: string,
  filters?: TaskFilters
): Promise<TaskWithProject[]> {
  return withTenantContext(async () => {
    const where: Prisma.tasksWhereInput = {
      assigned_to: userId,
    };

    // Apply optional filters
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.projectId) {
      where.project_id = filters.projectId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.tasks.findMany({
      where,
      include: {
        users_tasks_assigned_toTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { due_date: 'asc' },
        { priority: 'desc' },
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return tasks;
  });
}
