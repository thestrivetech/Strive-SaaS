# Session 2 Plan: Database Configuration Implementation

**Date:** To Be Scheduled
**Estimated Duration:** 4-6 hours
**Status:** 📋 Planned
**Prerequisites:** Session 1 audit and documentation complete

---

## 📋 Session Overview

### Purpose
Implement all fixes identified in the Database Audit Report (Session 1) to bring the database configuration from **🟡 Fair (65/100)** to **🟢 Excellent (90/100)**.

### Approach
Execute fixes in 3 phases following the MIGRATION_GUIDE.md:
1. **Phase 1:** Critical fixes (P0 issues)
2. **Phase 2:** Security & infrastructure (P1 issues)
3. **Phase 3:** Enhancements (P2 issues)

### Pre-Session Requirements

**Before starting Session 2, verify:**

- [ ] **Session 1 documentation reviewed and approved**
  - DATABASE_AUDIT_REPORT.md
  - MIGRATION_GUIDE.md
  - STORAGE_SETUP.md
  - RLS_POLICIES.md

- [ ] **Database backup completed**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Git repository clean**
  ```bash
  git status  # Should show clean working directory
  git add .
  git commit -m "Pre-implementation checkpoint - Session 2"
  ```

- [ ] **Environment verified**
  ```bash
  cd app
  echo $DATABASE_URL
  echo $NEXT_PUBLIC_SUPABASE_URL
  echo $SUPABASE_SERVICE_ROLE_KEY
  npm install  # Ensure all dependencies installed
  ```

- [ ] **Dev server NOT running**
  ```bash
  pkill -f "next dev"
  ```

---

## 🎯 Session 2 Todo List

### Phase 1: Critical Fixes (P0 - ~2 hours)

#### Task 1.1: Add Notification Model to Prisma Schema
**Priority:** 🔴 P0 - Blocker
**Time:** 30 minutes
**Reference:** MIGRATION_GUIDE.md Step 1.1

**Steps:**
1. [ ] Edit `app/prisma/schema.prisma`
   - Add Notification model after User model (~line 33)
   - Add `notifications Notification[]` relation to User model
   - Add `notifications Notification[]` relation to Organization model

2. [ ] Create and run migration
   ```bash
   cd app
   npx prisma migrate dev --name add_notification_model
   npx prisma generate
   ```

3. [ ] Verify migration
   ```bash
   npx prisma studio  # Check notifications table exists
   ```

4. [ ] Test notification creation
   ```typescript
   // Test in Node REPL or test file
   import { prisma } from './lib/prisma';

   const test = await prisma.notification.create({
     data: {
       userId: 'test-user-id',
       organizationId: 'test-org-id',
       type: 'INFO',
       title: 'Test',
       message: 'Migration successful!'
     }
   });
   console.log('✅ Created:', test.id);
   ```

**Success Criteria:**
- [ ] Prisma schema includes Notification model
- [ ] Migration applied successfully
- [ ] Table visible in Prisma Studio
- [ ] Test notification can be created
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

#### Task 1.2: Consolidate Duplicate Prisma Client Files
**Priority:** 🔴 P0 - Architectural Issue
**Time:** 15 minutes
**Reference:** MIGRATION_GUIDE.md Step 1.2

**Steps:**
1. [ ] Verify duplicate exists
   ```bash
   ls -la app/lib/prisma.ts
   ls -la app/lib/database/prisma.ts
   ```

2. [ ] Delete duplicate file
   ```bash
   rm app/lib/database/prisma.ts
   rmdir app/lib/database  # If directory is empty
   ```

3. [ ] Find files with incorrect imports
   ```bash
   cd app
   grep -r "from '@/lib/database/prisma'" . --exclude-dir=node_modules
   ```

4. [ ] Update import statements (automated)
   ```bash
   find . -type f -name "*.ts" -not -path "./node_modules/*" \
     -exec sed -i '' "s/@\/lib\/database\/prisma/@\/lib\/prisma/g" {} +
   ```

5. [ ] Manual verification of changed files:
   - [ ] `lib/modules/notifications/queries.ts`
   - [ ] `lib/modules/notifications/actions.ts`
   - [ ] `lib/modules/attachments/actions.ts`

6. [ ] Verify no broken imports
   ```bash
   npx tsc --noEmit
   # Should show zero errors
   ```

