import { z } from 'zod';
import { ActionType } from '@prisma/client';

export const QuickActionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().min(1),
  actionType: z.nativeEnum(ActionType),
  targetUrl: z.string().url().optional(),
  apiEndpoint: z.string().optional(),
  formConfig: z.record(z.any()).optional(),
  color: z.string().default('blue'),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  requiredRole: z.array(z.string()).default([]),
  requiredTier: z.array(z.string()).default([]),
  organizationId: z.string().optional(), // null for system actions
});

export type QuickActionInput = z.infer<typeof QuickActionSchema>;
