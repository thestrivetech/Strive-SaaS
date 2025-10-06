'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import {
  CreateWorkflowTemplateSchema,
  ApplyWorkflowSchema,
  UpdateWorkflowTemplateSchema,
} from './schemas';
import type {
  CreateWorkflowTemplateInput,
  ApplyWorkflowInput,
  UpdateWorkflowTemplateInput,
  WorkflowStep,
} from './schemas';

/**
 * Create a new workflow template
 *
 * Template can be applied to transaction loops to auto-generate tasks.
 *
 * @param input - Workflow template data
 * @returns Created template with success flag
 * @throws Error if user not authenticated or validation fails
 */
export async function createWorkflowTemplate(input: CreateWorkflowTemplateInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = CreateWorkflowTemplateSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Verify step IDs are unique
  const stepIds = validated.steps.map(s => s.id);
  const uniqueIds = new Set(stepIds);
  if (stepIds.length !== uniqueIds.size) {
    throw new Error('Step IDs must be unique');
  }

  // Verify dependencies reference valid step IDs
  for (const step of validated.steps) {
    for (const depId of step.dependencies || []) {
      if (!uniqueIds.has(depId)) {
        throw new Error(`Dependency ${depId} not found in step IDs`);
      }
    }
  }

  // Create template
  const template = await prisma.workflows.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      is_template: true,
      steps: validated.steps as any, // JSON stored in database
      status: 'ACTIVE',
      organization_id: organizationId,
      created_by: user.id,
    },
    include: {
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
      action: 'created_workflow_template',
      entity_type: 'workflow',
      entity_id: template.id,
      new_values: template,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  revalidatePath('/dashboard/transactions');

  return { success: true, template };
}

/**
 * Apply a workflow template to a transaction loop
 *
 * This creates:
 * 1. A workflow instance linked to the loop
 * 2. Tasks for each step in the workflow
 * 3. Auto-assigns tasks to parties based on role
 * 4. Calculates due dates based on estimated days
 *
 * @param input - Application data (loopId, templateId)
 * @returns Created workflow and tasks
 * @throws Error if template or loop not found
 */
export async function applyWorkflowToLoop(input: ApplyWorkflowInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = ApplyWorkflowSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Get template
  const template = await prisma.workflows.findFirst({
    where: {
      id: validated.templateId,
      is_template: true,
      organization_id: organizationId,
    },
  });

  if (!template) {
    throw new Error('Workflow template not found');
  }

  // Get loop with parties
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: validated.loopId,
      organization_id: organizationId,
    },
    include: {
      parties: true,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Create workflow instance
  const workflow = await prisma.workflows.create({
    data: {
      name: template.name,
      description: template.description,
      is_template: false,
      steps: template.steps as any, // JSON stored in database
      status: 'ACTIVE',
      loop_id: loop.id,
      created_by: user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Generate tasks from workflow steps
  const steps = template.steps as WorkflowStep[];
  const createdTasks = [];

  for (const step of steps) {
    // Auto-assign to party if role specified
    let assignedTo: string | null = null;
    if (step.autoAssignRole) {
      const party = loop.parties.find(p => p.role === step.autoAssignRole);
      if (party) {
        assignedTo = party.id;
      }
    }

    // Calculate due date based on estimated days
    let dueDate: Date | null = null;
    if (step.estimatedDays) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + step.estimatedDays);
    }

    // Create task
    const task = await prisma.transaction_tasks.create({
      data: {
        title: step.title,
        description: step.description || null,
        loop_id: loop.id,
        created_by: user.id,
        assigned_to: assignedTo,
        due_date: dueDate,
        priority: 'MEDIUM',
        status: 'TODO',
      },
      include: {
        assignee: true,
      },
    });

    createdTasks.push(task);

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
          taskUrl: `/dashboard/transactions/${loop.id}`,
        });
      } catch (error) {
        console.error('Failed to send task assignment email:', error);
        // Don't fail the whole operation if email fails
      }
    }
  }

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'applied_workflow',
      entity_type: 'workflow',
      entity_id: workflow.id,
      new_values: {
        workflowId: workflow.id,
        loopId: loop.id,
        tasksCreated: createdTasks.length,
      },
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  revalidatePath(`/dashboard/transactions/${loop.id}`);
  revalidatePath('/dashboard/transactions');

  return { success: true, workflow, tasks: createdTasks };
}

/**
 * Update a workflow template
 *
 * Only templates can be updated, not workflow instances.
 *
 * @param templateId - Template ID
 * @param input - Update data
 * @returns Updated template
 * @throws Error if template not found or not a template
 */
export async function updateWorkflowTemplate(
  templateId: string,
  input: UpdateWorkflowTemplateInput
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = UpdateWorkflowTemplateSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Get existing template
  const existing = await prisma.workflows.findFirst({
    where: {
      id: templateId,
      is_template: true,
      organization_id: organizationId,
    },
  });

  if (!existing) {
    throw new Error('Workflow template not found');
  }

  // If updating steps, validate them
  if (validated.steps) {
    const stepIds = validated.steps.map(s => s.id);
    const uniqueIds = new Set(stepIds);
    if (stepIds.length !== uniqueIds.size) {
      throw new Error('Step IDs must be unique');
    }

    for (const step of validated.steps) {
      for (const depId of step.dependencies || []) {
        if (!uniqueIds.has(depId)) {
          throw new Error(`Dependency ${depId} not found in step IDs`);
        }
      }
    }
  }

  // Update template
  const template = await prisma.workflows.update({
    where: { id: templateId },
    data: {
      name: validated.name,
      description: validated.description,
      steps: validated.steps as any,
      updated_at: new Date(),
    },
    include: {
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
      action: 'updated_workflow_template',
      entity_type: 'workflow',
      entity_id: template.id,
      old_values: existing,
      new_values: template,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  revalidatePath('/dashboard/transactions');

  return { success: true, template };
}

/**
 * Delete a workflow template
 *
 * Only templates can be deleted. Workflow instances are kept for audit purposes.
 *
 * @param templateId - Template ID
 * @returns Success flag
 * @throws Error if template not found or has been applied
 */
export async function deleteWorkflowTemplate(templateId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get template
  const template = await prisma.workflows.findFirst({
    where: {
      id: templateId,
      is_template: true,
      organization_id: organizationId,
    },
  });

  if (!template) {
    throw new Error('Workflow template not found');
  }

  // Check if template has been applied
  const appliedCount = await prisma.workflows.count({
    where: {
      is_template: false,
      name: template.name, // Match by name to find instances
      organization_id: organizationId,
    },
  });

  if (appliedCount > 0) {
    throw new Error(
      `Cannot delete template. It has been applied to ${appliedCount} loop(s). Archive it instead.`
    );
  }

  // Delete template
  await prisma.workflows.delete({
    where: { id: templateId },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'deleted_workflow_template',
      entity_type: 'workflow',
      entity_id: templateId,
      old_values: template,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  revalidatePath('/dashboard/transactions');

  return { success: true };
}
