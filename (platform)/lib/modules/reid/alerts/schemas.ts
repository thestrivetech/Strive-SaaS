import { z } from 'zod';
import { AlertType, AlertFrequency, AlertSeverity } from '@prisma/client';

export const PropertyAlertSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  alertType: z.nativeEnum(AlertType),
  criteria: z.any(), // JSON criteria
  areaCodes: z.array(z.string()),
  radius: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  frequency: z.nativeEnum(AlertFrequency),
  isActive: z.boolean().default(true),
  organizationId: z.string().uuid(),
});

export const AlertTriggerSchema = z.object({
  alertId: z.string().uuid(),
  triggeredBy: z.any(), // JSON data
  message: z.string().min(1),
  severity: z.nativeEnum(AlertSeverity),
});

export type PropertyAlertInput = z.infer<typeof PropertyAlertSchema>;
export type AlertTriggerInput = z.infer<typeof AlertTriggerSchema>;
