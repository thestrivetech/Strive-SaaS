'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { DashboardWidgetSchema, UpdateWidgetSchema } from './schemas';

export async function createDashboardWidget(input: unknown) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const validated = DashboardWidgetSchema.parse(input);

  const widget = await prisma.dashboard_widgets.create({
    data: {
      ...validated,
      organization_id: user.organizationId,
      created_by: user.id,
    },
  });

  revalidatePath('/dashboard');
  return widget;
}

export async function updateDashboardWidget(input: unknown) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const validated = UpdateWidgetSchema.parse(input);
  const { id, ...data } = validated;

  // Verify ownership
  const existing = await prisma.dashboard_widgets.findUnique({
    where: { id },
  });

  if (!existing || existing.organization_id !== user.organizationId) {
    throw new Error('Widget not found');
  }

  const widget = await prisma.dashboard_widgets.update({
    where: { id },
    data,
  });

  revalidatePath('/dashboard');
  return widget;
}

export async function deleteDashboardWidget(id: string) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  // Verify ownership
  const existing = await prisma.dashboard_widgets.findUnique({
    where: { id },
  });

  if (!existing || existing.organization_id !== user.organizationId) {
    throw new Error('Widget not found');
  }

  await prisma.dashboard_widgets.delete({
    where: { id },
  });

  revalidatePath('/dashboard');
}
