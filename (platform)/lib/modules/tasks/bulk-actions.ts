'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
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
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
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

    const organizationId = getUserOrganizationId(user);
    const validated = BulkUpdateStatusSchema.parse(input);

    // Verify user has access to all tasks (multi-tenancy check)
    const tasks = await prisma.tasks.findMany({
      where: {
        id: { in: validated.taskIds },
        projects: { organization_id: organizationId },
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
    const result = await prisma.tasks.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        status: validated.status,
        updated_at: new Date(),
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'BULK_UPDATE_STATUS',
        resource_type: 'Task',
        resource_id: validated.taskIds.join(','),
        new_data: {
          status: validated.status,
          count: validated.taskIds.length,
          taskIds: validated.taskIds,
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

    const organizationId = getUserOrganizationId(user);
    const validated = BulkAssignTasksSchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.tasks.findMany({
      where: {
        id: { in: validated.taskIds },
        projects: { organization_id: organizationId },
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
    const assignee = await prisma.organization_members.findFirst({
      where: {
        user_id: validated.assigneeId,
        organization_id: organizationId,
      },
    });

    if (!assignee) {
      return {
        success: false,
        error: 'Assignee not found in your organization',
      };
    }

    // Bulk assign
    const result = await prisma.tasks.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        assigned_to: validated.assigneeId,
        updated_at: new Date(),
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'BULK_ASSIGN',
        resource_type: 'Task',
        resource_id: validated.taskIds.join(','),
        new_data: {
          assigneeId: validated.assigneeId,
          count: validated.taskIds.length,
          taskIds: validated.taskIds,
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

    const organizationId = getUserOrganizationId(user);
    const validated = BulkUpdatePrioritySchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.tasks.findMany({
      where: {
        id: { in: validated.taskIds },
        projects: { organization_id: organizationId },
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
    const result = await prisma.tasks.updateMany({
      where: { id: { in: validated.taskIds } },
      data: {
        priority: validated.priority,
        updated_at: new Date(),
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'BULK_UPDATE_PRIORITY',
        resource_type: 'Task',
        resource_id: validated.taskIds.join(','),
        new_data: {
          priority: validated.priority,
          count: validated.taskIds.length,
          taskIds: validated.taskIds,
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

    const organizationId = getUserOrganizationId(user);
    const validated = BulkDeleteTasksSchema.parse(input);

    // Verify user has access to all tasks
    const tasks = await prisma.tasks.findMany({
      where: {
        id: { in: validated.taskIds },
        projects: { organization_id: organizationId },
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
    const result = await prisma.tasks.deleteMany({
      where: { id: { in: validated.taskIds } },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'BULK_DELETE',
        resource_type: 'Task',
        resource_id: validated.taskIds.join(','),
        new_data: {
          count: validated.taskIds.length,
          taskIds: validated.taskIds,
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