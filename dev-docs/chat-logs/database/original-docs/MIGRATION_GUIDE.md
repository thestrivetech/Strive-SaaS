# Database Configuration Migration Guide
**Strive Tech SaaS Platform - Step-by-Step Implementation**

**Last Updated:** October 1, 2025
**Version:** 1.0.0
**Estimated Time:** 4-6 hours

---

## Overview

This guide provides step-by-step instructions to fix all issues identified in the Database Audit Report and align the project with the Prisma + Supabase Hybrid Strategy.

**Prerequisites:**
- Access to Supabase dashboard
- Database backup completed
- Development environment running
- No production traffic (or use staging first)

---

## ⚠️ Pre-Migration Checklist

Before starting, verify:

- [ ] **Backup database:**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Git commit all changes:**
  ```bash
  git add .
  git commit -m "Pre-migration checkpoint"
  ```

- [ ] **Environment variables configured:**
  ```bash
  # Verify these exist in .env.local
  echo $DATABASE_URL
  echo $DIRECT_URL
  echo $NEXT_PUBLIC_SUPABASE_URL
  echo $SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **Dependencies installed:**
  ```bash
  npm install
  ```

- [ ] **Dev server not running:**
  ```bash
  # Stop if running
  pkill -f "next dev"
  ```

---

## Phase 1: Critical Fixes (P0 Issues)

### Step 1.1: Add Notification Model to Prisma Schema

**Time:** 15 minutes

#### 1.1.1 Update Schema

Edit `app/prisma/schema.prisma`:

```prisma
// Add this model after User model (around line 33)

model Notification {
  id             String       @id @default(uuid())
  userId         String       @map("user_id")
  organizationId String       @map("organization_id")
  type           String
  title          String
  message        String
  read           Boolean      @default(false)
  actionUrl      String?      @map("action_url")
  entityType     String?      @map("entity_type")
  entityId       String?      @map("entity_id")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([organizationId])
  @@index([read])
  @@map("notifications")
}
```

#### 1.1.2 Update User Model

Add this relation to the `User` model:

```prisma
model User {
  // ... existing fields ...
  notifications       Notification[]       // Add this line

  @@map("users")
}
```

#### 1.1.3 Update Organization Model

Add this relation to the `Organization` model:

```prisma
model Organization {
  // ... existing fields ...
  notifications      Notification[]        // Add this line

  @@map("organizations")
}
```

#### 1.1.4 Create Migration

```bash
cd app
npx prisma migrate dev --name add_notification_model
```

**Expected output:**
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

#### 1.1.5 Verify Migration

```bash
npx prisma studio
```

Navigate to the `notifications` table - it should exist but be empty.

**Test:**
```typescript
// Test in Node REPL or create test file
import { prisma } from './lib/prisma';

const testNotification = await prisma.notification.create({
  data: {
    userId: 'test-user-id',
    organizationId: 'test-org-id',
    type: 'INFO',
    title: 'Test Notification',
    message: 'Migration successful!',
  },
});

console.log('✅ Notification created:', testNotification.id);
```

---

### Step 1.2: Consolidate Duplicate Prisma Client Files

**Time:** 10 minutes

#### 1.2.1 Verify Duplicate Exists

```bash
# Check if both files exist
ls -la app/lib/prisma.ts
ls -la app/lib/database/prisma.ts
```

#### 1.2.2 Delete Duplicate

```bash
rm app/lib/database/prisma.ts
rmdir app/lib/database  # Only if empty
```

#### 1.2.3 Update Import Statements

Find all files importing from the deleted path:

```bash
cd app
grep -r "from '@/lib/database/prisma'" . --exclude-dir=node_modules
```

**Update these files:**

```typescript
// BEFORE (5 files)
import { prisma } from '@/lib/database/prisma';

// AFTER
import { prisma } from '@/lib/prisma';
```

**Files to update:**
- `lib/modules/notifications/queries.ts`
- `lib/modules/notifications/actions.ts`
- `lib/modules/attachments/actions.ts`

**Search command:**
```bash
# Automated fix (review changes before committing!)
find . -type f -name "*.ts" -not -path "./node_modules/*" \
  -exec sed -i '' "s/@\/lib\/database\/prisma/@\/lib\/prisma/g" {} +
```

#### 1.2.4 Verify No Broken Imports

```bash
npx tsc --noEmit
```

**Expected:** Zero errors

---

### Step 1.3: Fix Realtime Table Names

**Time:** 5 minutes

#### 1.3.1 Update Realtime Client

Edit `app/lib/realtime/client.ts`:

```typescript
// Line 32 - Task subscriptions
table: 'tasks',  // Changed from 'Task'

