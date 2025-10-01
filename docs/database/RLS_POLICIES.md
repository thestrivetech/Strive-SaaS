# Row Level Security (RLS) Policies
**Strive Tech SaaS Platform - Multi-Tenant Data Isolation**

**Last Updated:** October 1, 2025
**Version:** 1.0.0
**Status:** 🔴 Not Yet Implemented

---

## Overview

Row Level Security (RLS) is PostgreSQL's native multi-tenancy enforcement mechanism. This document defines RLS policies for the Strive Tech platform to ensure organization-level data isolation.

**Why RLS is Critical:**
- **Defense in Depth**: Even if application code forgets to filter by `organizationId`, RLS prevents data leaks
- **Compliance**: GDPR, SOC 2, and other standards require data isolation
- **Zero Trust**: Never trust application layer alone for security

**Important Note:**
> Prisma uses the database connection with bypassing RLS by default when using service role credentials. RLS acts as a **safety net** if application code fails to properly scope queries by `organizationId`.

---

## Architecture Pattern

### Current State (Application-Level Only)
```
┌─────────────────────────────────────────┐
│         Next.js Application             │
│                                         │
│  ❌ App code must remember to filter:  │
│     WHERE organizationId = ?            │
│                                         │
│  ⚠️  One forgotten WHERE clause =       │
│      Cross-tenant data leak!            │
└─────────────────────────────────────────┘
                    ▼
        ┌──────────────────────────┐
        │   PostgreSQL Database    │
        │   (No RLS = No Safety)   │
        └──────────────────────────┘
```

### Target State (Application + Database Level)
```
┌─────────────────────────────────────────┐
│         Next.js Application             │
│                                         │
│  ✅ App code filters by organizationId  │
│     WHERE organizationId = ?            │
└─────────────────────────────────────────┘
                    ▼
        ┌──────────────────────────┐
        │   PostgreSQL Database    │
        │                          │
        │  ✅ RLS policies enforce │
        │     organization_id =    │
        │     current_user_org()   │
        │                          │
        │  ✅ Safety net if app    │
        │     code forgets         │
        └──────────────────────────┘
```

---

## RLS Policy Strategy

### Tier 1: Organization-Level Isolation (All Tables)
**Applies to:** All tables with `organizationId` column

**Policy:** Users can only access rows where `organizationId` matches their organization membership

### Tier 2: User-Level Isolation (Personal Data)
**Applies to:** `users`, `ai_conversations`, `notifications`

**Policy:** Users can only access their own data

### Tier 3: Role-Based Access (Admin Features)
**Applies to:** `subscriptions`, `usage_tracking`, `activity_logs` (full access)

**Policy:** Only `ADMIN` or `OWNER` roles can access certain data

---

## SQL Migration File

Create this file: `prisma/migrations/add_rls_policies.sql`

