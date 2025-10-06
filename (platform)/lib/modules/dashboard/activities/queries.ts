'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getRecentActivities(limit: number = 20) {
  const user = await requireAuth();

  return await prisma.activity_feeds.findMany({
    where: {
      organization_id: user.organizationId,
      is_archived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

export async function getActivitiesByType(type: string, limit: number = 20) {
  const user = await requireAuth();

  return await prisma.activity_feeds.findMany({
    where: {
      organization_id: user.organizationId,
      type: type as any,
      is_archived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

export async function getActivitiesByEntity(entityType: string, entityId: string) {
  const user = await requireAuth();

  return await prisma.activity_feeds.findMany({
    where: {
      organization_id: user.organizationId,
      entity_type: entityType,
      entity_id: entityId,
      is_archived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}
