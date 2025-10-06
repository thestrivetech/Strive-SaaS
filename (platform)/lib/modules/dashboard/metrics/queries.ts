'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getDashboardMetrics() {
  const user = await requireAuth();

  return await prisma.dashboard_metrics.findMany({
    where: {
      OR: [
        { organization_id: user.organizationId },
        { organization_id: null }, // System metrics
      ],
    },
    orderBy: { category: 'asc' },
  });
}

export async function getMetricById(id: string) {
  const user = await requireAuth();

  const metric = await prisma.dashboard_metrics.findUnique({
    where: { id },
  });

  if (!metric) {
    throw new Error('Metric not found');
  }

  // Verify access
  if (metric.organization_id && metric.organization_id !== user.organizationId) {
    throw new Error('Unauthorized');
  }

  return metric;
}

export async function getMetricsByCategory(category: string) {
  const user = await requireAuth();

  return await prisma.dashboard_metrics.findMany({
    where: {
      category: category as any,
      OR: [
        { organization_id: user.organizationId },
        { organization_id: null },
      ],
    },
    orderBy: { name: 'asc' },
  });
}
