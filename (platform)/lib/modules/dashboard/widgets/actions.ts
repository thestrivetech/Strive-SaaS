'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function createDashboardWidget(input: unknown) {
  const user = await requireAuth();

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
  }

  const validated = input;

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

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
  }

  const validated = input;
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

  // Check both GlobalRole (platform-level) AND OrganizationRole (org-level)
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER'].includes(user.organizationRole || '');

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error('Insufficient permissions - requires SUPER_ADMIN or organization ADMIN/OWNER');
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
