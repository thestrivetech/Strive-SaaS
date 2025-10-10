'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function updateUserPreferences(input: Partial<UserPreferenceInput>) {
  const user = await requireAuth();

  const validated = UserPreferenceSchema.partial().parse(input);

  const updated = await prisma.user_preferences.upsert({
    where: { user_id: user.id },
    create: {
      user_id: user.id,
      default_area_codes: validated.defaultAreaCodes || [],
      dashboard_layout: validated.dashboardLayout,
      theme: validated.theme || 'dark',
      chart_type: validated.chartType || 'line',
      map_style: validated.mapStyle || 'dark',
      email_digest: validated.emailDigest ?? true,
      sms_alerts: validated.smsAlerts ?? false,
      digest_frequency: validated.digestFrequency || 'weekly',
      price_format: validated.priceFormat || 'USD',
      area_unit: validated.areaUnit || 'sqft',
      date_format: validated.dateFormat || 'MM/DD/YYYY',
    },
    update: {
      ...(validated.defaultAreaCodes !== undefined && { default_area_codes: validated.defaultAreaCodes }),
      ...(validated.dashboardLayout !== undefined && { dashboard_layout: validated.dashboardLayout }),
      ...(validated.theme && { theme: validated.theme }),
      ...(validated.chartType && { chart_type: validated.chartType }),
      ...(validated.mapStyle && { map_style: validated.mapStyle }),
      ...(validated.emailDigest !== undefined && { email_digest: validated.emailDigest }),
      ...(validated.smsAlerts !== undefined && { sms_alerts: validated.smsAlerts }),
      ...(validated.digestFrequency && { digest_frequency: validated.digestFrequency }),
      ...(validated.priceFormat && { price_format: validated.priceFormat }),
      ...(validated.areaUnit && { area_unit: validated.areaUnit }),
      ...(validated.dateFormat && { date_format: validated.dateFormat }),
      updated_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/settings');

  return updated;
}
