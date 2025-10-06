import { z } from 'zod';
import { MetricCategory } from '@prisma/client';

export const DashboardMetricSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.nativeEnum(MetricCategory),
  query: z.any(),
  unit: z.string().optional(),
  format: z.enum(['number', 'currency', 'percentage']).default('number'),
  targetValue: z.number().optional(),
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  chartType: z.string().optional(),
  color: z.string().default('blue'),
  icon: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  refreshRate: z.number().int().min(60).default(300),
  organizationId: z.string().optional(), // null for system metrics
});

export type DashboardMetricInput = z.infer<typeof DashboardMetricSchema>;

export const UpdateMetricSchema = DashboardMetricSchema.partial().extend({
  id: z.string(),
});