**Success Criteria:**
- [ ] Only one Prisma client file exists (`lib/prisma.ts`)
- [ ] All imports use `@/lib/prisma`
- [ ] Zero TypeScript errors
- [ ] All files compile successfully

---

#### Task 1.3: Fix Realtime Table Names
**Priority:** 🟠 P1 - Functionality Broken
**Time:** 15 minutes
**Reference:** MIGRATION_GUIDE.md Step 1.3

**Steps:**
1. [ ] Edit `app/lib/realtime/client.ts`

2. [ ] Update line ~32 (Task subscriptions)
   ```typescript
   // BEFORE
   table: 'Task',
   filter: `projectId=eq.${projectId}`,

   // AFTER
   table: 'tasks',
   filter: `project_id=eq.${projectId}`,
   ```

3. [ ] Update line ~62 (Customer subscriptions)
   ```typescript
   // BEFORE
   table: 'Customer',
   filter: `organizationId=eq.${organizationId}`,

   // AFTER
   table: 'customers',
   filter: `organization_id=eq.${organizationId}`,
   ```

4. [ ] Update line ~90 (Project subscriptions)
   ```typescript
   // BEFORE
   table: 'Project',
   filter: `organizationId=eq.${organizationId}`,

   // AFTER
   table: 'projects',
   filter: `organization_id=eq.${organizationId}`,
   ```

5. [ ] Update line ~119 (Notification subscriptions)
   ```typescript
   // BEFORE
   table: 'Notification',
   filter: `userId=eq.${userId}`,

   // AFTER
   table: 'notifications',
   filter: `user_id=eq.${userId}`,
   ```

6. [ ] Create test script `scripts/test-realtime.ts`
   ```typescript
   import { RealtimeClient } from '../lib/realtime/client';

   async function test() {
     console.log('🧪 Testing Realtime...\n');
     const client = new RealtimeClient();

     const unsub = client.subscribeToTaskUpdates(
       'test-project-id',
       (payload) => console.log('✅ Event:', payload.eventType)
     );

     await new Promise(r => setTimeout(r, 5000));
     unsub();
     console.log('✅ Complete');
   }
   test();
   ```

7. [ ] Run test
   ```bash
   npx tsx scripts/test-realtime.ts
   ```

**Success Criteria:**
- [ ] All table names use snake_case
- [ ] All filter fields use snake_case
- [ ] Test script runs without errors
- [ ] Realtime client subscribes successfully

---

#### Task 1.4: Remove Drizzle ORM
**Priority:** 🟡 P2 - Architecture Violation
**Time:** 10 minutes
**Reference:** MIGRATION_GUIDE.md Step 2.3

**Steps:**
1. [ ] Uninstall packages
   ```bash
   cd app
   npm uninstall drizzle-orm drizzle-zod
   ```

2. [ ] Verify removal
   ```bash
   npm ls drizzle-orm
   # Should show "extraneous" or not found
   ```

3. [ ] Clean lock file
   ```bash
   rm package-lock.json
   npm install
   ```

4. [ ] Search for code dependencies
   ```bash
   grep -r "from 'drizzle-orm'" app/lib app/components --exclude-dir=node_modules
   # Should only find content files (data/resources/technology/)
   ```

5. [ ] Verify build works
   ```bash
   npm run build
   # Should complete successfully
   ```

**Success Criteria:**
- [ ] Drizzle packages removed from package.json
- [ ] No code imports from drizzle-orm
- [ ] Build succeeds
- [ ] Bundle size reduced

---

### Phase 1 Checkpoint

**After completing all Phase 1 tasks:**

```bash
# Run full verification
cd app

# 1. TypeScript
npx tsc --noEmit
# ✅ Expected: Zero errors

# 2. Linting
npm run lint
# ✅ Expected: Zero warnings

# 3. Prisma validation
npx prisma validate
# ✅ Expected: "The schema is valid"

# 4. Test suite
npm test
# ✅ Expected: All tests pass

# 5. Dev server
npm run dev
# ✅ Expected: Starts without errors
```

**If all checks pass:** Proceed to Phase 2
**If any fail:** Review MIGRATION_GUIDE.md Troubleshooting section

---

### Phase 2: Security & Infrastructure (P1 - ~3 hours)

