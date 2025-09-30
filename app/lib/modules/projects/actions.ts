'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from './schemas';
import { revalidatePath } from 'next/cache';
import { getUserOrganizations } from '../organization/queries';

export async function createProject(input: CreateProjectInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = createProjectSchema.parse(input);

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organizationId === validated.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Create project
  const project = await prisma.project.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      customerId: validated.customerId || null,
      projectManagerId: validated.projectManagerId || null,
      status: validated.status,
      priority: validated.priority,
      startDate: validated.startDate || null,
      dueDate: validated.dueDate || null,
      budget: validated.budget || null,
      organizationId: validated.organizationId,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: validated.organizationId,
      userId: user.id,
      action: 'created_project',
      resourceType: 'project',
      resourceId: project.id,
      newData: { name: project.name, status: project.status },
    },
  });

  revalidatePath('/projects');

  return project;
}

export async function updateProject(input: UpdateProjectInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = updateProjectSchema.parse(input);

  // Get existing project to check access
  const existingProject = await prisma.project.findUnique({
    where: { id: validated.id },
  });

  if (!existingProject) {
    throw new Error('Project not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organizationId === existingProject.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      description: validated.description,
      customerId: validated.customerId,
      projectManagerId: validated.projectManagerId,
      status: validated.status,
      priority: validated.priority,
      startDate: validated.startDate,
      dueDate: validated.dueDate,
      budget: validated.budget,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingProject.organizationId,
      userId: user.id,
      action: 'updated_project',
      resourceType: 'project',
      resourceId: updatedProject.id,
      oldData: existingProject,
      newData: updatedProject,
    },
  });

  revalidatePath('/projects');
  revalidatePath(`/projects/${validated.id}`);

  return updatedProject;
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get project to check access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  // Delete project (cascade will handle tasks)
  await prisma.project.delete({
    where: { id: projectId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: project.organizationId,
      userId: user.id,
      action: 'deleted_project',
      resourceType: 'project',
      resourceId: projectId,
      oldData: project,
    },
  });

  revalidatePath('/projects');

  return { success: true };
}