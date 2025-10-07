'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';

export async function getPropertyAlerts() {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.property_alerts.findMany({
    where: {
      organization_id: user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      triggers: {
        orderBy: { triggered_at: 'desc' },
        take: 5
      }
    },
    orderBy: [
      { is_active: 'desc' },
      { created_at: 'desc' }
    ]
  });
}

export async function getPropertyAlertById(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const alert = await prisma.property_alerts.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      triggers: {
        orderBy: { triggered_at: 'desc' },
        take: 20
      }
    }
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  return alert;
}

export async function getAlertTriggers(alertId?: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // If specific alert, verify it belongs to org
  if (alertId) {
    const alert = await prisma.property_alerts.findFirst({
      where: {
        id: alertId,
        organization_id: user.organizationId
      }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    return await prisma.alert_triggers.findMany({
      where: { alert_id: alertId },
      orderBy: { triggered_at: 'desc' }
    });
  }

  // Get all triggers for org's alerts
  const orgAlertIds = await prisma.property_alerts.findMany({
    where: { organization_id: session.user.organizationId },
    select: { id: true }
  });

  return await prisma.alert_triggers.findMany({
    where: {
      alert_id: { in: orgAlertIds.map(a => a.id) }
    },
    include: {
      alert: {
        select: { name: true, alert_type: true }
      }
    },
    orderBy: { triggered_at: 'desc' },
    take: 50
  });
}
