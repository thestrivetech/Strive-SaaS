# Row Level Security (RLS) Policies - Complete Reference

**Purpose:** Multi-tenant data isolation at the database level
**Provider:** PostgreSQL (via Supabase)
**Scope:** All multi-tenant tables in Prisma schema

---

## 🎯 What is RLS?

**Row Level Security (RLS)** is a PostgreSQL feature that automatically filters rows based on the current user's context, enforced at the database level.

### Why Use RLS?

**Security Benefits:**
- ✅ Organization data isolation (multi-tenancy)
- ✅ Works even if application code has bugs
- ✅ Protects against SQL injection
- ✅ Automatic filtering on all queries
- ✅ Enforced at database level (can't bypass)

**Without RLS:**
```typescript
// Developer must remember to filter EVERY query
const customers = await prisma.customer.findMany({
  where: { organizationId: currentOrgId }  // Easy to forget!
});
```

**With RLS:**
```typescript
// Database automatically filters by org
const customers = await prisma.customer.findMany();
// RLS ensures only current org's customers returned
```

---

## 🏗️ How RLS Works

### 1. Set User Context

Before each request, set PostgreSQL session variables:

```typescript
// lib/database/prisma.ts (middleware)
export async function setRLSContext(userId: string, orgId: string) {
  await prisma.$executeRaw`
    SET app.current_user_id = ${userId};
    SET app.current_org_id = ${orgId};
  `;
}
```

### 2. Enable RLS on Tables

```sql
-- In Prisma migration
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### 3. Create Policies

```sql
-- Allow users to see their org's customers
CREATE POLICY "customers_select_own_org"
ON customers
FOR SELECT
USING (organization_id = current_setting('app.current_org_id'));
```

### 4. Queries Auto-Filter

```typescript
// Application code
const customers = await prisma.customer.findMany();
// SQL executed:
// SELECT * FROM customers WHERE organization_id = 'org-123'
// (RLS adds the WHERE clause automatically)
```

---

## 📋 Policy Patterns

### Pattern 1: Organization Isolation (Most Common)

**Use for:** All multi-tenant data (customers, projects, tasks, etc.)

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their org's data
CREATE POLICY "table_select_own_org"
ON table_name
FOR SELECT
USING (organization_id = current_setting('app.current_org_id'));

-- INSERT: Users can only create records for their org
CREATE POLICY "table_insert_own_org"
ON table_name
FOR INSERT
WITH CHECK (organization_id = current_setting('app.current_org_id'));

-- UPDATE: Users can only update their org's records
CREATE POLICY "table_update_own_org"
ON table_name
FOR UPDATE
USING (organization_id = current_setting('app.current_org_id'));

-- DELETE: Users can only delete their org's records
CREATE POLICY "table_delete_own_org"
ON table_name
FOR DELETE
USING (organization_id = current_setting('app.current_org_id'));
```

### Pattern 2: User Ownership

**Use for:** User-specific data (user_preferences, user_sessions)

```sql
-- SELECT: Users see only their own data
CREATE POLICY "table_select_own"
ON table_name
FOR SELECT
USING (user_id = current_setting('app.current_user_id'));

-- INSERT: Users can only create their own records
CREATE POLICY "table_insert_own"
ON table_name
FOR INSERT
WITH CHECK (user_id = current_setting('app.current_user_id'));

-- UPDATE: Users can only update their own records
CREATE POLICY "table_update_own"
ON table_name
FOR UPDATE
USING (user_id = current_setting('app.current_user_id'));

-- DELETE: Users can only delete their own records
CREATE POLICY "table_delete_own"
ON table_name
FOR DELETE
USING (user_id = current_setting('app.current_user_id'));
```

### Pattern 3: Admin-Only Access

**Use for:** System tables (platform_metrics, feature_flags, system_alerts)

```sql
-- Only admins can view
CREATE POLICY "table_select_admin"
ON table_name
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = current_setting('app.current_user_id')
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  )
);

-- Only admins can modify
CREATE POLICY "table_modify_admin"
ON table_name
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = current_setting('app.current_user_id')
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  )
);
```

### Pattern 4: Public Read, Authenticated Write

**Use for:** Public reference data (content_categories, templates)

```sql
-- Anyone can read
CREATE POLICY "table_select_all"
ON table_name
FOR SELECT
USING (true);

-- Only authenticated users can write
CREATE POLICY "table_insert_authenticated"
ON table_name
FOR INSERT
WITH CHECK (
  current_setting('app.current_user_id') IS NOT NULL
);
```

### Pattern 5: Role-Based Access

**Use for:** Role-specific permissions (org admins can manage, members can view)

```sql
-- All org members can view
CREATE POLICY "table_select_org_member"
ON table_name
FOR SELECT
USING (
  organization_id = current_setting('app.current_org_id')
);

-- Only org admins can modify
CREATE POLICY "table_modify_org_admin"
ON table_name
FOR ALL
USING (
  organization_id = current_setting('app.current_org_id')
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = current_setting('app.current_user_id')
    AND organization_id = current_setting('app.current_org_id')
    AND role IN ('OWNER', 'ADMIN')
  )
);
```

---

## 🎨 Complete Examples

### Example 1: Customers Table

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- View own org's customers
CREATE POLICY "customers_select_own_org"
ON customers
FOR SELECT
USING (organization_id = current_setting('app.current_org_id'));

-- Create customers for own org
CREATE POLICY "customers_insert_own_org"
ON customers
FOR INSERT
WITH CHECK (organization_id = current_setting('app.current_org_id'));

-- Update own org's customers
CREATE POLICY "customers_update_own_org"
ON customers
FOR UPDATE
USING (organization_id = current_setting('app.current_org_id'));

-- Delete own org's customers
CREATE POLICY "customers_delete_own_org"
ON customers
FOR DELETE
USING (organization_id = current_setting('app.current_org_id'));
```

### Example 2: Platform Metrics (Admin-Only)

```sql
-- Enable RLS
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform metrics
CREATE POLICY "metrics_select_admin"
ON platform_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = current_setting('app.current_user_id')
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  )
);

