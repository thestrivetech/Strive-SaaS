import { z } from 'zod';
import { DashboardActivityType, DashboardActivitySeverity } from '@prisma/client';

export const ActivityFeedSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(DashboardActivityType),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  action: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  severity: z.nativeEnum(DashboardActivitySeverity).default('INFO'),
  userId: z.string().optional(),
});

export type ActivityFeedInput = z.infer<typeof ActivityFeedSchema>;
