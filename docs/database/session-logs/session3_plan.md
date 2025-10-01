# Session 3 Plan: Manual Steps & Final Verification

**Date:** To Be Scheduled
**Estimated Duration:** 1-2 hours
**Status:** 📋 Planned
**Prerequisites:** Session 2 automated tasks complete

---

## 📋 Session Overview

### Purpose
Complete the remaining manual tasks from Session 2 and verify that all database configuration improvements are working correctly end-to-end.

### Current Status
- **Health Score:** 🟢 85/100 (automated tasks complete)
- **Target:** 🟢 95/100 (after manual steps)
- **Remaining:** 2 manual tasks + verification

### What Session 2 Accomplished
✅ Notification model added
✅ Duplicate Prisma clients consolidated
✅ Realtime table names fixed
✅ Drizzle ORM removed
✅ Environment validation added
✅ Supabase client utilities improved
⚠️ RLS policies SQL file created (not deployed)
⚠️ Storage bucket guide created (not setup)

---

## 🎯 Session 3 Task List

### Task 1: Deploy RLS Policies (15 minutes)
**Priority:** 🔴 Critical - Security
**Status:** Ready to execute

**Steps:**
1. [ ] Open Supabase Dashboard
2. [ ] Navigate to SQL Editor
3. [ ] Open file: `app/prisma/migrations/add_rls_policies.sql`
4. [ ] Copy entire contents
5. [ ] Paste into SQL Editor
6. [ ] Execute SQL

**Verification:**
```sql
-- 1. Verify RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'organizations', 'organization_members', 'customers',
  'projects', 'tasks', 'ai_conversations', 'notifications',
  'attachments', 'subscriptions', 'usage_tracking',
  'activity_logs', 'conversations', 'appointments', 'content',
  'ai_tools', 'example_conversations'
)
ORDER BY tablename;
-- Expected: All should show rowsecurity = true

-- 2. Verify policies created
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected: Multiple policies per table (60+ total)

-- 3. Verify helper functions exist
SELECT proname
FROM pg_proc
WHERE proname IN ('current_user_org', 'is_admin', 'is_org_owner');
-- Expected: 3 functions
```

**Success Criteria:**
- [ ] RLS enabled on all 17 tables
- [ ] 60+ policies created
- [ ] 3 helper functions exist
- [ ] No SQL errors

**Alternative (Command Line):**
```bash
psql $DATABASE_URL -f app/prisma/migrations/add_rls_policies.sql
```

---

### Task 2: Setup Supabase Storage Buckets (10 minutes)
**Priority:** 🟡 Medium - Infrastructure
**Status:** Guide ready

**Steps:**
1. [ ] Open Supabase Dashboard → Storage
2. [ ] Create `attachments` bucket:
   - Name: `attachments`
   - Public: No (private)
   - File size limit: 52428800 (50MB)
   - Allowed MIME types: All
