import { z } from 'zod';

/**
 * User Preferences Input Schema
 * Based on user_preferences Prisma model
 */
export const UserPreferencesSchema = z.object({
  // Display Preferences
  theme: z.enum(['light', 'dark', 'auto']).default('dark'),
  chartType: z.enum(['line', 'bar', 'area', 'pie']).default('line'),
  mapStyle: z.enum(['light', 'dark', 'satellite', 'streets']).default('dark'),

  // Dashboard Layout (JSON)
  dashboardLayout: z.record(z.any()).optional(),

  // REID-specific preferences
  defaultAreaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']).optional(),
  favoriteAreas: z.array(z.string()).default([]),
  alertPreferences: z.record(z.any()).optional(),
});

export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;

/**
 * Update User Preferences Schema (all fields optional)
 */
export const UpdateUserPreferencesSchema = UserPreferencesSchema.partial();

export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
