import { z } from 'zod';

export const UserPreferenceSchema = z.object({
  userId: z.string().uuid(),
  defaultAreaCodes: z.array(z.string()).default([]),
  dashboardLayout: z.any().optional(), // JSON layout config
  theme: z.enum(['dark', 'light']).default('dark'),
  chartType: z.enum(['line', 'bar', 'area']).default('line'),
  mapStyle: z.enum(['dark', 'light', 'satellite']).default('dark'),
  emailDigest: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  digestFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  priceFormat: z.string().default('USD'),
  areaUnit: z.enum(['sqft', 'sqm']).default('sqft'),
  dateFormat: z.string().default('MM/DD/YYYY'),
});

export type UserPreferenceInput = z.infer<typeof UserPreferenceSchema>;