3. [ ] Create `avatars` bucket:
   - Name: `avatars`
   - Public: Yes
   - File size limit: 5242880 (5MB)
   - Allowed MIME types: image/*
4. [ ] Create `public-assets` bucket:
   - Name: `public-assets`
   - Public: Yes
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: All

**Apply Storage RLS Policies:**
1. [ ] Open SQL Editor
2. [ ] Copy SQL from `docs/database/STORAGE_SETUP.md` (lines 150-300)
3. [ ] Execute in SQL Editor

**Verification:**
```sql
-- Verify buckets exist
SELECT * FROM storage.buckets;
-- Expected: 3 rows (attachments, avatars, public-assets)

-- Verify storage policies
SELECT *
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
-- Expected: Multiple policies for file access
```

**Success Criteria:**
- [ ] All 3 buckets created
- [ ] Storage RLS policies applied
- [ ] No errors in SQL execution

**Reference:** `docs/database/STORAGE_SETUP.md` for detailed configs

---

### Task 3: Manual Testing - Notifications (10 minutes)
**Priority:** 🟡 Medium - Functionality
**Status:** Ready to test

**Test Script:**
```bash
# Create test script
cat > app/scripts/test-notifications.ts << 'EOF'
import { prisma } from '@/lib/prisma';

async function test() {
  console.log('🧪 Testing Notification System\n');

  // 1. Create test notification
  const notification = await prisma.notification.create({
    data: {
      userId: 'YOUR_USER_ID', // Replace with actual user ID
      organizationId: 'YOUR_ORG_ID', // Replace with actual org ID
      type: 'INFO',
      title: 'Test Notification',
      message: 'This is a test notification from Session 3',
      read: false,
    },
  });

  console.log('✅ Created notification:', notification.id);

  // 2. Fetch unread notifications
  const unread = await prisma.notification.findMany({
    where: {
      userId: notification.userId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('✅ Found unread notifications:', unread.length);

  // 3. Mark as read
  await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });

  console.log('✅ Marked notification as read');

  // 4. Delete test notification
  await prisma.notification.delete({
    where: { id: notification.id },
  });

  console.log('✅ Deleted test notification\n');
  console.log('🎉 All notification tests passed!');
}

test()
  .catch(console.error)
  .finally(() => process.exit());
EOF

# Run test
npx tsx app/scripts/test-notifications.ts
```

**Manual Testing Steps:**
1. [ ] Create notification via test script
2. [ ] Verify notification appears in database
3. [ ] Mark notification as read
4. [ ] Verify read status updated
5. [ ] Delete notification
6. [ ] Verify deletion successful

**Success Criteria:**
- [ ] Can create notifications
- [ ] Can query notifications
- [ ] Can update notifications
- [ ] Can delete notifications
- [ ] No errors in operations

---

### Task 4: Manual Testing - Realtime Subscriptions (10 minutes)
**Priority:** 🟡 Medium - Functionality
**Status:** Ready to test

**Test Realtime Script:**
```typescript
// app/scripts/test-realtime.ts
import { RealtimeClient } from '@/lib/realtime/client';
import { prisma } from '@/lib/prisma';

async function test() {
  console.log('🧪 Testing Realtime Subscriptions\n');

  const client = new RealtimeClient();

  // Subscribe to task updates
  console.log('📡 Subscribing to task updates...');
  const unsub = client.subscribeToTaskUpdates(
    'YOUR_PROJECT_ID', // Replace with actual project ID
    (payload) => {
      console.log('✅ Realtime event received:', payload.eventType);
      console.log('   Table: tasks');
      console.log('   Data:', payload.new);
    }
  );

  console.log('⏳ Waiting 30 seconds for events...');
  console.log('   (Create/update a task in another window to test)\n');

  await new Promise((resolve) => setTimeout(resolve, 30000));

  unsub();
  console.log('🎉 Realtime test complete!');
}

test()
  .catch(console.error)
  .finally(() => process.exit());
```

**Manual Testing Steps:**
1. [ ] Run realtime test script
2. [ ] In another window, create a task in the project
3. [ ] Verify realtime event is logged
4. [ ] Update the task
5. [ ] Verify update event is logged
6. [ ] Test all 4 subscription types:
   - [ ] Tasks (`subscribeToTaskUpdates`)
   - [ ] Customers (`subscribeToCustomerUpdates`)
   - [ ] Projects (`subscribeToProjectUpdates`)
   - [ ] Notifications (`subscribeToNotificationUpdates`)

**Success Criteria:**
- [ ] Subscriptions establish successfully
- [ ] Events fire when data changes
- [ ] Correct table names used (tasks, not Task)
- [ ] Correct filter fields used (project_id, not projectId)
- [ ] No console errors

---

### Task 5: Manual Testing - RLS Policies (15 minutes)
**Priority:** 🔴 Critical - Security
**Status:** Ready after Task 1 complete

**Test RLS Isolation:**
```sql
-- Test 1: Verify RLS enabled
SET ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "test-user-123"}';

-- Test 2: Query customers (should be filtered by org)
SELECT COUNT(*) as customer_count FROM customers;
-- Expected: Only customers from user's organization

-- Test 3: Try to access another org's data (should fail or return empty)
SELECT * FROM customers WHERE organization_id = 'different-org-id';
-- Expected: Empty result or permission denied

-- Test 4: Switch to different user
SET LOCAL "request.jwt.claims" = '{"sub": "different-user-456"}';
SELECT COUNT(*) as customer_count FROM customers;
-- Expected: Different count (or empty if user not in any org)

-- Test 5: Reset role
RESET ROLE;
```

**Manual Testing Steps:**
1. [ ] Login as User A (Organization A)
2. [ ] Query customers via app
3. [ ] Verify only sees Organization A customers
4. [ ] Query projects via app
5. [ ] Verify only sees Organization A projects
6. [ ] Login as User B (Organization B)
7. [ ] Repeat queries
8. [ ] Verify only sees Organization B data
9. [ ] Verify NO cross-org data leakage

**Success Criteria:**
- [ ] Users only see their organization's data
- [ ] No cross-tenant data access
- [ ] RLS policies prevent leaks even if app code forgets to filter
- [ ] No "permission denied" errors (policies allow proper access)

---

### Task 6: Manual Testing - File Uploads (10 minutes)
**Priority:** 🟡 Medium - Functionality
**Status:** Ready after Task 2 complete

**Test File Upload Script:**
```typescript
// app/scripts/test-storage.ts
import { createServiceRoleClient } from '@/lib/supabase/server';
import fs from 'fs';

async function test() {
  console.log('🧪 Testing Storage Buckets\n');

  const supabase = createServiceRoleClient();

  // Test 1: Upload file
  const testFile = Buffer.from('Test file content');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload('test/test-file.txt', testFile, {
      contentType: 'text/plain',
    });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    return;
  }
  console.log('✅ File uploaded:', uploadData.path);

  // Test 2: Generate signed URL
  const { data: urlData, error: urlError } = await supabase.storage
    .from('attachments')
    .createSignedUrl('test/test-file.txt', 3600);

  if (urlError) {
    console.error('❌ Signed URL failed:', urlError);
    return;
  }
  console.log('✅ Signed URL generated:', urlData.signedUrl);

  // Test 3: Download file
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from('attachments')
    .download('test/test-file.txt');

  if (downloadError) {
    console.error('❌ Download failed:', downloadError);
    return;
  }
  console.log('✅ File downloaded:', (await downloadData.text()));

  // Test 4: Delete file
  const { error: deleteError } = await supabase.storage
    .from('attachments')
    .remove(['test/test-file.txt']);

  if (deleteError) {
    console.error('❌ Delete failed:', deleteError);
    return;
  }
  console.log('✅ File deleted\n');

  console.log('🎉 All storage tests passed!');
}

test()
  .catch(console.error)
  .finally(() => process.exit());
```

**Manual Testing Steps:**
1. [ ] Upload file to `attachments` bucket
2. [ ] Verify file appears in Supabase Storage dashboard
3. [ ] Generate signed URL
4. [ ] Access signed URL in browser
5. [ ] Verify file downloads correctly
6. [ ] Delete file
7. [ ] Verify file removed from bucket
8. [ ] Test all 3 buckets

**Success Criteria:**
- [ ] Can upload files to all buckets
- [ ] Can generate signed URLs
- [ ] Can download files
- [ ] Can delete files
- [ ] Storage RLS policies working
- [ ] No permission errors

---

### Task 7: Final Verification & Cleanup (10 minutes)
**Priority:** 🟢 Low - Housekeeping
**Status:** Run after all tests pass

**Verification Commands:**
```bash
cd app

# 1. TypeScript compilation
npx tsc --noEmit
# Expected: No errors

# 2. Prisma validation
npx prisma validate
# Expected: "The schema at prisma/schema.prisma is valid 🚀"

# 3. Linting
npm run lint
# Expected: Only pre-existing warnings (not related to our changes)

# 4. Database connection
npx prisma studio
# Expected: Opens Prisma Studio successfully

# 5. Environment validation
npm run dev
# Expected: Starts successfully with "✅ Environment variables validated"
```

**Cleanup Tasks:**
1. [ ] Remove test scripts (or move to `app/scripts/tests/`)
2. [ ] Remove test notifications from database
3. [ ] Remove test files from storage buckets
4. [ ] Verify git status clean
5. [ ] Review changes before commit

**Final Checklist:**
- [ ] All automated tasks from Session 2 still working
- [ ] All manual tasks from Session 3 complete
- [ ] All verification commands passing
- [ ] No test data left in production database
- [ ] Ready for production deployment

---

## 📊 Expected Results

### Before Session 3
- **Health Score:** 🟢 85/100
- **RLS:** ❌ Not deployed
- **Storage:** ❌ Not configured
- **Notifications:** ⚠️ Not tested
- **Realtime:** ⚠️ Not tested

### After Session 3
- **Health Score:** 🟢 95/100
- **RLS:** ✅ Deployed and tested
- **Storage:** ✅ Configured and tested
- **Notifications:** ✅ Tested end-to-end
- **Realtime:** ✅ Tested end-to-end

---

## ⏱️ Time Estimates

| Task | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Deploy RLS Policies | 15 min |
| 2 | Setup Storage Buckets | 10 min |
| 3 | Test Notifications | 10 min |
| 4 | Test Realtime | 10 min |
| 5 | Test RLS Isolation | 15 min |
| 6 | Test File Uploads | 10 min |
| 7 | Final Verification | 10 min |
| **Total** | | **80 min (~1.5 hours)** |

**Buffer:** +20 minutes for troubleshooting = **~2 hours total**

---

## 🔄 Rollback Plan

If any issues arise:

### Rollback RLS (Emergency)
```sql
-- Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- OR drop all policies
DROP POLICY IF EXISTS "users_select_own" ON users;
-- ... (repeat for all policies)
```

### Rollback Storage
```bash
# Delete buckets in Supabase Dashboard
# Storage → Buckets → Delete
```

### Restore Previous State
```bash
# Git restore if needed
git log --oneline
git reset --hard [COMMIT_BEFORE_SESSION_2]

# Restore database from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

---

## 📝 Troubleshooting Guide

### Issue: RLS Policies Block Legitimate Access
**Symptoms:** "permission denied for table X" errors
**Diagnosis:**
```sql
-- Check if user has organization membership
SELECT * FROM organization_members WHERE user_id = auth.uid()::text;

-- Check current_user_org() returns correct value
SELECT current_user_org();
```
**Solutions:**
- Ensure user is member of an organization
- Verify `current_user_org()` function works
- Check policy conditions match data structure
- Temporarily disable RLS on problematic table for debugging

---

### Issue: Realtime Subscriptions Not Firing
**Symptoms:** No events received when data changes
**Diagnosis:**
```typescript
// Check subscription status
const status = channel.state;
console.log('Channel status:', status); // Should be 'joined'
```
**Solutions:**
- Verify table names use snake_case (tasks, not Task)
- Verify filter fields use snake_case (project_id, not projectId)
- Check Supabase Realtime is enabled in dashboard
- Verify auth token is valid

---

### Issue: Storage Uploads Fail
**Symptoms:** "permission denied" or bucket not found
**Diagnosis:**
```sql
-- Verify buckets exist
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```
**Solutions:**
- Verify bucket names are correct
- Check storage RLS policies are applied
- Ensure using correct Supabase client (service role for backend)
- Check file size under limit

---

## 📚 Reference Documentation

**Session Documents:**
- [session1_summary.md](./session1_summary.md) - Audit findings
- [session2_plan.md](./session2_plan.md) - Implementation plan
- [session2_summary.md](./session2_summary.md) - What was automated

**Technical Guides:**
- [DATABASE_AUDIT_REPORT.md](../DATABASE_AUDIT_REPORT.md) - Detailed findings
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Step-by-step migration
- [RLS_POLICIES.md](../RLS_POLICIES.md) - RLS explanation and SQL
- [STORAGE_SETUP.md](../STORAGE_SETUP.md) - Storage configuration
- [PRISMA-SUPABASE-STRATEGY.md](../PRISMA-SUPABASE-STRATEGY.md) - Architecture

**Code References:**
- RLS SQL: `app/prisma/migrations/add_rls_policies.sql`
- Env validation: `app/lib/env.ts`
- Supabase clients: `app/lib/supabase/`
- Realtime client: `app/lib/realtime/client.ts`

---

## 🎯 Success Criteria

Session 3 is complete when ALL of the following are true:

### Database & Security
- [ ] RLS policies deployed on all 17 tables
- [ ] 60+ policies exist and verified
- [ ] Helper functions working correctly
- [ ] Multi-tenant isolation tested and confirmed
- [ ] No cross-org data leakage

### Storage
- [ ] All 3 buckets created (attachments, avatars, public-assets)
- [ ] Storage RLS policies applied
- [ ] File upload/download working
- [ ] Signed URL generation working

### Functionality
- [ ] Notifications can be created, read, updated, deleted
- [ ] Realtime subscriptions fire correctly
- [ ] All 4 subscription types tested
- [ ] Events trigger when data changes

### Quality
- [ ] All verification commands pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment validation working
- [ ] Test data cleaned up

### Documentation
- [ ] Session 3 summary created
- [ ] Issues documented (if any)
- [ ] Solutions documented (if any)
- [ ] Health score updated

---

## 🔜 Post-Session 3 Recommendations

### Immediate Next Steps
1. **Create comprehensive test suite**
   - Unit tests for Server Actions
   - Integration tests for RLS policies
   - E2E tests for critical flows

2. **Setup monitoring**
   - Database query performance
   - RLS policy performance
   - Storage usage metrics
   - Realtime connection health

3. **Documentation updates**
   - Update README with new features
   - Document deployment process
   - Create runbook for common issues

### Future Enhancements (Session 4+)
1. **Performance Optimization**
   - Add database indexes where needed
   - Optimize slow RLS queries
   - Setup query caching

2. **Enhanced Security**
   - Add rate limiting to APIs
   - Implement request logging
   - Setup security monitoring

3. **Developer Experience**
   - Add Presence Tracking (Task 3.2 from Session 2)
   - Create Prisma seeding scripts
   - Setup local development automation

4. **Production Readiness**
   - Setup automated backups
   - Create disaster recovery plan
   - Document scaling strategy
   - Setup CI/CD pipeline

---

## ✅ Session 3 Checklist

**Pre-Session:**
- [ ] Session 2 automated tasks verified complete
- [ ] Database backup created
- [ ] Supabase Dashboard access confirmed
- [ ] Test data prepared (user IDs, org IDs, project IDs)

**During Session:**
- [ ] Task 1: Deploy RLS Policies
- [ ] Task 2: Setup Storage Buckets
- [ ] Task 3: Test Notifications
- [ ] Task 4: Test Realtime
- [ ] Task 5: Test RLS Isolation
- [ ] Task 6: Test File Uploads
- [ ] Task 7: Final Verification

**Post-Session:**
- [ ] Session 3 summary created
- [ ] Health score updated (target: 95/100)
- [ ] All manual tests documented
- [ ] Git commit with changes
- [ ] Team notified of completion

---

**Session Status:** 📋 **PLANNED**
**Ready to Execute:** After Session 2 review
**Expected Duration:** 1-2 hours
**Expected Outcome:** 🟢 Health Score 95/100

---

*Created: October 1, 2025 | For: Session 3 Manual Steps & Verification*
