'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { QueryTransactionTasksSchema, type QueryTransactionTasksInput } from './schemas';

/**
 * Get all tasks for a transaction loop
 *
 * @param input - Query parameters with loop ID and optional filters
 * @returns Array of tasks with assignee and creator information
 * @throws Error if user not authenticated or loop not found
 */
export async function getTasksByLoop(input: QueryTransactionTasksInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = QueryTransactionTasksSchema.parse(input);
  const { loopId, status, priority, assignedTo } = validated;

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's organization
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Build where clause
  const where = {
    loop_id: loopId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedTo && { assigned_to: assignedTo }),
  };

  // Get tasks with related data
  const tasks = await prisma.transaction_tasks.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },      // TODO first, then IN_PROGRESS, etc.
      { priority: 'desc' },    // URGENT/HIGH first
      { due_date: 'asc' },     // Soonest due date first
      { created_at: 'desc' },  // Most recent first
    ],
  });

  return tasks;
}

/**
 * Get a single task by ID
 *
 * @param taskId - Task ID
 * @returns Task with full details including loop and assignee
 * @throws Error if user not authenticated or task not found
 */
export async function getTaskById(taskId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get task with full details
  const task = await prisma.transaction_tasks.findFirst({
    where: {
      id: taskId,
      loop: {
        organization_id: organizationId,
      },
    },
    include: {
      loop: {
        select: {
          id: true,
          property_address: true,
          transaction_type: true,
          status: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
        },
      },
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

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

/**
 * Get task statistics for a loop
 *
 * @param loopId - Loop ID
 * @returns Task statistics (counts by status, priority, overdue, etc.)
 * @throws Error if user not authenticated
 */
export async function getTaskStats(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify loop access
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  const now = new Date();

  // Get task counts
  const [
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
  ] = await Promise.all([
    // Total tasks
    prisma.transaction_tasks.count({
      where: { loop_id: loopId },
    }),
    // TODO tasks
    prisma.transaction_tasks.count({
      where: {
        loop_id: loopId,
        status: 'TODO',
      },
    }),
    // In progress tasks
    prisma.transaction_tasks.count({
      where: {
        loop_id: loopId,
        status: 'IN_PROGRESS',
      },
    }),
    // Completed tasks
    prisma.transaction_tasks.count({
      where: {
        loop_id: loopId,
        status: 'DONE',
      },
    }),
    // Overdue tasks
    prisma.transaction_tasks.count({
      where: {
        loop_id: loopId,
        status: {
          not: 'DONE',
        },
        due_date: {
          lt: now,
        },
      },
    }),
  ]);

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    completionRate,
  };
}

/**
 * Type for task with assignee and creator
 */
export type TaskWithDetails = Awaited<ReturnType<typeof getTasksByLoop>>[number];

/**
 * Type for single task with full details
 */
export type TaskDetail = Awaited<ReturnType<typeof getTaskById>>;

/**
 * Type for task statistics
 */
export type TaskStats = Awaited<ReturnType<typeof getTaskStats>>;
