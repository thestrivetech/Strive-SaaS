'use server';

import { prisma } from '@/lib/database/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
type CreateTaskInput = any;
type UpdateTaskInput = any;

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = input;

  // Get project to verify organization access
  const project = await prisma.projects.findUnique({
    where: { id: validated.projectId },
    select: { organization_id: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org: { organization_id: string }) => org.organization_id === project.organization_id);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Get the max position for this project to add task at the end
  const maxPosition = await prisma.tasks.aggregate({
    where: { project_id: validated.projectId },
    _max: { position: true },
  });

  const position = (maxPosition._max?.position || 0) + 1;

  // Create task
  const task = await prisma.tasks.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      project_id: validated.projectId,
      assigned_to: validated.assignedToId || null,
      status: validated.status,
      priority: validated.priority,
      due_date: validated.dueDate || null,
      estimated_hours: validated.estimatedHours || null,
      tags: validated.tags,
      position,
      created_by: user.id,
    },
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: project.organization_id,
      user_id: user.id,
      action: 'created_task',
      resource_type: 'task',
      resource_id: task.id,
      new_data: { title: task.title, status: task.status, project_id: task.project_id },
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

  const validated = input;

  // Get existing task to check access
  const existingTask = await prisma.tasks.findUnique({
    where: { id: validated.id },
    include: {
      projects: {
        select: { organization_id: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org: { organization_id: string }) => org.organization_id === existingTask.projects.organization_id
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Prepare update data (only include fields that are provided)
  const updateData: any = {};

  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.assignedToId !== undefined) updateData.assigned_to = validated.assignedToId;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.priority !== undefined) updateData.priority = validated.priority;
  if (validated.dueDate !== undefined) updateData.due_date = validated.dueDate;
  if (validated.estimatedHours !== undefined) updateData.estimated_hours = validated.estimatedHours;
  if (validated.tags !== undefined) updateData.tags = validated.tags;

  // Update task
  const task = await prisma.tasks.update({
    where: { id: validated.id },
    data: updateData,
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: existingTask.projects.organization_id,
      user_id: user.id,
      action: 'updated_task',
      resource_type: 'task',
      resource_id: task.id,
      old_data: {
        title: existingTask.title,
        status: existingTask.status,
        priority: existingTask.priority,
      },
      new_data: {
        title: task.title,
        status: task.status,
        priority: task.priority,
      },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.project_id}`);

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
      projects: {
        select: { id: true, organization_id: true },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org: { organization_id: string }) => org.organization_id === task.projects.organization_id
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Delete task
  await prisma.tasks.delete({
    where: { id: taskId },
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: task.projects.organization_id,
      user_id: user.id,
      action: 'deleted_task',
      resource_type: 'task',
      resource_id: taskId,
      old_data: { title: task.title, status: task.status },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${task.project_id}`);

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
      projects: {
        select: { id: true, organization_id: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org: { organization_id: string }) => org.organization_id === existingTask.projects.organization_id
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
  await prisma.activity_logs.create({
    data: {
      organization_id: existingTask.projects.organization_id,
      user_id: user.id,
      action: 'updated_task_status',
      resource_type: 'task',
      resource_id: taskId,
      old_data: { status: existingTask.status },
      new_data: { status: task.status },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.project_id}`);

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
      projects: {
        select: { id: true, organization_id: true },
      },
    },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some(
    (org: { organization_id: string }) => org.organization_id === existingTask.projects.organization_id
  );

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update task assignment
  const task = await prisma.tasks.update({
    where: { id: taskId },
    data: { assigned_to: userId },
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: existingTask.projects.organization_id,
      user_id: user.id,
      action: 'assigned_task',
      resource_type: 'task',
      resource_id: taskId,
      old_data: { assigned_to: existingTask.assigned_to },
      new_data: { assigned_to: task.assigned_to },
    },
  });

  // Revalidate project page
  revalidatePath('/projects');
  revalidatePath(`/projects/${existingTask.project_id}`);

  return task;
}