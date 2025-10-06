'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { QueryWorkflowTemplatesSchema } from './schemas';
import type { QueryWorkflowTemplatesInput } from './schemas';

/**
 * Get all workflow templates for the current organization
 *
 * @param input - Query filters
 * @returns List of workflow templates
 * @throws Error if user not authenticated
 */
export async function getWorkflowTemplates(input?: QueryWorkflowTemplatesInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Validate input
  const validated = input
    ? QueryWorkflowTemplatesSchema.parse(input)
    : { isTemplate: true as const };

  // Build where clause
  const where: any = {
    is_template: validated.isTemplate,
    organization_id: organizationId,
  };

  // Filter by transaction type if specified
  if (validated.transactionType && validated.transactionType !== 'ALL') {
    where.steps = {
      path: ['transactionType'],
      equals: validated.transactionType,
    };
  }

  const templates = await prisma.workflows.findMany({
    where,
    orderBy: {
      created_at: 'desc',
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

  return { success: true, templates };
}

/**
 * Get a single workflow template by ID
 *
 * @param templateId - Template ID
 * @returns Workflow template
 * @throws Error if template not found or user not authenticated
 */
export async function getWorkflowTemplateById(templateId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  const template = await prisma.workflows.findFirst({
    where: {
      id: templateId,
      is_template: true,
      organization_id: organizationId,
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

  if (!template) {
    throw new Error('Workflow template not found');
  }

  return { success: true, template };
}

/**
 * Get all workflow instances (applied workflows) for a loop
 *
 * @param loopId - Transaction loop ID
 * @returns List of workflow instances
 * @throws Error if user not authenticated
 */
export async function getWorkflowsByLoopId(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's organization
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  const workflows = await prisma.workflows.findMany({
    where: {
      loop_id: loopId,
      is_template: false,
    },
    orderBy: {
      created_at: 'desc',
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

  return { success: true, workflows };
}
