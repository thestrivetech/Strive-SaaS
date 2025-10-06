import { z } from 'zod';
import {
  AdminAction,
  AlertLevel,
  AlertCategory,
  Environment,
  SubscriptionTier,
  UserRole
} from '@prisma/client';

// Admin Action Log
export const adminActionLogSchema = z.object({
  action: z.nativeEnum(AdminAction),
  description: z.string().min(1).max(500),
  targetType: z.enum(['user', 'organization', 'subscription', 'feature_flag', 'system_alert']),
  targetId: z.string().cuid(),
  metadata: z.record(z.any()).optional(),
});

export type AdminActionLogInput = z.infer<typeof adminActionLogSchema>;

// Feature Flag
export const createFeatureFlagSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, 'Must be lowercase with hyphens/underscores'),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercent: z.number().min(0).max(100).default(0),
  targetTiers: z.array(z.nativeEnum(SubscriptionTier)).default([]),
  targetOrgs: z.array(z.string().uuid()).default([]),
  targetUsers: z.array(z.string().uuid()).default([]),
  environment: z.nativeEnum(Environment).default('PRODUCTION'),
  category: z.string().max(50).optional(),
});

export const updateFeatureFlagSchema = createFeatureFlagSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;

// System Alert
export const createSystemAlertSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  level: z.nativeEnum(AlertLevel).default('INFO'),
  category: z.nativeEnum(AlertCategory),
  isGlobal: z.boolean().default(false),
  targetRoles: z.array(z.nativeEnum(UserRole)).default([]),
  targetTiers: z.array(z.nativeEnum(SubscriptionTier)).default([]),
  targetOrgs: z.array(z.string().uuid()).default([]),
  isDismissible: z.boolean().default(true),
  autoHideAfter: z.number().int().positive().optional(),
  startsAt: z.coerce.date().default(() => new Date()),
  endsAt: z.coerce.date().optional(),
});

export const updateSystemAlertSchema = createSystemAlertSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateSystemAlertInput = z.infer<typeof createSystemAlertSchema>;
export type UpdateSystemAlertInput = z.infer<typeof updateSystemAlertSchema>;

// User Management (for admin operations)
export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  suspendUntil: z.coerce.date().optional(),
});

export const impersonateUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type ImpersonateUserInput = z.infer<typeof impersonateUserSchema>;
