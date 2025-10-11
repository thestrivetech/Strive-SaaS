'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
  type ExecuteWorkflowInput,
} from './schemas';
import { executeWorkflow as runWorkflow } from './execution';
import { validateWorkflowDefinition } from './utils';

/**
 * Create a new workflow
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function createWorkflow(input: CreateWorkflowInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized: AI Hub access required');
  }

  const validated = createWorkflowSchema.parse(input);

  // Validate workflow definition
  const validation = validateWorkflowDefinition(
    validated.nodes as any[],
    validated.edges as any[]
  );

  if (!validation.valid) {
    throw new Error(`Invalid workflow: ${validation.error}`);
  }

  await setTenantContext({ organizationId: user.organizationId });

  const workflow = await prisma.automation_workflows.create({
    data: {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: validated.name,
      description: validated.description,
      nodes: validated.nodes,
      edges: validated.edges,
      variables: validated.variables,
      is_active: validated.isActive,
      version: validated.version,
      tags: validated.tags,
      template_id: validated.templateId,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
      template: true,
    },
  });

  revalidatePath('/real-estate/ai-hub/workflows');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return workflow;
}

/**
 * Update an existing workflow
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function updateWorkflow(input: UpdateWorkflowInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateWorkflowSchema.parse(input);
  const { id, ...updateData } = validated;

  // Validate workflow definition if nodes/edges changed
  if (updateData.nodes || updateData.edges) {
    const workflow = await prisma.automation_workflows.findFirst({
      where: { id, organization_id: user.organizationId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const validation = validateWorkflowDefinition(
      (updateData.nodes || workflow.nodes) as any[],
      (updateData.edges || workflow.edges) as any[]
    );

    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.error}`);
    }
  }

  await setTenantContext({ organizationId: user.organizationId });

  const workflow = await prisma.automation_workflows.update({
    where: { id },
    data: {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.nodes && { nodes: updateData.nodes }),
      ...(updateData.edges && { edges: updateData.edges }),
      ...(updateData.variables !== undefined && { variables: updateData.variables }),
      ...(updateData.isActive !== undefined && { is_active: updateData.isActive }),
      ...(updateData.version && { version: updateData.version }),
      ...(updateData.tags && { tags: updateData.tags }),
      ...(updateData.templateId !== undefined && { template_id: updateData.templateId }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/workflows');
  revalidatePath(`/real-estate/ai-hub/workflows/${id}`);
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return workflow;
}

/**
 * Execute a workflow
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeWorkflow(input: ExecuteWorkflowInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = executeWorkflowSchema.parse(input);

  const execution = await runWorkflow(
    validated.workflowId,
    user.organizationId,
    validated.input
  );

  revalidatePath(`/real-estate/ai-hub/workflows/${validated.workflowId}`);

  return execution;
}

/**
 * Delete a workflow
 * RBAC: Requires AI Hub management permissions
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function deleteWorkflow(workflowId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  await setTenantContext({ organizationId: user.organizationId });

  await prisma.automation_workflows.delete({
    where: { id: workflowId },
  });

  revalidatePath('/real-estate/ai-hub/workflows');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return { success: true };
}

/**
 * Toggle workflow active status
 * RBAC: Requires AI Hub management permissions
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function toggleWorkflowStatus(workflowId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  await setTenantContext({ organizationId: user.organizationId });

  const workflow = await prisma.automation_workflows.findFirst({
    where: { id: workflowId, organization_id: user.organizationId },
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const updated = await prisma.automation_workflows.update({
    where: { id: workflowId },
    data: { is_active: !workflow.is_active },
  });

  revalidatePath('/real-estate/ai-hub/workflows');
  revalidatePath(`/real-estate/ai-hub/workflows/${workflowId}`);

  return updated;
}
