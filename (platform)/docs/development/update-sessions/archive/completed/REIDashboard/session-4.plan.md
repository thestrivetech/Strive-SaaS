# Session 4: User Preferences & Dashboard Customization

## Session Overview
**Goal:** Implement user preferences system for REID Dashboard allowing customization of layout, themes, and data display options.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 3 (Reports module complete)

## Objectives

1. ✅ Create Preferences module (lib/modules/reid/preferences/)
2. ✅ Implement user preference CRUD operations
3. ✅ Add dashboard layout customization
4. ✅ Create theme preference management
5. ✅ Implement notification preferences
6. ✅ Add data format preferences (currency, units, dates)

## Prerequisites

- [x] Session 3 completed
- [x] user_preferences table exists in database
- [x] Understanding of user-specific (non-org) data patterns

## Implementation Steps

### Step 1: Create Preferences Schemas

#### File: `lib/modules/reid/preferences/schemas.ts`
```typescript
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
```

### Step 2: Create Preferences Queries

#### File: `lib/modules/reid/preferences/queries.ts`
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getUserPreferences() {
  const session = await requireAuth();

  let preferences = await prisma.user_preferences.findUnique({
    where: { user_id: session.user.id }
  });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await prisma.user_preferences.create({
      data: {
        user_id: session.user.id,
        theme: 'dark',
        chart_type: 'line',
        map_style: 'dark',
      }
    });
  }

  return preferences;
}
```

### Step 3: Create Preferences Actions

#### File: `lib/modules/reid/preferences/actions.ts`
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { UserPreferenceSchema } from './schemas';
import type { UserPreferenceInput } from './schemas';

export async function updateUserPreferences(input: Partial<UserPreferenceInput>) {
  const session = await requireAuth();

  const validated = UserPreferenceSchema.partial().parse(input);

  const updated = await prisma.user_preferences.upsert({
    where: { user_id: session.user.id },
    create: {
      user_id: session.user.id,
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

  revalidatePath('/real-estate/reid/dashboard');
  revalidatePath('/real-estate/reid/settings');

  return updated;
}
```

### Step 4: Create Module Exports

#### File: `lib/modules/reid/preferences/index.ts`
```typescript
export { updateUserPreferences } from './actions';
export { getUserPreferences } from './queries';
export { UserPreferenceSchema } from './schemas';
export type { UserPreferenceInput } from './schemas';
```

### Step 5: Update Module Root

#### File: `lib/modules/reid/index.ts`
```typescript
// Insights
export * from './insights';

// Alerts
export * from './alerts';

// Reports
export * from './reports';

// Preferences
export * from './preferences';

// AI (Session 6)
// export * from './ai';
```

## Testing & Validation

### Test: User Preferences
```typescript
import { updateUserPreferences, getUserPreferences } from '@/lib/modules/reid/preferences';

describe('User Preferences', () => {
  it('creates default preferences for new users', async () => {
    const prefs = await getUserPreferences();
    expect(prefs.theme).toBe('dark');
  });

  it('updates user preferences', async () => {
    await updateUserPreferences({
      theme: 'light',
      chartType: 'bar'
    });

    const prefs = await getUserPreferences();
    expect(prefs.theme).toBe('light');
    expect(prefs.chart_type).toBe('bar');
  });
});
```

## Success Criteria

- [x] Preferences module created
- [x] User preference CRUD operations
- [x] Default preferences auto-created
- [x] Theme customization working
- [x] Dashboard layout persistence
- [x] Notification preferences functional
- [x] Data format preferences implemented

## Files Created

- ✅ `lib/modules/reid/preferences/schemas.ts`
- ✅ `lib/modules/reid/preferences/queries.ts`
- ✅ `lib/modules/reid/preferences/actions.ts`
- ✅ `lib/modules/reid/preferences/index.ts`

## Files Modified

- ✅ `lib/modules/reid/index.ts`

## Next Steps

1. ✅ Proceed to **Session 5: Dark Theme UI Components**
2. ✅ Preferences system ready
3. ✅ Can implement theme-aware UI components

---

**Session 4 Complete:** ✅ User preferences and customization implemented
