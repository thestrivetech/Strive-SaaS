import 'server-only';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import { instantiateTemplate, validateTemplateDefinition } from './utils';
import type {
  CreateTemplateInput,
  UpdateTemplateInput,
  UseTemplateInput,
  ReviewTemplateInput,
} from './schemas';

/**
 * Create new template
 * RBAC: canManageAIHub() required
 */
export async function createTemplate(input: CreateTemplateInput) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId: input.organizationId });

  // Validate template definition
  const validation = validateTemplateDefinition(input.nodes, input.edges);
  if (!validation.valid) {
    throw new Error(`Invalid template: ${validation.error}`);
  }

  const template = await prisma.workflow_templates.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      difficulty: input.difficulty,
      nodes: input.nodes,
      edges: input.edges,
      variables: input.variables || {},
      tags: input.tags || [],
      is_public: input.is_public,
      is_featured: input.is_featured,
      organization_id: input.organizationId,
      created_by: session.id,
      usage_count: 0,
      review_count: 0,
    },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/templates');

  return template;
}

/**
 * Update template
 * RBAC: Only creator or org owner can update
 */
export async function updateTemplate(
  id: string,
  organizationId: string,
  input: UpdateTemplateInput
) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Verify ownership
  const existing = await prisma.workflow_templates.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!existing) {
    throw new Error('Template not found');
  }

  // Only creator or org owner can update
  if (
    existing.created_by !== session.id &&
    session.organizationRole !== 'OWNER' &&
    session.role !== 'SUPER_ADMIN'
  ) {
    throw new Error('Unauthorized: Only template creator or org owner can update');
  }

  // Validate template definition if nodes/edges changed
  if (input.nodes || input.edges) {
    const nodes = input.nodes || (existing.nodes as any[]);
    const edges = input.edges || (existing.edges as any[]);

    const validation = validateTemplateDefinition(nodes, edges);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.error}`);
    }
  }

  const template = await prisma.workflow_templates.update({
    where: { id },
    data: input,
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/templates');

  return template;
}

/**
 * Delete template
 * RBAC: Only creator or org owner can delete
 */
export async function deleteTemplate(id: string, organizationId: string) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Verify ownership
  const existing = await prisma.workflow_templates.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!existing) {
    throw new Error('Template not found');
  }

  // Only creator or org owner can delete
  if (
    existing.created_by !== session.id &&
    session.organizationRole !== 'OWNER' &&
    session.role !== 'SUPER_ADMIN'
  ) {
    throw new Error('Unauthorized: Only template creator or org owner can delete');
  }

  await prisma.workflow_templates.delete({
    where: { id },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/templates');

  return { success: true };
}

/**
 * Use template (instantiate as workflow)
 */
export async function useTemplate(input: UseTemplateInput) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId: input.organizationId });

  // Get template
  const template = await prisma.workflow_templates.findFirst({
    where: {
      id: input.templateId,
      OR: [
        { is_public: true },
        { organization_id: input.organizationId },
      ],
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Instantiate template as workflow
  const workflow = await instantiateTemplate(
    template,
    input.name,
    input.description,
    input.variables || {},
    input.organizationId,
    input.creatorId
  );

  revalidatePath('/real-estate/ai-hub');

  return workflow;
}

/**
 * Publish template (make public)
 */
export async function publishTemplate(id: string, organizationId: string) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Verify ownership
  const existing = await prisma.workflow_templates.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!existing) {
    throw new Error('Template not found');
  }

  // Only creator or org owner can publish
  if (
    existing.created_by !== session.id &&
    session.organizationRole !== 'OWNER' &&
    session.role !== 'SUPER_ADMIN'
  ) {
    throw new Error('Unauthorized: Only template creator or org owner can publish');
  }

  const template = await prisma.workflow_templates.update({
    where: { id },
    data: { is_public: true },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/templates');

  return template;
}

/**
 * Review template (submit rating and comment)
 */
export async function reviewTemplate(input: ReviewTemplateInput) {
  const session = await requireAuth();

  await setTenantContext({ organizationId: input.organizationId });

  // Verify template exists and is accessible
  const template = await prisma.workflow_templates.findFirst({
    where: {
      id: input.templateId,
      OR: [
        { is_public: true },
        { organization_id: input.organizationId },
      ],
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check if user already reviewed
  // Note: review_count and average_rating are stored on workflow_templates
  // For now, we'll just update the template stats directly
  // In a full implementation, you'd create a separate reviews table

  // Calculate new average rating
  const newReviewCount = template.review_count + 1;
  const currentTotal = (template.average_rating || 0) * template.review_count;
  const newAverage = (currentTotal + input.rating) / newReviewCount;

  // Update template stats
  const updatedTemplate = await prisma.workflow_templates.update({
    where: { id: template.id },
    data: {
      review_count: newReviewCount,
      average_rating: Math.round(newAverage * 10) / 10, // Round to 1 decimal
    },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/templates');

  return {
    success: true,
    template: updatedTemplate,
    review: {
      rating: input.rating,
      comment: input.comment,
      userId: input.userId,
    },
  };
}
