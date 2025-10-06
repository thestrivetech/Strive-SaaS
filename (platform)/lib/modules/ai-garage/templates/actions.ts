'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage, canManageAIGarage } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createTemplateSchema,
  updateTemplateSchema,
  createReviewSchema,
  updateReviewSchema,
  type CreateTemplateInput,
  type UpdateTemplateInput,
  type CreateReviewInput,
  type UpdateReviewInput,
} from './schemas';

/**
 * Agent Template Actions Module
 *
 * Server Actions for template marketplace functionality
 * All actions protected by RBAC and multi-tenant isolation
 */

/**
 * Create a new agent template
 *
 * RBAC: Requires canManageAIGarage permission
 */
export async function createTemplate(input: CreateTemplateInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to create templates');
  }

  // Validate input
  const validated = createTemplateSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Ensure organization_id matches current user's organization
      if (!user.organization_members || user.organization_members.length === 0) {
        throw new Error('User must belong to an organization');
      }

      const userOrgId = user.organization_members[0].organization_id;
      if (validated.organization_id !== userOrgId) {
        throw new Error('Organization ID mismatch');
      }

      const template = await prisma.agent_templates.create({
        data: {
          ...validated,
          created_by_id: user.id,
          is_system: false, // Only platform admins can create system templates
          usage_count: 0,
          rating: null,
        },
      });

      revalidatePath('/real-estate/ai-hub/templates');
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] createTemplate failed:', dbError);
      throw error;
    }
  });
}

/**
 * Update an existing template
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be template creator or admin
 */
export async function updateTemplate(input: UpdateTemplateInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to update templates');
  }

  const validated = updateTemplateSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Check if template exists and user has permission to update
      const existingTemplate = await prisma.agent_templates.findUnique({
        where: { id: validated.id },
      });

      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // Only creator or admin can update
      if (existingTemplate.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only update your own templates');
      }

      // Cannot update system templates (unless SUPER_ADMIN)
      if (existingTemplate.is_system && user.role !== 'SUPER_ADMIN') {
        throw new Error('Cannot update system templates');
      }

      const { id, ...updateData } = validated;

      const template = await prisma.agent_templates.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
      });

      revalidatePath('/real-estate/ai-hub/templates');
      revalidatePath(`/real-estate/ai-hub/templates/${id}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] updateTemplate failed:', dbError);
      throw error;
    }
  });
}

/**
 * Delete a template
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be template creator or admin
 */
export async function deleteTemplate(templateId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to delete templates');
  }

  return withTenantContext(async () => {
    try {
      const existingTemplate = await prisma.agent_templates.findUnique({
        where: { id: templateId },
      });

      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // Only creator or admin can delete
      if (existingTemplate.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only delete your own templates');
      }

      // Cannot delete system templates
      if (existingTemplate.is_system) {
        throw new Error('Cannot delete system templates');
      }

      await prisma.agent_templates.delete({
        where: { id: templateId },
      });

      revalidatePath('/real-estate/ai-hub/templates');
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        message: 'Template deleted successfully',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] deleteTemplate failed:', dbError);
      throw error;
    }
  });
}

/**
 * Create a review for a template
 *
 * RBAC: Requires canAccessAIGarage permission
 */
export async function createReview(input: CreateReviewInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Insufficient permissions to review templates');
  }

  const validated = createReviewSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Ensure organization_id matches current user's organization
      if (!user.organization_members || user.organization_members.length === 0) {
        throw new Error('User must belong to an organization');
      }

      const userOrgId = user.organization_members[0].organization_id;
      if (validated.organization_id !== userOrgId) {
        throw new Error('Organization ID mismatch');
      }

      // Check if template exists
      const template = await prisma.agent_templates.findUnique({
        where: { id: validated.template_id },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Check if user already reviewed this template
      const existingReview = await prisma.template_reviews.findFirst({
        where: {
          template_id: validated.template_id,
          reviewer_id: user.id,
        },
      });

      if (existingReview) {
        throw new Error('You have already reviewed this template. Use update instead.');
      }

      const review = await prisma.template_reviews.create({
        data: {
          ...validated,
          reviewer_id: user.id,
        },
      });

      // Update template average rating
      await updateTemplateRating(validated.template_id);

      revalidatePath(`/real-estate/ai-hub/templates/${validated.template_id}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        data: review,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] createReview failed:', dbError);
      throw error;
    }
  });
}

