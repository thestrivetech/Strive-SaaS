'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';
import { PropertyAlertSchema, AlertTriggerSchema } from './schemas';
import type { PropertyAlertInput, AlertTriggerInput } from './schemas';

export async function createPropertyAlert(input: PropertyAlertInput) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const validated = PropertyAlertSchema.parse(input);

  const alert = await prisma.property_alerts.create({
    data: {
      name: validated.name,
      description: validated.description,
      alert_type: validated.alertType,
      criteria: validated.criteria,
      area_codes: validated.areaCodes,
      radius: validated.radius,
      latitude: validated.latitude,
      longitude: validated.longitude,
      email_enabled: validated.emailEnabled,
      sms_enabled: validated.smsEnabled,
      frequency: validated.frequency,
      is_active: validated.isActive,
      organization_id: user.organizationId,
      created_by_id: user.id,
    }
  });

  revalidatePath('/real-estate/reid/alerts');

  return alert;
}

export async function updatePropertyAlert(
  id: string,
  input: Partial<PropertyAlertInput>
) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const existing = await prisma.property_alerts.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Alert not found');
  }

  const validated = PropertyAlertSchema.partial().parse(input);

  const updated = await prisma.property_alerts.update({
    where: { id },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.alertType && { alert_type: validated.alertType }),
      ...(validated.criteria && { criteria: validated.criteria }),
      ...(validated.areaCodes && { area_codes: validated.areaCodes }),
      ...(validated.emailEnabled !== undefined && { email_enabled: validated.emailEnabled }),
      ...(validated.smsEnabled !== undefined && { sms_enabled: validated.smsEnabled }),
      ...(validated.frequency && { frequency: validated.frequency }),
      ...(validated.isActive !== undefined && { is_active: validated.isActive }),
      updated_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/alerts');
  revalidatePath(`/real-estate/reid/alerts/${id}`);

  return updated;
}

export async function deletePropertyAlert(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const existing = await prisma.property_alerts.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Alert not found');
  }

  await prisma.property_alerts.delete({
    where: { id }
  });

  revalidatePath('/real-estate/reid/alerts');
}

export async function createAlertTrigger(input: AlertTriggerInput) {
  const validated = AlertTriggerSchema.parse(input);

  const trigger = await prisma.alert_triggers.create({
    data: {
      alert_id: validated.alertId,
      triggered_by: validated.triggeredBy,
      message: validated.message,
      severity: validated.severity,
    }
  });

  // Update alert trigger count
  await prisma.property_alerts.update({
    where: { id: validated.alertId },
    data: {
      trigger_count: { increment: 1 },
      last_triggered: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/alerts');

  return trigger;
}

export async function acknowledgeAlertTrigger(
  triggerId: string,
  userId: string
) {
  const updated = await prisma.alert_triggers.update({
    where: { id: triggerId },
    data: {
      acknowledged: true,
      acknowledged_at: new Date(),
      acknowledged_by_id: userId,
    }
  });

  revalidatePath('/real-estate/reid/alerts');

  return updated;
}
