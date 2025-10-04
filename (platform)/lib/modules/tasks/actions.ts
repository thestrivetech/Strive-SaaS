'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from './schemas';
import { revalidatePath } from 'next/cache';
import { getUserOrganizations } from '../organization/queries';
import { TaskStatus } from '@prisma/client';

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = createTaskSchema.parse(input);

  // Get project to verify organization access
  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
    select: { organizationId: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organizationId === project.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Get the max position for this project to add task at the end
  const maxPosition = await prisma.tasks.aggregate({
    where: { projectId: validated.projectId },
    _max: { position: true },
  });

  const position = (maxPosition._max.position || 0) + 1;

  // Create task
  const task = await prisma.tasks.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      projectId: validated.projectId,
      assignedToId: validated.assignedToId || null,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate || null,
      estimatedHours: validated.estimatedHours || null,
      tags: validated.tags,
      position,
      createdById: user.id,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: project.organizationId,
      userId: user.id,
      action: 'created_task',
      resourceType: 'task',
      resourceId: task.id,
      newData: { title: task.title, status: task.status, projectId: task.projectId },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${validated.projectId}`);

  return task;
}

/**
 * Update an existing task
 */
export async function updateTask(input: UpdateTaskInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = updateTaskSchema.parse(input);

  // Get existing task to check access
  const existingTask = await prisma.tasks.findUnique({
    where: { id: validated.id },
    include: {
      project: {
        select: { organizationId: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org) => org.organizationId === existingTask.project.organizationId
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Prepare update data (only include fields that are provided)
  const updateData: any = {};

  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.assignedToId !== undefined) updateData.assignedToId = validated.assignedToId;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.priority !== undefined) updateData.priority = validated.priority;
  if (validated.dueDate !== undefined) updateData.dueDate = validated.dueDate;
  if (validated.estimatedHours !== undefined) updateData.estimatedHours = validated.estimatedHours;
  if (validated.tags !== undefined) updateData.tags = validated.tags;

  // Update task
  const task = await prisma.tasks.update({
    where: { id: validated.id },
    data: updateData,
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingTask.project.organizationId,
      userId: user.id,
      action: 'updated_task',
      resourceType: 'task',
      resourceId: task.id,
      oldData: {
        title: existingTask.title,
        status: existingTask.status,
        priority: existingTask.priority,
      },
      newData: {
        title: task.title,
        status: task.status,
        priority: task.priority,
      },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.projectId}`);

  return task;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get task to check access
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org) => org.organizationId === task.project.organizationId
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Delete task
  await prisma.tasks.delete({
    where: { id: taskId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: task.project.organizationId,
      userId: user.id,
      action: 'deleted_task',
      resourceType: 'task',
      resourceId: taskId,
      oldData: { title: task.title, status: task.status },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${task.projectId}`);

  return { success: true };
}

/**
 * Update task status (quick status change)
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get task to check access
  const existingTask = await prisma.tasks.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org) => org.organizationId === existingTask.project.organizationId
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update task status
  const task = await prisma.tasks.update({
    where: { id: taskId },
    data: { status },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingTask.project.organizationId,
      userId: user.id,
      action: 'updated_task_status',
      resourceType: 'task',
      resourceId: taskId,
      oldData: { status: existingTask.status },
      newData: { status: task.status },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.projectId}`);

  return task;
}

/**
 * Assign task to a user
 */
export async function assignTask(taskId: string, userId: string | null) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get task to check access
  const existingTask = await prisma.tasks.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org) => org.organizationId === existingTask.project.organizationId
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update task assignment
  const task = await prisma.tasks.update({
    where: { id: taskId },
    data: { assignedToId: userId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingTask.project.organizationId,
      userId: user.id,
      action: 'assigned_task',
      resourceType: 'task',
      resourceId: taskId,
      oldData: { assignedToId: existingTask.assignedToId },
      newData: { assignedToId: task.assignedToId },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.projectId}`);

  return task;
}