// Line 62 - Customer subscriptions
table: 'customers',  // Changed from 'Customer'

// Line 90 - Project subscriptions
table: 'projects',  // Changed from 'Project'

// Line 119 - Notification subscriptions
table: 'notifications',  // Changed from 'Notification'
```

**Full context for each change:**

```typescript
// BEFORE
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'Task',  // ❌ Wrong
  filter: `projectId=eq.${projectId}`,
})

// AFTER
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'tasks',  // ✅ Correct
  filter: `project_id=eq.${projectId}`,  // Also fix snake_case filter
})
```

**Also update filter fields to snake_case:**
- `projectId` → `project_id`
- `organizationId` → `organization_id`
- `userId` → `user_id`

#### 1.3.2 Test Realtime Subscriptions

Create test file: `scripts/test-realtime.ts`

```typescript
import { RealtimeClient } from '../lib/realtime/client';

async function testRealtime() {
  console.log('🧪 Testing Realtime Subscriptions...\n');

  const client = new RealtimeClient();

  // Test task subscription
  const unsubscribe = client.subscribeToTaskUpdates(
    'test-project-id',
    (payload) => {
      console.log('✅ Task update received:', payload.eventType);
    }
  );

  console.log('✅ Realtime client subscribed successfully');
  console.log('   Waiting 5 seconds for any events...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  unsubscribe();
  console.log('✅ Unsubscribed successfully');
}

testRealtime();
```

**Run test:**
```bash
npx tsx scripts/test-realtime.ts
```

---

## Phase 2: Security & Infrastructure (P1 Issues)

### Step 2.1: Implement Row Level Security

**Time:** 30 minutes

#### 2.1.1 Review RLS Policies

Read: `docs/database/RLS_POLICIES.md`

#### 2.1.2 Apply RLS Policies

**Option 1: Via psql**
```bash
psql $DATABASE_URL -f docs/database/RLS_POLICIES.sql
```

**Option 2: Via Supabase Dashboard**
1. Go to SQL Editor
2. Copy contents of `docs/database/RLS_POLICIES.md` (SQL section)
3. Execute

#### 2.1.3 Verify RLS Enabled

```sql
-- Run in Supabase SQL Editor or psql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'customers', 'projects', 'tasks', 'notifications')
ORDER BY tablename;
```

**Expected:** All tables show `rowsecurity = true`

#### 2.1.4 Test RLS Policies

```sql
-- Test as authenticated user
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "test-user-123"}';

-- Try to access data (should be filtered by organization)
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM projects;
```

---

### Step 2.2: Setup Supabase Storage Buckets

**Time:** 20 minutes

Follow instructions in: `docs/database/STORAGE_SETUP.md`

#### Summary:
1. Create buckets in Supabase Dashboard:
   - `attachments` (private)
   - `avatars` (public)
   - `public-assets` (public)

2. Apply storage policies (SQL in STORAGE_SETUP.md)

3. Test upload/download

**Verification:**
```bash
npx tsx scripts/test-storage-setup.ts
```

---

### Step 2.3: Remove Drizzle ORM

**Time:** 5 minutes

#### 2.3.1 Uninstall Packages

```bash
cd app
npm uninstall drizzle-orm drizzle-zod
```

#### 2.3.2 Verify Removal

```bash
npm ls drizzle-orm
# Should show: "extraneous" or not found
```

#### 2.3.3 Clean Lock File

```bash
rm package-lock.json
npm install
```

#### 2.3.4 Verify No Code Dependencies

```bash
# Search for any remaining Drizzle imports
grep -r "from 'drizzle-orm'" app/lib app/components --exclude-dir=node_modules

