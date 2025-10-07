'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { requireTransactionAccess } from '../core/permissions';
import { CreateTransactionTaskSchema, UpdateTransactionTaskSchema } from './schemas';
import type { CreateTransactionTaskInput, UpdateTransactionTaskInput } from './schemas';

/**
 * Create a new transaction task
 *
 * Optionally assigns to a party and sends notification email.
 *
 * @param input - Task creation data
 * @returns Created task with success flag
 * @throws Error if user not authenticated or loop not found
 */
export async function createTransactionTask(input: CreateTransactionTaskInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Validate input
  const validated = CreateTransactionTaskSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's organization
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: validated.loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // If assignedTo is provided, verify party exists in this loop
  if (validated.assignedTo) {
    const party = await prisma.loop_parties.findFirst({
      where: {
        id: validated.assignedTo,
        loop_id: validated.loopId,
      },
    });

    if (!party) {
      throw new Error('Assigned party not found in this loop');
    }
  }

  // Create task
  const task = await prisma.transaction_tasks.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      priority: validated.priority,
      due_date: validated.dueDate || null,
      assigned_to: validated.assignedTo || null,
      loop_id: validated.loopId,
      created_by: user.id,
      status: 'TODO',
    },
    include: {
      assignee: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'created_task',
      entity_type: 'transaction_task',
      entity_id: task.id,
      new_values: task,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Send notification if task is assigned
  if (task.assignee) {
    try {
      const { sendTaskAssignmentEmail } = await import('@/lib/email/notifications');
      await sendTaskAssignmentEmail({
        to: task.assignee.email,
        assigneeName: task.assignee.name,
        taskTitle: task.title,
        dueDate: task.due_date || undefined,
        loopAddress: loop.property_address,
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${loop.id}?tab=tasks`,
      });
    } catch (error) {
      console.error('Failed to send task assignment email:', error);
      // Don't fail the task creation if email fails
    }
  }

  // Revalidate cache
  revalidatePath(`/transactions/${loop.id}`);

  return { success: true, task };
}

/**
 * Update an existing transaction task
 *
 * @param taskId - Task ID to update
 * @param input - Update data
 * @returns Updated task with success flag
 * @throws Error if task not found or user not authenticated
 */
export async function updateTransactionTask(taskId: string, input: UpdateTransactionTaskInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Validate input
  const validated = UpdateTransactionTaskSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Verify task exists and belongs to user's organization
  const existingTask = await prisma.transaction_tasks.findFirst({
    where: {
      id: taskId,
      loop: {
        organization_id: organizationId,
      },
    },
    include: {
      assignee: true,
      loop: {
        select: {
          id: true,
          property_address: true,
        },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // If updating assignedTo, verify new party exists in this loop
  if (validated.assignedTo !== undefined && validated.assignedTo !== null) {
    const party = await prisma.loop_parties.findFirst({
      where: {
        id: validated.assignedTo,
        loop_id: existingTask.loop_id,
      },
    });

    if (!party) {
      throw new Error('Assigned party not found in this loop');
    }
  }

  // Update task
  const updatedTask = await prisma.transaction_tasks.update({
    where: { id: taskId },
    data: validated,
    include: {
      assignee: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'updated_task',
      entity_type: 'transaction_task',
      entity_id: taskId,
      old_values: existingTask,
      new_values: updatedTask,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Send notification if assignee changed
  if (
    validated.assignedTo &&
    existingTask.assigned_to !== validated.assignedTo &&
    updatedTask.assignee
  ) {
    try {
      const { sendTaskAssignmentEmail } = await import('@/lib/email/notifications');
      await sendTaskAssignmentEmail({
        to: updatedTask.assignee.email,
        assigneeName: updatedTask.assignee.name,
        taskTitle: updatedTask.title,
        dueDate: updatedTask.due_date || undefined,
        loopAddress: existingTask.loop.property_address,
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${existingTask.loop.id}?tab=tasks`,
      });
    } catch (error) {
      console.error('Failed to send task assignment email:', error);
    }
  }

  // Revalidate cache
  revalidatePath(`/transactions/${existingTask.loop_id}`);

  return { success: true, task: updatedTask };
}

/**
 * Complete a transaction task
 *
 * Marks task as DONE and sets completion timestamp.
 *
 * @param taskId - Task ID to complete
 * @returns Updated task with success flag
 * @throws Error if task not found or user not authenticated
 */
export async function completeTransactionTask(taskId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  const organizationId = getUserOrganizationId(user);

  // Verify task exists and belongs to user's organization
  const task = await prisma.transaction_tasks.findFirst({
    where: {
      id: taskId,
      loop: {
        organization_id: organizationId,
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Update task to completed
  const completedTask = await prisma.transaction_tasks.update({
    where: { id: taskId },
    data: {
      status: 'DONE',
      completed_at: new Date(),
    },
    include: {
      assignee: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'completed_task',
      entity_type: 'transaction_task',
      entity_id: taskId,
      old_values: task,
      new_values: completedTask,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${task.loop_id}`);

  return { success: true, task: completedTask };
}

/**
 * Delete a transaction task
 *
 * Permanently removes the task from the database.
 *
 * @param taskId - Task ID to delete
 * @returns Success flag
 * @throws Error if task not found or user not authenticated
 */
export async function deleteTransactionTask(taskId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  const organizationId = getUserOrganizationId(user);

  // Verify task exists and belongs to user's organization
  const task = await prisma.transaction_tasks.findFirst({
    where: {
      id: taskId,
      loop: {
        organization_id: organizationId,
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Delete task
  await prisma.transaction_tasks.delete({
    where: { id: taskId },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'deleted_task',
      entity_type: 'transaction_task',
      entity_id: taskId,
      old_values: task,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${task.loop_id}`);

  return { success: true };
}