```sql
-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Strive Tech SaaS Platform - Multi-Tenant Isolation
-- =====================================================
-- Version: 1.0.0
-- Date: 2025-10-01
--
-- IMPORTANT: Run this AFTER Prisma migrations
-- Execute: psql $DATABASE_URL -f prisma/migrations/add_rls_policies.sql
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get current user's organization ID
CREATE OR REPLACE FUNCTION current_user_org()
RETURNS TEXT AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text
    AND role IN ('ADMIN', 'MODERATOR')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function: Check if user is org owner
CREATE OR REPLACE FUNCTION is_org_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()::text
    AND role = 'OWNER'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;  -- Will exist after migration
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE example_conversations ENABLE ROW LEVEL SECURITY;

-- Analytics tables (optional RLS - may want full access for reporting)
-- ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own profile
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

-- Policy: Users can view users in their organization
CREATE POLICY "users_select_org"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()::text
    )
    AND om.user_id = users.id
  )
);

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- Policy: Admins can manage all users
CREATE POLICY "users_admin_all"
ON users
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Policy: Users can view their organizations
CREATE POLICY "organizations_select_member"
ON organizations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
  )
);

-- Policy: Org owners can update their organization
CREATE POLICY "organizations_update_owner"
ON organizations
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
    AND role IN ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
    AND role IN ('OWNER', 'ADMIN')
  )
);

-- =====================================================
-- ORGANIZATION_MEMBERS TABLE POLICIES
-- =====================================================

-- Policy: Members can view their own organization's members
CREATE POLICY "org_members_select_own_org"
ON organization_members
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
  )
);

-- Policy: Owners can manage organization members
CREATE POLICY "org_members_manage_owner"
ON organization_members
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
    AND role IN ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()::text
    AND role IN ('OWNER', 'ADMIN')
  )
);

-- =====================================================
-- CUSTOMERS TABLE POLICIES
-- =====================================================

-- Policy: Organization members can view their customers
CREATE POLICY "customers_select_org"
ON customers
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: Organization members can create customers
CREATE POLICY "customers_insert_org"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (organization_id = current_user_org());

-- Policy: Organization members can update customers
CREATE POLICY "customers_update_org"
ON customers
FOR UPDATE
TO authenticated
USING (organization_id = current_user_org())
WITH CHECK (organization_id = current_user_org());

-- Policy: Org owners can delete customers
CREATE POLICY "customers_delete_owner"
ON customers
FOR DELETE
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_org_owner()
);

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Policy: Organization members can view projects
CREATE POLICY "projects_select_org"
ON projects
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: Project managers can create projects
CREATE POLICY "projects_insert_org"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = current_user_org()
  AND project_manager_id = auth.uid()::text
);

-- Policy: Project managers can update their projects
CREATE POLICY "projects_update_manager"
ON projects
FOR UPDATE
TO authenticated
USING (
  organization_id = current_user_org()
  AND project_manager_id = auth.uid()::text
)
WITH CHECK (
  organization_id = current_user_org()
  AND project_manager_id = auth.uid()::text
);

-- Policy: Org admins can manage all projects
CREATE POLICY "projects_admin_manage"
ON projects
FOR ALL
TO authenticated
USING (
  organization_id = current_user_org()
  AND (is_org_owner() OR is_admin())
);

-- =====================================================
-- TASKS TABLE POLICIES
-- =====================================================

-- Policy: Team members can view tasks in their org's projects
CREATE POLICY "tasks_select_org"
ON tasks
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE organization_id = current_user_org()
  )
);

-- Policy: Team members can create tasks
CREATE POLICY "tasks_insert_org"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (
    SELECT id FROM projects
    WHERE organization_id = current_user_org()
  )
  AND created_by = auth.uid()::text
);

-- Policy: Assigned users and creators can update tasks
CREATE POLICY "tasks_update_assigned"
ON tasks
FOR UPDATE
TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE organization_id = current_user_org()
  )
  AND (
    assigned_to = auth.uid()::text
    OR created_by = auth.uid()::text
  )
);

-- Policy: Project managers can delete tasks
CREATE POLICY "tasks_delete_manager"
ON tasks
FOR DELETE
TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE organization_id = current_user_org()
    AND project_manager_id = auth.uid()::text
  )
);

-- =====================================================
-- AI_CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own AI conversations
CREATE POLICY "ai_conversations_select_own"
ON ai_conversations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- Policy: Users can create their own AI conversations
CREATE POLICY "ai_conversations_insert_own"
ON ai_conversations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- Policy: Users can update their own AI conversations
CREATE POLICY "ai_conversations_update_own"
ON ai_conversations
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
)
WITH CHECK (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- Policy: Admins can view all org conversations (for analytics)
CREATE POLICY "ai_conversations_admin_view"
ON ai_conversations
FOR SELECT
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_admin()
);

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own notifications
CREATE POLICY "notifications_select_own"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- Policy: System can create notifications for users
CREATE POLICY "notifications_insert_system"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (organization_id = current_user_org());

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
ON notifications
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
)
WITH CHECK (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- Policy: Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
ON notifications
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()::text
  AND organization_id = current_user_org()
);

-- =====================================================
-- ATTACHMENTS TABLE POLICIES
-- =====================================================

-- Policy: Users can view attachments in their organization
CREATE POLICY "attachments_select_org"
ON attachments
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: Users can upload attachments to their organization
CREATE POLICY "attachments_insert_org"
ON attachments
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = current_user_org()
  AND uploaded_by_id = auth.uid()::text
);

-- Policy: Uploaders can delete their attachments
CREATE POLICY "attachments_delete_uploader"
ON attachments
FOR DELETE
TO authenticated
USING (
  organization_id = current_user_org()
  AND uploaded_by_id = auth.uid()::text
);

-- Policy: Org admins can delete any attachment
CREATE POLICY "attachments_delete_admin"
ON attachments
FOR DELETE
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_org_owner()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Policy: Org owners can view their subscription
CREATE POLICY "subscriptions_select_owner"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_org_owner()
);

-- Policy: Only service role can modify subscriptions (Stripe webhooks)
-- This is intentionally restrictive - subscriptions managed by webhooks

-- =====================================================
-- USAGE_TRACKING TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own usage
CREATE POLICY "usage_tracking_select_own"
ON usage_tracking
FOR SELECT
TO authenticated
USING (
  organization_id = current_user_org()
  AND user_id = auth.uid()::text
);

-- Policy: Org owners can view all org usage
CREATE POLICY "usage_tracking_select_owner"
ON usage_tracking
FOR SELECT
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_org_owner()
);

-- Policy: System can track usage
CREATE POLICY "usage_tracking_insert_system"
ON usage_tracking
FOR INSERT
TO authenticated
WITH CHECK (organization_id = current_user_org());

-- =====================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =====================================================

-- Policy: Users can view activity in their organization
CREATE POLICY "activity_logs_select_org"
ON activity_logs
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: System can create activity logs
CREATE POLICY "activity_logs_insert_system"
ON activity_logs
FOR INSERT
TO authenticated
WITH CHECK (organization_id = current_user_org());

-- =====================================================
-- CONVERSATIONS (Chatbot) TABLE POLICIES
-- =====================================================

-- Policy: Organization can view their chatbot conversations
CREATE POLICY "conversations_select_org"
ON conversations
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: System can create conversations
CREATE POLICY "conversations_insert_system"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (organization_id = current_user_org());

-- =====================================================
-- APPOINTMENTS TABLE POLICIES
-- =====================================================

-- Policy: Users can view appointments in their organization
CREATE POLICY "appointments_select_org"
ON appointments
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: Users can create appointments
CREATE POLICY "appointments_insert_org"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = current_user_org()
  AND assigned_to = auth.uid()::text
);

-- Policy: Assigned users can update appointments
CREATE POLICY "appointments_update_assigned"
ON appointments
FOR UPDATE
TO authenticated
USING (
  organization_id = current_user_org()
  AND assigned_to = auth.uid()::text
);

-- =====================================================
-- CONTENT TABLE POLICIES
-- =====================================================

-- Policy: Public content can be viewed by anyone
CREATE POLICY "content_select_published"
ON content
FOR SELECT
TO public
USING (status = 'PUBLISHED');

-- Policy: Org members can view all content in their organization
CREATE POLICY "content_select_org"
ON content
FOR SELECT
TO authenticated
USING (organization_id = current_user_org());

-- Policy: Authors can create content
CREATE POLICY "content_insert_author"
ON content
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = current_user_org()
  AND author_id = auth.uid()::text
);

-- Policy: Authors can update their own content
CREATE POLICY "content_update_author"
ON content
FOR UPDATE
TO authenticated
USING (
  organization_id = current_user_org()
  AND author_id = auth.uid()::text
);

-- Policy: Admins can manage all content
CREATE POLICY "content_admin_manage"
ON content
FOR ALL
TO authenticated
USING (
  organization_id = current_user_org()
  AND is_admin()
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'organizations', 'organization_members', 'customers',
  'projects', 'tasks', 'ai_conversations', 'notifications',
  'attachments', 'subscriptions', 'usage_tracking',
  'activity_logs', 'conversations', 'appointments', 'content'
)
ORDER BY tablename;

-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Deployment Instructions

### Step 1: Backup Database
```bash
pg_dump $DATABASE_URL > backup_before_rls_$(date +%Y%m%d).sql
```

### Step 2: Apply RLS Policies
```bash
# Option 1: Via psql
psql $DATABASE_URL -f docs/database/RLS_POLICIES.sql