-- System can insert metrics (service role key bypass)
CREATE POLICY "metrics_insert_system"
ON platform_metrics
FOR INSERT
WITH CHECK (true);
```

### Example 3: Onboarding Sessions (User-Owned + Org-Linked)

```sql
-- Enable RLS
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "sessions_select_own"
ON onboarding_sessions
FOR SELECT
USING (user_id = current_setting('app.current_user_id'));

-- Anyone can create onboarding sessions (pre-auth)
CREATE POLICY "sessions_insert_all"
ON onboarding_sessions
FOR INSERT
WITH CHECK (true);

-- Users can update their own sessions
CREATE POLICY "sessions_update_own"
ON onboarding_sessions
FOR UPDATE
USING (user_id = current_setting('app.current_user_id'));
```

### Example 4: Storage Objects (Supabase Storage)

```sql
-- View org's files
CREATE POLICY "storage_select_own_org"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('media', 'documents', 'receipts')
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);

-- Upload to org folder
CREATE POLICY "storage_insert_own_org"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('media', 'documents', 'receipts')
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);
```

---

## 🔍 Testing RLS Policies

### Test in SQL Editor

```sql
-- 1. Set user context (simulates authenticated request)
SET app.current_user_id = 'user-123';
SET app.current_org_id = 'org-456';

-- 2. Try to query data
SELECT * FROM customers;
-- Should only return org-456's customers

-- 3. Try to insert data
INSERT INTO customers (id, name, organization_id)
VALUES ('cust-1', 'Test Customer', 'org-456');
-- Should succeed

-- 4. Try to insert for different org
INSERT INTO customers (id, name, organization_id)
VALUES ('cust-2', 'Test Customer', 'org-999');
-- Should fail: new row violates row-level security policy

-- 5. Reset context
RESET app.current_user_id;
RESET app.current_org_id;
```

### Test Policy Violations

```sql
-- Try to access data without context
SELECT * FROM customers;
-- Should return 0 rows (no context = no access)

-- Try to insert without context
INSERT INTO customers (id, name, organization_id)
VALUES ('cust-3', 'Test', 'org-456');
-- Should fail: new row violates row-level security policy
```

---

## 📊 Viewing Current Policies

### List All Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,  -- true = allows access, false = restricts
  roles,       -- which database roles (usually 'public')
  cmd,         -- SELECT, INSERT, UPDATE, DELETE, ALL
  qual,        -- USING clause (for SELECT, UPDATE, DELETE)
  with_check   -- WITH CHECK clause (for INSERT, UPDATE)
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check If RLS Enabled

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity  -- true = RLS enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## ⚠️ Common Mistakes

### Mistake 1: Forgetting to Set Context

```typescript
// ❌ WRONG: Query without RLS context
const customers = await prisma.customer.findMany();
// Returns 0 rows (RLS blocks all without context)

