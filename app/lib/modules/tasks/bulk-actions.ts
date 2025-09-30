'use server';

import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import type { Prisma } from '@prisma/client';

const BulkUpdateStatusSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, 'At least one task required').max(100, 'Maximum 100 tasks at once'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']),
});

const BulkAssignTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  assigneeId: z.string().uuid(),
});

const BulkDeleteTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
});

const BulkUpdatePrioritySchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

/**
 * Bulk update task status
 */
export async function bulkUpdateTaskStatus(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = BulkUpdateStatusSchema.parse(input);

    // Verify user has access to all tasks (multi-tenancy check)
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: validated.taskIds },
        project: { organizationId: user.organizationId },
      },
      select: { id: true },
    });

    if (tasks.length !== validated.taskIds.length) {
      return {
        success: false,
        error: 'Some tasks not found or you do not have permission to modify them',
      };
    }

    // Bulk update
    const result = await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        status: validated.status,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'BULK_UPDATE_STATUS',
        entityType: 'Task',
        entityId: validated.taskIds.join(','),
        details: {
          status: validated.status,
          count: validated.taskIds.length,
        } as Prisma.JsonObject,
      },
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Bulk update status error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update task status' };
  }
}

/**
 * Bulk assign tasks to a user
 */
export async function bulkAssignTasks(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = BulkAssignTasksSchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: validated.taskIds },
        project: { organizationId: user.organizationId },
      },
      select: { id: true },
    });

    if (tasks.length !== validated.taskIds.length) {
      return {
        success: false,
        error: 'Some tasks not found or you do not have permission to modify them',
      };
    }

    // Verify assignee is in the same organization
    const assignee = await prisma.organizationMember.findFirst({
      where: {
        userId: validated.assigneeId,
        organizationId: user.organizationId,
      },
    });

    if (!assignee) {
      return {
        success: false,
        error: 'Assignee not found in your organization',
      };
    }

    // Bulk assign
    const result = await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        assigneeId: validated.assigneeId,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'BULK_ASSIGN',
        entityType: 'Task',
        entityId: validated.taskIds.join(','),
        details: {
          assigneeId: validated.assigneeId,
          count: validated.taskIds.length,
        } as Prisma.JsonObject,
      },
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Bulk assign error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to assign tasks' };
  }
}

/**
 * Bulk update task priority
 */
export async function bulkUpdateTaskPriority(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = BulkUpdatePrioritySchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: validated.taskIds },
        project: { organizationId: user.organizationId },
      },
      select: { id: true },
    });

    if (tasks.length !== validated.taskIds.length) {
      return {
        success: false,
        error: 'Some tasks not found or you do not have permission to modify them',
      };
    }

    // Bulk update
    const result = await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        priority: validated.priority,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'BULK_UPDATE_PRIORITY',
        entityType: 'Task',
        entityId: validated.taskIds.join(','),
        details: {
          priority: validated.priority,
          count: validated.taskIds.length,
        } as Prisma.JsonObject,
      },
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Bulk update priority error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update task priority' };
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = BulkDeleteTasksSchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: validated.taskIds },
        project: { organizationId: user.organizationId },
      },
      select: { id: true, title: true },
    });

    if (tasks.length !== validated.taskIds.length) {
      return {
        success: false,
        error: 'Some tasks not found or you do not have permission to delete them',
      };
    }

    // Bulk delete
    const result = await prisma.task.deleteMany({
      where: { id: { in: validated.taskIds } },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'BULK_DELETE',
        entityType: 'Task',
        entityId: validated.taskIds.join(','),
        details: {
          count: validated.taskIds.length,
          taskTitles: tasks.map((t) => t.title),
        } as Prisma.JsonObject,
      },
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error('Bulk delete error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to delete tasks' };
  }
}