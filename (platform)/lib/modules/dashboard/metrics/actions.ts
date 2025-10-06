'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { DashboardMetricSchema, UpdateMetricSchema } from './schemas';

export async function createDashboardMetric(input: unknown) {
  const user = await requireAuth();

  // Check permissions - temporarily use a simple role check
  // Will be replaced with canManageWidgets after RBAC update
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const validated = DashboardMetricSchema.parse(input);

  const metric = await prisma.dashboard_metrics.create({
    data: {
      ...validated,
      organization_id: validated.organizationId || user.organizationId,
      created_by: user.id,
    },
  });

  revalidatePath('/dashboard');
  return metric;
}

export async function updateDashboardMetric(input: unknown) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  const validated = UpdateMetricSchema.parse(input);
  const { id, ...data } = validated;

  // Verify ownership
  const existing = await prisma.dashboard_metrics.findUnique({
    where: { id },
  });

  if (!existing || (existing.organization_id && existing.organization_id !== user.organizationId)) {
    throw new Error('Metric not found');
  }

  const metric = await prisma.dashboard_metrics.update({
    where: { id },
    data,
  });

  revalidatePath('/dashboard');
  return metric;
}

export async function deleteDashboardMetric(id: string) {
  const user = await requireAuth();

  // Check permissions
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role || '')) {
    throw new Error('Insufficient permissions');
  }

  // Verify ownership
  const existing = await prisma.dashboard_metrics.findUnique({
    where: { id },
  });

  if (!existing || (existing.organization_id && existing.organization_id !== user.organizationId)) {
    throw new Error('Metric not found');
  }

  await prisma.dashboard_metrics.delete({
    where: { id },
  });

  revalidatePath('/dashboard');
}
