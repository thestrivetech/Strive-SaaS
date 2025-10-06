'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getDashboardWidgets() {
  const user = await requireAuth();

  return await prisma.dashboard_widgets.findMany({
    where: {
      organization_id: user.organizationId,
      is_visible: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getWidgetById(id: string) {
  const user = await requireAuth();

  const widget = await prisma.dashboard_widgets.findUnique({
    where: { id },
    include: {
      users_dashboard_widgets_created_byTousers: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!widget || widget.organization_id !== user.organizationId) {
    throw new Error('Widget not found');
  }

  return widget;
}

export async function getWidgetsByType(type: string) {
  const user = await requireAuth();

  return await prisma.dashboard_widgets.findMany({
    where: {
      organization_id: user.organizationId,
      type: type as any,
      is_visible: true,
    },
  });
}