#### Task 2.1: Implement Row Level Security Policies
**Priority:** 🟠 P1 - Security Risk
**Time:** 45 minutes
**Reference:** MIGRATION_GUIDE.md Step 2.1, RLS_POLICIES.md

**Steps:**
1. [ ] Review RLS_POLICIES.md completely
   - Understand policy structure
   - Review helper functions
   - Check policies for each table

2. [ ] Copy SQL from RLS_POLICIES.md

3. [ ] Apply via Supabase Dashboard
   - Navigate to SQL Editor
   - Paste complete SQL
   - Execute

   **OR via psql:**
   ```bash
   psql $DATABASE_URL -f docs/database/RLS_POLICIES.sql
   ```

4. [ ] Verify RLS enabled
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN (
     'users', 'customers', 'projects', 'tasks',
     'notifications', 'attachments', 'ai_conversations'
   );
   -- All should show rowsecurity = true
   ```

5. [ ] Test policies
   ```sql
   -- Test as authenticated user
   SET LOCAL role authenticated;
   SET LOCAL "request.jwt.claims" = '{"sub": "test-user-123"}';

   -- Should return filtered data
   SELECT COUNT(*) FROM customers;
   SELECT COUNT(*) FROM projects;
   ```

6. [ ] Verify policy counts
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies
   WHERE schemaname = 'public'
   GROUP BY tablename
   ORDER BY tablename;
   -- Each table should have multiple policies
   ```

**Success Criteria:**
- [ ] RLS enabled on all tables
- [ ] All helper functions created
- [ ] Policies exist for each table
- [ ] Test queries return filtered results
- [ ] No "permission denied" errors in application

---

#### Task 2.2: Setup Supabase Storage Buckets
**Priority:** 🟡 P2 - Infrastructure
**Time:** 30 minutes
**Reference:** MIGRATION_GUIDE.md Step 2.2, STORAGE_SETUP.md

**Steps:**
1. [ ] Create buckets in Supabase Dashboard
   - Navigate to Storage section
   - Create `attachments` bucket (private, 50MB limit)
   - Create `avatars` bucket (public, 5MB limit)
   - Create `public-assets` bucket (public, 10MB limit)

2. [ ] Apply storage policies
   - Copy SQL from STORAGE_SETUP.md (Storage Policies section)
   - Execute in SQL Editor

3. [ ] Verify buckets exist
   ```sql
   SELECT * FROM storage.buckets;
   -- Should show all 3 buckets
   ```

4. [ ] Create test script `scripts/test-storage-setup.ts`
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );

   async function test() {
     const { data: buckets, error } = await supabase.storage.listBuckets();

     if (error) {
       console.error('❌ Error:', error);
       return;
     }

     const required = ['attachments', 'avatars', 'public-assets'];
     const found = buckets.map(b => b.name);

     required.forEach(name => {
       console.log(found.includes(name) ? `✅ ${name}` : `❌ ${name} missing`);
     });
   }
   test();
   ```

5. [ ] Run test
   ```bash
   npx tsx scripts/test-storage-setup.ts
   ```

**Success Criteria:**
- [ ] All 3 buckets created
- [ ] Storage policies applied
- [ ] Test script shows all buckets present
- [ ] Bucket access works (test upload/download)

---

#### Task 2.3: Add Environment Variable Validation
**Priority:** 🟡 P2 - Developer Experience
**Time:** 30 minutes
**Reference:** MIGRATION_GUIDE.md Step 3.1

**Steps:**
1. [ ] Create `app/lib/env.ts`
   ```typescript
   import { z } from 'zod';

   const envSchema = z.object({
     // Database
     DATABASE_URL: z.string().url().startsWith('postgres'),
     DIRECT_URL: z.string().url().startsWith('postgres'),

     // Supabase
     NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
     NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
     SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),

     // AI (optional)
     GROQ_API_KEY: z.string().min(10).optional(),
     OPENAI_API_KEY: z.string().min(10).optional(),

     // App
     NEXT_PUBLIC_APP_URL: z.string().url(),
     NODE_ENV: z.enum(['development', 'production', 'test']),
   });

   export type Env = z.infer<typeof envSchema>;

   export function validateEnv(): Env {
     try {
       const env = envSchema.parse(process.env);
       console.log('✅ Environment variables validated');
       return env;
     } catch (error) {
       if (error instanceof z.ZodError) {
         console.error('❌ Environment validation failed:\n');
         error.issues.forEach(issue => {
           console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
         });
         process.exit(1);
       }
       throw error;
     }
   }

   export const validatedEnv = validateEnv();
   ```

2. [ ] Import in root layout
   - Edit `app/app/layout.tsx`
   - Add `import '@/lib/env';` at the top

3. [ ] Test validation
   ```bash
   # Temporarily remove a required var
   unset DATABASE_URL
   npm run dev
   # Should fail with clear error message

   # Restore var
   export DATABASE_URL="your-database-url"
   npm run dev
   # Should start successfully
   ```

**Success Criteria:**
- [ ] `lib/env.ts` created
- [ ] Imported in root layout
- [ ] Missing vars cause immediate failure
- [ ] Clear error messages shown
- [ ] Dev server starts with valid env

---

### Phase 2 Checkpoint

**After completing all Phase 2 tasks:**

```bash
# Manual testing
cd app