/**
 * Update a review
 *
 * RBAC: Requires canAccessAIGarage permission
 * Additional check: User must be review creator
 */
export async function updateReview(input: UpdateReviewInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Insufficient permissions to update reviews');
  }

  const validated = updateReviewSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const existingReview = await prisma.template_reviews.findUnique({
        where: { id: validated.id },
      });

      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Only reviewer can update their review
      if (existingReview.reviewer_id !== user.id) {
        throw new Error('You can only update your own reviews');
      }

      const { id, ...updateData } = validated;

      const review = await prisma.template_reviews.update({
        where: { id },
        data: updateData,
      });

      // Update template average rating
      await updateTemplateRating(existingReview.template_id);

      revalidatePath(`/real-estate/ai-hub/templates/${existingReview.template_id}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        data: review,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] updateReview failed:', dbError);
      throw error;
    }
  });
}

/**
 * Delete a review
 *
 * RBAC: Requires canAccessAIGarage permission
 * Additional check: User must be review creator or admin
 */
export async function deleteReview(reviewId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Insufficient permissions to delete reviews');
  }

  return withTenantContext(async () => {
    try {
      const existingReview = await prisma.template_reviews.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Only reviewer or admin can delete
      if (existingReview.reviewer_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only delete your own reviews');
      }

      const templateId = existingReview.template_id;

      await prisma.template_reviews.delete({
        where: { id: reviewId },
      });

      // Update template average rating
      await updateTemplateRating(templateId);

      revalidatePath(`/real-estate/ai-hub/templates/${templateId}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        message: 'Review deleted successfully',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] deleteReview failed:', dbError);
      throw error;
    }
  });
}

/**
 * Increment template usage count
 *
 * Called when a template is used to create an agent
 * RBAC: Requires canAccessAIGarage permission
 */
export async function incrementTemplateUsage(templateId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Insufficient permissions');
  }

  return withTenantContext(async () => {
    try {
      await prisma.agent_templates.update({
        where: { id: templateId },
        data: {
          usage_count: {
            increment: 1,
          },
        },
      });

      revalidatePath(`/real-estate/ai-hub/templates/${templateId}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        message: 'Usage count incremented',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] incrementTemplateUsage failed:', dbError);
      throw error;
    }
  });
}

/**
 * Toggle template public visibility
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be template creator or admin
 */
export async function toggleTemplateVisibility(templateId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to change template visibility');
  }

  return withTenantContext(async () => {
    try {
      const existingTemplate = await prisma.agent_templates.findUnique({
        where: { id: templateId },
      });

      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // Only creator or admin can change visibility
      if (existingTemplate.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only change visibility of your own templates');
      }

      // Cannot change system template visibility
      if (existingTemplate.is_system) {
        throw new Error('Cannot change visibility of system templates');
      }

      const template = await prisma.agent_templates.update({
        where: { id: templateId },
        data: {
          is_public: !existingTemplate.is_public,
          updated_at: new Date(),
        },
      });

      revalidatePath('/real-estate/ai-hub/templates');
      revalidatePath(`/real-estate/ai-hub/templates/${templateId}`);
      revalidatePath('/api/v1/ai-garage/templates');

      return {
        success: true,
        data: template,
        message: `Template is now ${template.is_public ? 'public' : 'private'}`,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Templates Actions] toggleTemplateVisibility failed:', dbError);
      throw error;
    }
  });
}

/**
 * Internal helper: Update template average rating
 */
async function updateTemplateRating(templateId: string): Promise<void> {
  try {
    const reviews = await prisma.template_reviews.findMany({
      where: { template_id: templateId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    await prisma.agent_templates.update({
      where: { id: templateId },
      data: { rating: avgRating },
    });
  } catch (error) {
    console.error('[Templates Actions] updateTemplateRating failed:', error);
    // Don't throw - this is a background operation
  }
}