# Option 2: Via Supabase SQL Editor
# Copy contents of RLS_POLICIES.sql and execute in dashboard
```

### Step 3: Verify Deployment
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Should return all tables

-- Check policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Should show multiple policies per table
```

### Step 4: Test RLS Policies
```sql
-- Test as authenticated user
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "test-user-id"}';

-- Try to access data
SELECT * FROM customers LIMIT 1;
-- Should return empty or only user's org data

-- Test as different user
SET LOCAL "request.jwt.claims" = '{"sub": "different-user-id"}';
SELECT * FROM customers LIMIT 1;
-- Should return different data or empty
```

---

## Troubleshooting

### Issue: "permission denied for table"
**Cause:** RLS enabled but no SELECT policy allows access
**Solution:** Add policy or grant permission to authenticated role

### Issue: Queries return empty results
**Cause:** `current_user_org()` returns NULL (user not in organization)
**Solution:** Verify user has organization membership:
```sql
SELECT * FROM organization_members WHERE user_id = auth.uid()::text;
```

### Issue: RLS policies too restrictive
**Solution:** Temporarily disable for debugging:
```sql
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- Debug, then re-enable
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### Issue: Performance degradation
**Cause:** RLS policy subqueries on every row
**Solution:** Add indexes on filtered columns:
```sql
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
```

---

## Performance Considerations

1. **Index Foreign Keys**
   ```sql
   -- Already in schema, but verify:
   CREATE INDEX IF NOT EXISTS idx_customers_org_id ON customers(organization_id);
   CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
   CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
   ```

2. **Optimize Helper Functions**
   - Use `SECURITY DEFINER` carefully (already done)
   - Consider caching `current_user_org()` in application layer

3. **Monitor Query Performance**
   ```sql
   -- Find slow queries with RLS
   SELECT
     query,
     calls,
     mean_exec_time,
     stddev_exec_time
   FROM pg_stat_statements
   WHERE query LIKE '%customers%'
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

---

## Related Documentation

- [DATABASE_AUDIT_REPORT.md](./DATABASE_AUDIT_REPORT.md) - Overall health assessment
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Storage bucket RLS policies
- [PRISMA-SUPABASE-STRATEGY.md](./PRISMA-SUPABASE-STRATEGY.md) - Hybrid architecture

---

**Status:** 🔴 **Not Deployed** - Execute SQL migration to enable RLS

**Next Steps:** After deploying RLS, test with [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
