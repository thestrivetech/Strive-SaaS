'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { QuickActionSchema } from './schemas';

export async function createQuickAction(input: unknown) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const validated = QuickActionSchema.parse(input);

  const action = await prisma.quick_actions.create({
    data: {
      ...validated,
      organization_id: validated.organizationId || user.organizationId,
      created_by: user.id,
    },
  });

  revalidatePath('/dashboard');
  return action;
}

export async function updateQuickAction(input: { id: string } & Partial<typeof QuickActionSchema._type>) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const { id, ...data } = input;

  // Verify ownership
  const existing = await prisma.quick_actions.findUnique({
    where: { id },
  });

  if (!existing || (existing.organization_id && existing.organization_id !== user.organizationId)) {
    throw new Error('Quick action not found');
  }

  const action = await prisma.quick_actions.update({
    where: { id },
    data,
  });

  revalidatePath('/dashboard');
  return action;
}

export async function deleteQuickAction(id: string) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  // Verify ownership
  const existing = await prisma.quick_actions.findUnique({
    where: { id },
  });

  if (!existing || (existing.organization_id && existing.organization_id !== user.organizationId)) {
    throw new Error('Quick action not found');
  }

  await prisma.quick_actions.delete({
    where: { id },
  });

  revalidatePath('/dashboard');
}

export async function executeQuickAction(id: string) {
  const user = await requireAuth();

  const action = await prisma.quick_actions.findUnique({
    where: { id },
  });

  if (!action) {
    throw new Error('Quick action not found');
  }

  // Verify access
  if (action.organization_id && action.organization_id !== user.organizationId) {
    throw new Error('Unauthorized');
  }

  // Update usage tracking
  await prisma.quick_actions.update({
    where: { id },
    data: {
      usage_count: { increment: 1 },
      last_used: new Date(),
    },
  });

  // Return action details for client-side execution
  return {
    actionType: action.action_type,
    targetUrl: action.target_url,
    apiEndpoint: action.api_endpoint,
    formConfig: action.form_config,
  };
}
