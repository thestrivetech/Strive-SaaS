'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';
import {
  PropertyAlertSchema,
  AlertTriggerSchema,
  type PropertyAlertInput,
  type AlertTriggerInput
} from './schemas';

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
      is_active: validated.isActive ?? true,

      // Geographic Criteria
      area_type: validated.areaType,
      zip_codes: validated.zipCodes ?? [],
      cities: validated.cities ?? [],
      states: validated.states ?? [],

      // Alert Conditions (JSON)
      conditions: validated.conditions,

      // Delivery Settings
      frequency: validated.frequency,
      delivery_channels: validated.deliveryChannels ?? [],
      email_addresses: validated.emailAddresses ?? [],
      webhook_url: validated.webhookUrl,

      // Priority
      priority: validated.priority ?? 'MEDIUM',
      tags: validated.tags ?? [],

      organization_id: user.organizationId,
      user_id: user.id,
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
      ...(validated.isActive !== undefined && { is_active: validated.isActive }),

      // Geographic Criteria
      ...(validated.areaType && { area_type: validated.areaType }),
      ...(validated.zipCodes && { zip_codes: validated.zipCodes }),
      ...(validated.cities && { cities: validated.cities }),
      ...(validated.states && { states: validated.states }),

      // Alert Conditions (JSON)
      ...(validated.conditions && { conditions: validated.conditions }),

      // Delivery Settings
      ...(validated.frequency && { frequency: validated.frequency }),
      ...(validated.deliveryChannels && { delivery_channels: validated.deliveryChannels }),
      ...(validated.emailAddresses && { email_addresses: validated.emailAddresses }),
      ...(validated.webhookUrl !== undefined && { webhook_url: validated.webhookUrl }),

      // Priority & Tags
      ...(validated.priority && { priority: validated.priority }),
      ...(validated.tags && { tags: validated.tags }),

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

  // alert_triggers schema only has: id, alert_id, triggered_at, trigger_data, notification_sent
  const trigger = await prisma.alert_triggers.create({
    data: {
      alert_id: validated.alertId,
      triggered_at: new Date(),
      trigger_data: {
        triggeredBy: validated.triggeredBy,
        message: validated.message,
        severity: validated.severity,
        metadata: validated.metadata
      },
      notification_sent: false,
    }
  });

  // Update alert trigger count
  await prisma.property_alerts.update({
    where: { id: validated.alertId },
    data: {
      trigger_count: { increment: 1 },
      last_triggered_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/alerts');

  return trigger;
}

export async function markTriggerNotificationSent(triggerId: string) {
  const updated = await prisma.alert_triggers.update({
    where: { id: triggerId },
    data: {
      notification_sent: true,
    }
  });

  revalidatePath('/real-estate/reid/alerts');

  return updated;
}
