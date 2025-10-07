'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getRecentActivities(limit: number = 20) {
  // ⚠️ TEMPORARY: Mock data for presentation showcase
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        id: '1',
        type: 'CUSTOMER_CREATED',
        title: 'New customer: John Smith added to CRM',
        description: 'Created new customer record',
        entity_type: 'customer',
        entity_id: 'cust-1',
        created_at: new Date(Date.now() - 3600000),
        organization_id: 'demo-org',
        user_id: 'demo-user',
        is_archived: false,
        user: {
          id: 'demo-user-1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar_url: null,
        },
      },
      {
        id: '2',
        type: 'PROJECT_COMPLETED',
        title: '123 Main St transaction closed successfully',
        description: 'Transaction completed',
        entity_type: 'project',
        entity_id: 'proj-1',
        created_at: new Date(Date.now() - 7200000),
        organization_id: 'demo-org',
        user_id: 'demo-user',
        is_archived: false,
        user: {
          id: 'demo-user-2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          avatar_url: null,
        },
      },
      {
        id: '3',
        type: 'TASK_COMPLETED',
        title: 'Title search completed for 456 Oak Ave',
        description: 'Task marked as complete',
        entity_type: 'task',
        entity_id: 'task-1',
        created_at: new Date(Date.now() - 10800000),
        organization_id: 'demo-org',
        user_id: 'demo-user',
        is_archived: false,
        user: {
          id: 'demo-user-3',
          name: 'Lisa Anderson',
          email: 'lisa@example.com',
          avatar_url: null,
        },
      },
    ];
  }

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
