import { z } from 'zod';

/**
 * Property Alert Input Schema
 * Based on property_alerts Prisma model
 */
export const PropertyAlertSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  alertType: z.enum([
    'PRICE_DROP',
    'PRICE_INCREASE',
    'NEW_LISTING',
    'SOLD',
    'INVENTORY_CHANGE',
    'MARKET_TREND',
    'DEMOGRAPHIC_CHANGE',
  ]),
  isActive: z.boolean().default(true),

  // Geographic Criteria
  areaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']).optional(),
  zipCodes: z.array(z.string()).default([]),
  cities: z.array(z.string()).default([]),
  states: z.array(z.string()).default([]),

  // Alert Conditions (stored as JSON)
  conditions: z.record(z.any()),

  // Delivery Settings
  frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  deliveryChannels: z.array(z.string()).default([]), // ['email', 'sms', 'webhook', 'in-app']
  emailAddresses: z.array(z.string().email()).default([]),
  webhookUrl: z.string().url().optional(),

  // Priority
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
});

export type PropertyAlertInput = z.infer<typeof PropertyAlertSchema>;

/**
 * Alert Trigger Input Schema
 * Based on alert_triggers Prisma model (stores data in JSON)
 */
export const AlertTriggerSchema = z.object({
  alertId: z.string().uuid(),
  triggeredBy: z.string().optional(), // User/system that triggered
  message: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type AlertTriggerInput = z.infer<typeof AlertTriggerSchema>;
