'use server';

import { prisma } from '@/lib/database/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase/server';
type CreateProjectInput = any;
type UpdateProjectInput = any;

export async function createProject(input: CreateProjectInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = input;

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org: { organization_id: string }) => org.organization_id === validated.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Create project
  const data: any = {
    name: validated.name,
    description: validated.description || null,
    customer_id: validated.customerId || null,
    status: validated.status,
    priority: validated.priority,
    start_date: validated.startDate || null,
    due_date: validated.dueDate || null,
    budget: validated.budget || null,
    organization_id: validated.organizationId,
  };

  // Only include projectManagerId if provided
  if (validated.projectManagerId) {
    data.project_manager_id = validated.projectManagerId;
  }

  const project = await prisma.projects.create({ data });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: validated.organizationId,
      user_id: user.id,
      action: 'created_project',
      resource_type: 'project',
      resource_id: project.id,
      new_data: { name: project.name, status: project.status },
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

  const validated = input;

  // Get existing project to check access
  const existingProject = await prisma.projects.findUnique({
    where: { id: validated.id },
  });

  if (!existingProject) {
    throw new Error('Project not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org: { organization_id: string }) => org.organization_id === existingProject.organization_id);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update project
  const updatedProject = await prisma.projects.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      description: validated.description,
      customer_id: validated.customerId,
      project_manager_id: validated.projectManagerId ?? undefined,
      status: validated.status,
      priority: validated.priority,
      start_date: validated.startDate,
      due_date: validated.dueDate,
      budget: validated.budget,
    },
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: existingProject.organization_id,
      user_id: user.id,
      action: 'updated_project',
      resource_type: 'project',
      resource_id: updatedProject.id,
      old_data: existingProject,
      new_data: updatedProject,
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
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
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

  // Delete project (cascade will handle tasks)
  await prisma.projects.delete({
    where: { id: projectId },
  });

  // Log activity
  await prisma.activity_logs.create({
    data: {
      organization_id: project.organization_id,
      user_id: user.id,
      action: 'deleted_project',
      resource_type: 'project',
      resource_id: projectId,
      old_data: project,
    },
  });

  revalidatePath('/projects');

  return { success: true };
}