# 1. Test notifications
# - Create notification via API
# - Check appears in database
# - Verify realtime subscription fires

# 2. Test file upload
# - Upload file to attachments bucket
# - Verify file appears in Supabase Storage
# - Generate signed URL
# - Download file

# 3. Test RLS
# - Login as User A
# - Verify only sees Org A data
# - Login as User B
# - Verify only sees Org B data
# - No cross-org leakage

# 4. Test environment validation
# - Remove required var
# - App fails immediately
# - Restore var
# - App starts successfully
```

**If all tests pass:** Proceed to Phase 3 (or stop here if satisfied)
**If any fail:** Review troubleshooting sections

---

### Phase 3: Enhancements (P2 - ~2 hours)

#### Task 3.1: Improve Supabase Client Setup
**Priority:** 🟢 P3 - Enhancement
**Time:** 45 minutes
**Reference:** MIGRATION_GUIDE.md Step 3.2

**Steps:**
1. [ ] Create `app/lib/supabase/client.ts` (browser client)
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

2. [ ] Create `app/lib/supabase/server.ts` (server client)
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

3. [ ] Update existing usage examples
   - Find 2-3 files using old pattern
   - Update to use new utilities

4. [ ] Document usage in code comments

**Success Criteria:**
- [ ] New client utilities created
- [ ] Example usage documented
- [ ] Cleaner, more consistent pattern
- [ ] All existing functionality still works

---

#### Task 3.2: Add Presence Tracking (Optional)
**Priority:** 🟢 P3 - Nice to Have
**Time:** 60 minutes
**Reference:** PRISMA-SUPABASE-STRATEGY.md Presence section

**Steps:**
1. [ ] Create `app/lib/realtime/presence.ts`
   ```typescript
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
           setOnlineUsers(Object.values(state).flat());
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

2. [ ] Create example component
3. [ ] Test in development
4. [ ] Document usage

**Success Criteria:**
- [ ] Presence hook created
- [ ] Example component works
- [ ] Shows online users in real-time
- [ ] Cleans up on unmount

---

### Phase 3 Checkpoint

**After completing Phase 3:**

```bash
# Final verification
cd app

# 1. Full build
npm run build
# ✅ Should complete successfully

# 2. Type checking
npx tsc --noEmit
# ✅ Zero errors

# 3. Linting
npm run lint
# ✅ Zero warnings

# 4. Test suite
npm test
# ✅ All pass, 80%+ coverage

# 5. Prisma check
npx prisma validate
npx prisma migrate status
# ✅ All valid and up to date
```

---

## 🎯 Session 2 Success Criteria

Session complete when ALL of the following are true:

### Code Quality
- [ ] TypeScript compiles with zero errors
- [ ] ESLint shows zero warnings
- [ ] All tests pass with 80%+ coverage
- [ ] Build completes successfully

### Database
- [ ] Notification model exists in schema
- [ ] Migration applied successfully
- [ ] RLS policies deployed on all tables
- [ ] Storage buckets configured

### Architecture
- [ ] Single Prisma client file (no duplicates)
- [ ] Drizzle ORM removed from dependencies
- [ ] Realtime table names correct (snake_case)
- [ ] Environment validation at startup

