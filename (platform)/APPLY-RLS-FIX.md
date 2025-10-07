# Apply RLS Fix for organization_members

**Date:** 2025-10-07
**Issue:** Infinite recursion in organization_members RLS policies
**Files Modified:**
- `lib/auth/auth-helpers.ts` (cookie handling + security hardening)
- `prisma/migrations/fix-organization-members-rls.sql` (RLS policy fix)

---

## What Was Fixed

### 1. Cookie Modification Errors (auth-helpers.ts)
**Problem:** Supabase SSR client tried to modify cookies in Server Component context (Next.js 15 read-only restriction)

**Solution:** Wrapped cookie set/remove operations in try-catch blocks to silently ignore errors in read-only contexts

**Files Changed:**
- `/Users/grant/Documents/GitHub/Strive-SaaS/(platform)/lib/auth/auth-helpers.ts` lines 22-39

### 2. Security Hardening (auth-helpers.ts)
**Problem:** Using `getSession()` which only reads cookies without JWT validation (insecure)

**Solution:** Updated `getSession()` to use `getUser()` for server-side JWT validation before returning session

**Files Changed:**
- `/Users/grant/Documents/GitHub/Strive-SaaS/(platform)/lib/auth/auth-helpers.ts` lines 45-71

### 3. RLS Infinite Recursion (organization_members table)
**Problem:** RLS policy on organization_members queries organization_members itself, causing circular reference

**Solution:** Created simplified RLS policies that use session variables instead of subqueries

**Migration File:** `prisma/migrations/fix-organization-members-rls.sql`

---

## How to Apply the RLS Fix

### Option 1: Using Supabase Dashboard SQL Editor

1. Go to https://supabase.com/dashboard/project/bztkedvdjbxffpjxihtc/sql/new
2. Copy the contents of `prisma/migrations/fix-organization-members-rls.sql`
3. Paste into SQL editor
4. Click "Run" to execute
5. Verify: Run `SELECT * FROM organization_members LIMIT 1;` - should work without recursion error

### Option 2: Using Supabase CLI (if installed)

```bash
# From platform directory
cd "(platform)"

# Apply migration
supabase db execute --file prisma/migrations/fix-organization-members-rls.sql
```

### Option 3: Using psql (PostgreSQL client)

```bash
# From platform directory
cd "(platform)"

# Apply migration (replace with actual connection string)
psql "postgresql://postgres.bztkedvdjbxffpjxihtc:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" -f prisma/migrations/fix-organization-members-rls.sql
```

---

## Verification Steps

### 1. Check TypeScript Compilation
```bash
cd "(platform)"
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -20
```
Expected: No new errors in auth-helpers.ts

### 2. Check Dev Server Start
```bash
cd "(platform)"
npm run dev
```
Expected: Server starts without cookie modification errors or RLS errors

### 3. Check Database Query
After applying RLS migration, test in Supabase SQL editor:
```sql
-- This should work without infinite recursion error
SELECT * FROM organization_members LIMIT 1;
```

### 4. Test Dashboard Routes
Visit these URLs (with authentication):
- http://localhost:3002/real-estate/dashboard
- http://localhost:3002/real-estate/crm/dashboard
- http://localhost:3002/real-estate/workspace/dashboard
- http://localhost:3002/real-estate/cms-marketing/dashboard

Expected: All load without RLS/cookie errors (may show auth redirects if not logged in)

### 5. Check Console Logs
Open browser console and check for:
- ❌ Cookie modification errors → Should be GONE
- ❌ RLS infinite recursion errors → Should be GONE
- ❌ getSession() security warnings → Should be GONE

---

## What Changed in Detail

### Cookie Handling Pattern

**Before:**
```typescript
set(name: string, value: string, options: unknown) {
  cookieStore.set({ name, value, ...(options as Record<string, unknown>) });
  // ❌ Throws error in Server Components
}
```

**After:**
```typescript
set(name: string, value: string, options: unknown) {
  try {
    cookieStore.set({ name, value, ...(options as Record<string, unknown>) });
  } catch (error) {
    // ✅ Silently ignores errors in read-only contexts
  }
}
```

### Security Pattern

**Before:**
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
// ❌ Only reads cookies, doesn't validate JWT
```

**After:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
// ✅ Validates JWT server-side before returning session
```

### RLS Policy Pattern

**Before (Problematic):**
```sql
CREATE POLICY "org_member_isolation" ON organization_members
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members  -- ❌ Circular!
    WHERE user_id = current_setting('app.current_user_id')
  )
);
```

**After (Fixed):**
```sql
CREATE POLICY "org_members_select_own" ON organization_members
FOR SELECT
USING (
  user_id = current_setting('app.current_user_id', true)::text
  OR
  organization_id = current_setting('app.current_org_id', true)::text
  -- ✅ No subqueries, no circular reference
);
```

---

## Important Notes

1. **RLS is "defense in depth"** - Prisma bypasses RLS using service role key
2. **Primary security** is enforced by Prisma middleware (see `lib/database/prisma-middleware.ts`)
3. **Session variables** must be set before queries:
   ```typescript
   await setTenantContext({
     organizationId: user.organizationId,
     userId: user.id
   });
   ```

---

## Troubleshooting

### If RLS error persists:
1. Verify migration was applied: Check pg_policies table
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'organization_members';
   ```
2. Check if RLS is enabled:
   ```sql
   SELECT rowsecurity FROM pg_tables WHERE tablename = 'organization_members';
   ```
3. Manually drop all policies and reapply migration

### If cookie errors persist:
1. Clear browser cache and cookies
2. Restart dev server
3. Check Next.js version (should be 15+)

---

**Last Updated:** 2025-10-07
**Status:** Ready to apply
**Required Actions:** Apply SQL migration to Supabase database