# Should only find content data files (data/resources/technology/drizzle-orm-database.ts)
# These are content ABOUT Drizzle, not using it
```

---

## Phase 3: Enhancements (P2 Issues)

### Step 3.1: Add Environment Variable Validation

**Time:** 20 minutes

#### 3.1.1 Create Validation Module

Create file: `app/lib/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgres'),
  DIRECT_URL: z.string().url().startsWith('postgres'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().startsWith('https'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),

  // AI
  GROQ_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  OPENROUTER_API_KEY: z.string().min(10).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Stripe (optional in development)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function validateEnv(): Env {
  if (env) return env;

  try {
    env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');
      error.issues.forEach(issue => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Validate immediately when imported
export const validatedEnv = validateEnv();
```

#### 3.1.2 Add to Root Layout

Edit `app/app/layout.tsx`:

```typescript
// Add at the top, before any other imports
import '@/lib/env';  // Validates env vars at startup

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ... rest of layout
}
```

#### 3.1.3 Test Validation

```bash
# Remove a required var temporarily
unset DATABASE_URL
npm run dev

# Should fail with clear error message:
# ❌ Environment variable validation failed:
#   - DATABASE_URL: Required
```

---

### Step 3.2: Improve Supabase Client Setup

**Time:** 30 minutes

#### 3.2.1 Create Browser Client Helper

Create file: `app/lib/supabase/client.ts`

```typescript
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo } from 'react';

export function useSupabaseClient() {
  return useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);
}
```

#### 3.2.2 Create Server Client Helper

Create file: `app/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// For service role (admin operations)
export function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
```

#### 3.2.3 Update Existing Usage

**Example in Server Component:**
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ... rest
}
```

**Example in Client Component:**
```typescript
'use client';
import { useSupabaseClient } from '@/lib/supabase/client';

export function Component() {
  const supabase = useSupabaseClient();
  // ... rest
}
```

---

### Step 3.3: Add Presence Tracking (Optional)

**Time:** 45 minutes

See `PRISMA-SUPABASE-STRATEGY.md` section on Presence for full implementation.

**Basic Implementation:**

```typescript
// lib/realtime/presence.ts
'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';

export function usePresence(channelName: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, userId, supabase]);

  return { onlineUsers };
}
```

---

## Post-Migration Verification

### Final Checklist

Run all tests:

```bash
cd app

# 1. TypeScript check
npx tsc --noEmit
# ✅ Expected: Zero errors

# 2. Linting
npm run lint
# ✅ Expected: Zero warnings

# 3. Build check
npm run build
# ✅ Expected: Successful build

# 4. Prisma check
npx prisma validate
# ✅ Expected: "The schema is valid"

# 5. Database migration status
npx prisma migrate status
# ✅ Expected: "Database schema is up to date"
```

### Manual Testing

1. **Notifications:**
   - [ ] Create notification
   - [ ] View unread count
   - [ ] Mark as read
   - [ ] Realtime subscription fires

2. **File Uploads:**
   - [ ] Upload to attachments bucket
   - [ ] Download with signed URL
   - [ ] Delete file
   - [ ] RLS prevents cross-org access

3. **Realtime:**
   - [ ] Create task → subscription fires
   - [ ] Update customer → subscription fires
   - [ ] Create notification → subscription fires

4. **Multi-tenancy:**
   - [ ] Login as User A → see only Org A data
   - [ ] Login as User B → see only Org B data
   - [ ] No cross-org data leakage

---

## Rollback Procedures

### If Issues Occur:

#### Rollback Database Migration

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or rollback Prisma migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

#### Rollback Code Changes

```bash
git log --oneline  # Find commit before migration
git reset --hard COMMIT_HASH
```

#### Disable RLS Temporarily

```sql
-- If RLS causing issues
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- Fix issues, then re-enable
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

---

## Success Metrics

Migration is complete when:

- ✅ All TypeScript compilation errors resolved
- ✅ Notification system functional end-to-end
- ✅ Single Prisma client, no duplicates
- ✅ Realtime subscriptions triggering correctly
- ✅ RLS policies deployed and tested
- ✅ Drizzle ORM removed
- ✅ Storage buckets configured
- ✅ Environment variables validated
- ✅ All automated tests passing
- ✅ Manual testing checklist completed

---

## Troubleshooting

### Common Issues:

**"Cannot find module '@/lib/database/prisma'"**
- Run find/replace: `@/lib/database/prisma` → `@/lib/prisma`

**"Table 'notifications' does not exist"**
- Run: `npx prisma migrate deploy`

**"Permission denied for table"**
- Check RLS policies are correct
- Verify user has organization membership

**"Realtime not firing"**
- Check table names are snake_case
- Verify Supabase Realtime is enabled in dashboard

---

## Next Steps

After successful migration:

1. **Deploy to Staging**
   - Test with production-like data
   - Verify RLS policies
   - Monitor performance

2. **Update Documentation**
   - Mark issues as resolved in audit report
   - Update README with new setup steps

3. **Monitor Production**
   - Watch error logs
   - Check query performance
   - Verify no cross-tenant data access

4. **Schedule Review**
   - Review RLS policies quarterly
   - Audit storage usage monthly
   - Update dependencies regularly

---

## Related Documentation

- [DATABASE_AUDIT_REPORT.md](./DATABASE_AUDIT_REPORT.md) - Issues identified
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Storage configuration
- [RLS_POLICIES.md](./RLS_POLICIES.md) - Security policies
- [PRISMA-SUPABASE-STRATEGY.md](./PRISMA-SUPABASE-STRATEGY.md) - Architecture guide

---

**Questions or Issues?** Reference the audit report or strategy documents above.
