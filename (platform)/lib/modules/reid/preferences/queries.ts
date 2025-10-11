'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * Get user preferences (creates default if none exist)
 */
export async function getUserPreferences() {
  const user = await requireAuth();

  let preferences = await prisma.user_preferences.findUnique({
    where: { user_id: user.id }
  });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await prisma.user_preferences.create({
      data: {
        user_id: user.id,
        theme: 'dark',
        chart_type: 'line',
        map_style: 'dark',
        dashboard_layout: {},
      }
    });
  }

  return preferences;
}
