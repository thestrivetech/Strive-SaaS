'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import {
  UpdateUserPreferencesSchema,
  type UpdateUserPreferencesInput
} from './schemas';

/**
 * Update user preferences (creates if doesn't exist)
 */
export async function updateUserPreferences(input: UpdateUserPreferencesInput) {
  const user = await requireAuth();

  const validated = UpdateUserPreferencesSchema.parse(input);

  const updated = await prisma.user_preferences.upsert({
    where: { user_id: user.id },
    create: {
      user_id: user.id,
      theme: validated.theme ?? 'dark',
      chart_type: validated.chartType ?? 'line',
      map_style: validated.mapStyle ?? 'dark',
      dashboard_layout: validated.dashboardLayout,
      default_area_type: validated.defaultAreaType,
      favorite_areas: validated.favoriteAreas ?? [],
      alert_preferences: validated.alertPreferences,
    },
    update: {
      ...(validated.theme && { theme: validated.theme }),
      ...(validated.chartType && { chart_type: validated.chartType }),
      ...(validated.mapStyle && { map_style: validated.mapStyle }),
      ...(validated.dashboardLayout !== undefined && { dashboard_layout: validated.dashboardLayout }),
      ...(validated.defaultAreaType && { default_area_type: validated.defaultAreaType }),
      ...(validated.favoriteAreas !== undefined && { favorite_areas: validated.favoriteAreas }),
      ...(validated.alertPreferences !== undefined && { alert_preferences: validated.alertPreferences }),
      updated_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/settings');

  return updated;
}