### Functionality
- [ ] Notifications can be created/read/updated
- [ ] Realtime subscriptions fire correctly
- [ ] File uploads work to all buckets
- [ ] RLS prevents cross-org data access

### Documentation
- [ ] Implementation notes documented
- [ ] Any issues encountered documented
- [ ] Session 2 summary created

**Target Health Score:** 🟢 90/100 (Excellent)

---

## 📊 Progress Tracking

### Phase 1: Critical Fixes
- [ ] Task 1.1: Add Notification Model (30 min)
- [ ] Task 1.2: Consolidate Prisma Clients (15 min)
- [ ] Task 1.3: Fix Realtime Table Names (15 min)
- [ ] Task 1.4: Remove Drizzle ORM (10 min)
- [ ] Phase 1 Checkpoint passed

**Estimated:** 70 minutes | **Actual:** ___ minutes

### Phase 2: Security & Infrastructure
- [ ] Task 2.1: Implement RLS Policies (45 min)
- [ ] Task 2.2: Setup Storage Buckets (30 min)
- [ ] Task 2.3: Add Env Validation (30 min)
- [ ] Phase 2 Checkpoint passed

**Estimated:** 105 minutes | **Actual:** ___ minutes

### Phase 3: Enhancements
- [ ] Task 3.1: Improve Supabase Clients (45 min)
- [ ] Task 3.2: Add Presence Tracking (60 min) [Optional]
- [ ] Phase 3 Checkpoint passed

**Estimated:** 105 minutes | **Actual:** ___ minutes

**Total Estimated:** 280 minutes (4.7 hours)
**Total Actual:** ___ minutes

---

## 🔄 Rollback Plan

If critical issues arise during implementation:

### Emergency Rollback
```bash
# 1. Restore database
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# 2. Restore code
git log --oneline
git reset --hard [COMMIT_BEFORE_SESSION_2]

# 3. Restore dependencies
npm install

# 4. Verify
npm run dev
```

### Partial Rollback

**Phase 1 Issues:**
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back [MIGRATION_NAME]
```

**Phase 2 Issues:**
```sql
-- Disable RLS temporarily
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
```

**Phase 3 Issues:**
- Simply don't deploy changes (enhancements are optional)

---

## 📝 Notes Section

### Implementation Notes
_(To be filled during session)_

**Challenges encountered:**
-

**Unexpected issues:**
-

**Solutions found:**
-

**Performance observations:**
-

### Testing Results
_(To be filled during session)_

**Phase 1 tests:**
-

**Phase 2 tests:**
-

**Phase 3 tests:**
-

### Time Tracking
_(To be filled during session)_

| Phase | Task | Estimated | Actual | Notes |
|-------|------|-----------|--------|-------|
| 1 | Notification Model | 30 min | ___ | |
| 1 | Consolidate Prisma | 15 min | ___ | |
| 1 | Fix Realtime | 15 min | ___ | |
| 1 | Remove Drizzle | 10 min | ___ | |
| 2 | RLS Policies | 45 min | ___ | |
| 2 | Storage Buckets | 30 min | ___ | |
| 2 | Env Validation | 30 min | ___ | |
| 3 | Supabase Clients | 45 min | ___ | |
| 3 | Presence Tracking | 60 min | ___ | |
| **Total** | | **280 min** | ___ | |

---

## 🔗 Quick Reference

**Documentation:**
- [DATABASE_AUDIT_REPORT.md](../DATABASE_AUDIT_REPORT.md)
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)
- [STORAGE_SETUP.md](../STORAGE_SETUP.md)
- [RLS_POLICIES.md](../RLS_POLICIES.md)
- [PRISMA-SUPABASE-STRATEGY.md](../PRISMA-SUPABASE-STRATEGY.md)

**Previous Session:**
- [session1_summary.md](./session1_summary.md)

**Commands:**
```bash
# Pre-flight
cd app
git status
pg_dump $DATABASE_URL > backup.sql

# Development
npm run dev
npx prisma studio

# Verification
npx tsc --noEmit
npm run lint
npm test
npm run build

# Database
npx prisma migrate dev
npx prisma generate
npx prisma validate
```

---

**Session Status:** 📋 **PLANNED**
**Ready to Execute:** After pre-session requirements met
**Expected Outcome:** 🟢 Health Score 90/100

---

*Created: October 1, 2025 | For: Session 2 Implementation*
