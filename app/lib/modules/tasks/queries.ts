import { Prisma } from '@prisma/client';
import prisma from '@/lib/database/prisma';
import { TaskStatus, Priority } from '@prisma/client';
import { TaskFilters } from './schemas';

/**
 * Type for task with assignee details
 */
export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: {
    assignedTo: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
      };
    };
  };
}>;

/**
 * Type for task with full details (assignee + project + customer)
 */
export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    assignedTo: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
      };
    };
    project: {
      select: {
        id: true;
        name: true;
        organizationId: true;
        customer: {
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
export type TaskWithProject = Prisma.TaskGetPayload<{
  include: {
    assignedTo: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
      };
    };
    project: {
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
 */
export async function getTasks(
  projectId: string,
  filters?: TaskFilters
): Promise<TaskWithAssignee[]> {
  const where: Prisma.TaskWhereInput = {
    projectId,
  };

  // Apply optional filters
  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
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
    orderBy: [
      { status: 'asc' }, // Group by status
      { position: 'asc' }, // Then by position
      { createdAt: 'desc' }, // Then by creation date
    ],
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });

  return tasks;
}

/**
 * Get single task by ID with full details
 */
export async function getTaskById(
  taskId: string,
  organizationId: string
): Promise<TaskWithDetails | null> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        organizationId,
      },
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
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
          customer: {
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
}

/**
 * Get task statistics for a project
 */
export async function getTaskStats(projectId: string) {
  const [totalTasks, todoTasks, inProgressTasks, reviewTasks, doneTasks, overdueTasks] =
    await Promise.all([
      // Total tasks
      prisma.task.count({
        where: { projectId },
      }),
      // TODO tasks
      prisma.task.count({
        where: { projectId, status: TaskStatus.TODO },
      }),
      // In Progress tasks
      prisma.task.count({
        where: { projectId, status: TaskStatus.IN_PROGRESS },
      }),
      // In Review tasks
      prisma.task.count({
        where: { projectId, status: TaskStatus.REVIEW },
      }),
      // Done tasks
      prisma.task.count({
        where: { projectId, status: TaskStatus.DONE },
      }),
      // Overdue tasks (not done and due date in the past)
      prisma.task.count({
        where: {
          projectId,
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
          dueDate: { lt: new Date() },
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
}

/**
 * Get tasks assigned to a user across all projects in an organization
 */
export async function getUserTasks(
  userId: string,
  organizationId: string,
  filters?: TaskFilters
): Promise<TaskWithProject[]> {
  const where: Prisma.TaskWhereInput = {
    assignedToId: userId,
    project: {
      organizationId,
    },
  };

  // Apply optional filters
  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
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
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { dueDate: 'asc' },
      { priority: 'desc' },
    ],
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });

  return tasks;
}