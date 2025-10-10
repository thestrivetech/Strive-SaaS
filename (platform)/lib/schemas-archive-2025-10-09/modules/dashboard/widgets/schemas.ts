import { z } from 'zod';
import { WidgetType } from '@prisma/client';

export const DashboardWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(WidgetType),
  config: z.record(z.any()),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    w: z.number().int().min(1),
    h: z.number().int().min(1),
  }),
  dataSource: z.string().optional(),
  refreshRate: z.number().int().min(60).default(300),
  isVisible: z.boolean().default(true),
  title: z.string().optional(),
  chartType: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export type DashboardWidgetInput = z.infer<typeof DashboardWidgetSchema>;

export const UpdateWidgetSchema = DashboardWidgetSchema.partial().extend({
  id: z.string(),
});
