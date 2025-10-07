'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { DashboardMetricSchema, UpdateMetricSchema } from './schemas';

export async function createDashboardMetric(input: unknown) {
  const user = await requireAuth();

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
  }

  const validated = DashboardMetricSchema.parse(input);

  const metric = await prisma.dashboard_metrics.create({
    data: {
      name: validated.name,
      category: validated.category,
      query: validated.query,
      unit: validated.unit,
      format: validated.format,
      target_value: validated.targetValue,
      warning_threshold: validated.warningThreshold,
      critical_threshold: validated.criticalThreshold,
      chart_type: validated.chartType,
      color: validated.color,
      icon: validated.icon,
      permissions: validated.permissions,
      refresh_rate: validated.refreshRate,
      organization_id: validated.organizationId || user.organizationId,
      created_by: user.id,
    },
  });

  revalidatePath('/dashboard');
  return metric;
}

export async function updateDashboardMetric(input: unknown) {
  const user = await requireAuth();

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
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

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
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
