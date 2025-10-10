'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function recordActivity(input: unknown) {
  const user = await requireAuth();

  const validated = input;

  // Extract and map fields to snake_case for Prisma
  const { userId, entityType, entityId, ...activityData } = validated;

  return await prisma.activity_feeds.create({
    data: {
      ...activityData,
      entity_type: entityType,
      entity_id: entityId,
      organization_id: user.organizationId,
      user_id: userId || user.id,
    },
  });
}

export async function markActivityAsRead(id: string) {
  const user = await requireAuth();

  // Verify ownership
  const activity = await prisma.activity_feeds.findUnique({
    where: { id },
  });

  if (!activity || activity.organization_id !== user.organizationId) {
    throw new Error('Activity not found');
  }

  return await prisma.activity_feeds.update({
    where: { id },
    data: { is_read: true },
  });
}

export async function archiveActivity(id: string) {
  const user = await requireAuth();

  // Verify ownership
  const activity = await prisma.activity_feeds.findUnique({
    where: { id },
  });

  if (!activity || activity.organization_id !== user.organizationId) {
    throw new Error('Activity not found');
  }

  return await prisma.activity_feeds.update({
    where: { id },
    data: { is_archived: true },
  });
}