// ✅ CORRECT: Set context first
await setRLSContext(userId, orgId);
const customers = await prisma.customer.findMany();
// Returns org's customers
```

### Mistake 2: Wrong Context Variable Names

```sql
-- ❌ WRONG: Typo in variable name
USING (organization_id = current_setting('app.org_id'))
-- Should be 'app.current_org_id'

-- ✅ CORRECT: Exact variable name
USING (organization_id = current_setting('app.current_org_id'))
```

### Mistake 3: Missing WITH CHECK on INSERT

```sql
-- ❌ WRONG: Only USING clause (doesn't prevent bad inserts)
CREATE POLICY "policy_name"
ON table_name
FOR INSERT
USING (organization_id = current_setting('app.current_org_id'));

-- ✅ CORRECT: WITH CHECK clause for inserts
CREATE POLICY "policy_name"
ON table_name
FOR INSERT
WITH CHECK (organization_id = current_setting('app.current_org_id'));
```

### Mistake 4: Using auth.uid() Instead of Session Vars

```sql
-- ⚠️ CAUTION: auth.uid() only works with Supabase Auth
USING (user_id = auth.uid()::text)
-- Won't work if using Prisma queries (no Supabase Auth context)

-- ✅ BETTER: Use session variables
USING (user_id = current_setting('app.current_user_id'))
-- Works with any authentication system
```

---

## 🎯 Best Practices

### DO:

✅ **Set context for every request**
```typescript
// middleware.ts or auth helper
await setRLSContext(session.user.id, session.user.organizationId);
```

✅ **Use consistent variable names**
```
app.current_user_id
app.current_org_id
```

✅ **Test policies before deploying**
```sql
-- Test with SQL queries first
SET app.current_user_id = 'test-user';
SELECT * FROM table_name;
```

✅ **Enable RLS on all multi-tenant tables**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

✅ **Create policies for all operations (SELECT, INSERT, UPDATE, DELETE)**

### DON'T:

❌ **Trust application-level filtering alone**
```typescript
// RLS is defense in depth
// Even if app filters by org, RLS prevents bugs/attacks
```

❌ **Disable RLS in production**
```sql
-- NEVER do this in production!
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

❌ **Forget to set context**
```typescript
// This will fail silently (returns 0 rows)
const data = await prisma.table.findMany();
```

❌ **Use overly complex policies**
```sql
-- Keep policies simple and readable
-- Complex joins slow down every query
```

---

## 🛠️ Debugging RLS Issues

### Issue: Queries return 0 rows

**Cause:** RLS context not set

**Solution:**
```typescript
// Check if context is set
await prisma.$executeRaw`SELECT current_setting('app.current_org_id')`;
// If empty, call setRLSContext first
```

### Issue: "new row violates row-level security policy"

**Cause:** INSERT/UPDATE violates WITH CHECK clause

**Solution:**
```sql
-- Check policy WITH CHECK clause
SELECT with_check FROM pg_policies
WHERE tablename = 'your_table' AND cmd = 'INSERT';

-- Ensure data matches policy condition
```

### Issue: Slow queries after enabling RLS

**Cause:** Complex policy with expensive subqueries

**Solution:**
```sql
-- Instead of:
USING (
  organization_id IN (
    SELECT organization_id FROM complex_join_query
  )
)

-- Use simpler:
USING (organization_id = current_setting('app.current_org_id'))
```

---

## 📚 Related Documentation

- **Supabase Setup:** `SUPABASE-SETUP.md` - Overview of Supabase + Prisma
- **Storage Buckets:** `STORAGE-BUCKETS.md` - RLS on storage.objects
- **Prisma Migrations:** `../prisma/README.md` - How RLS is included in migrations

---

## 🔗 External Resources

- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Performance Tips](https://supabase.com/docs/guides/database/postgres/row-level-security#performance)

---

**Last Updated:** 2025-10-06
**Tables with RLS:** See Prisma migrations for complete list
