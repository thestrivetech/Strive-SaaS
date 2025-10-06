# Supabase Setup & Configuration

**Provider:** Supabase (PostgreSQL hosting + Auth + Storage + Realtime)
**Projects Using:** (chatbot), (platform), (website)
**Shared Database:** All 3 projects use the SAME Supabase project

---

## 🏗️ Architecture Overview

### Supabase vs Prisma - The Relationship

**Supabase provides:**
- PostgreSQL database hosting
- Built-in authentication (Auth)
- File storage (Storage)
- Real-time subscriptions (Realtime)
- Row Level Security (RLS)
- Edge Functions

**Prisma provides:**
- Type-safe database client
- Schema definition
- Migration management
- Query builder

**How they work together:**
```
┌─────────────────────────────────────────────┐
│  Application Code                           │
│  ├── Prisma Client (database queries)       │
│  ├── Supabase Client (auth, storage)        │
│  └── Supabase Auth (authentication)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Supabase Platform                          │
│  ├── PostgreSQL Database (Prisma connects)  │
│  ├── Auth Service (user management)         │
│  ├── Storage Service (file uploads)         │
│  └── Realtime Service (subscriptions)       │
└─────────────────────────────────────────────┘
```

**Key Principle:**
- **Prisma** = Schema + Migrations + Database Queries
- **Supabase** = Platform + Auth + Storage + RLS enforcement
- **RLS Policies** = SQL in Prisma migrations (applied to Supabase)

---

## 🔐 Authentication

### Current Setup

**Provider:** Supabase Auth
**Strategy:** JWT tokens in httpOnly cookies
**Architecture:** Lazy sync (Supabase Auth → Prisma database)

**Flow:**
```typescript
1. Sign Up/Login → Supabase Auth (handles passwords, tokens)
2. Session Check → getCurrentUser() reads from Prisma
3. User not in Prisma? → Lazy sync from Supabase Auth data
4. No organization? → Redirect to /onboarding/organization
5. Onboarding complete → Access dashboard
```

**Client Creation:**
```typescript
// lib/auth/auth-helpers.ts
import { createServerClient } from '@supabase/ssr';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // ... cookie handlers
      },
    }
  );
};
```

**Environment Variables:**
```bash
# Public (client-side safe)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."  # ⚠️ NEVER expose to client!
```

### Supabase Dashboard Configuration

**Auth Settings to Configure:**

1. **Email Templates**
   - Go to: Authentication → Email Templates
   - Customize: Confirm signup, Reset password, Magic link
   - Use project branding

2. **Auth Providers**
   - Go to: Authentication → Providers
   - Currently: Email (password-based)
   - Future: OAuth (Google, GitHub, etc.)

3. **Email Settings**
   - Go to: Authentication → Email
   - Configure SMTP (or use Supabase's default)
   - Set sender email: `noreply@strivetech.ai`

4. **URL Configuration**
   - Site URL: `https://app.strivetech.ai` (production)
   - Redirect URLs: Add all allowed callback URLs

---

## 💾 Storage (File Uploads)

### Bucket Configuration

**Current Buckets:**
- `media` - User-uploaded images/files (platform)
- `documents` - Transaction documents (platform)
- `receipts` - Expense receipts (platform)
- `avatars` - User profile pictures (all projects)

**Bucket Setup:**

1. **Create Bucket** (Supabase Dashboard)
   ```
   Storage → New Bucket
   Name: media
   Public: false (use RLS for access control)
   ```

2. **RLS Policies** (applied via SQL migration)
   ```sql
   -- Allow authenticated users to upload to their org folder
   CREATE POLICY "Users can upload to own org"
   ON storage.objects FOR INSERT
   WITH CHECK (
     auth.role() = 'authenticated' AND
     bucket_id = 'media' AND
     (storage.foldername(name))[1] = auth.jwt() ->> 'organization_id'
   );

   -- Allow users to read their org's files
   CREATE POLICY "Users can read own org files"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'media' AND
     (storage.foldername(name))[1] = auth.jwt() ->> 'organization_id'
   );
   ```

3. **File Naming Convention**
   ```typescript
   // Enforced in code (lib/modules/content/media/upload.ts)
   const fileName = `${organizationId}/${folder}/${timestamp}-${sanitizedName}`;
   // Example: org-123/media/1696789123456-company-logo.webp
   ```

**Storage Client Usage:**
```typescript
// lib/modules/content/media/upload.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for server uploads
);

const { data, error } = await supabase.storage
  .from('media')
  .upload(fileName, buffer, {
    contentType: mimeType,
    upsert: false
  });
```

**See Also:** `STORAGE-BUCKETS.md` for complete bucket setup guide

---

## 🔒 Row Level Security (RLS)

### What is RLS?

**Row Level Security** = PostgreSQL feature that filters rows based on user context

**Why we use it:**
- Multi-tenant data isolation
- Organization-based access control
- Security at database level (not just app level)
- Works with Prisma queries automatically

### RLS in Migrations

**RLS policies are defined in SQL migrations:**

```sql
-- Example from a Prisma migration:
-- shared/prisma/migrations/XXXXXX_create_customers_table/migration.sql

-- 1. Create table
CREATE TABLE "customers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id")
);

-- 2. Enable RLS
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users see own org customers"
ON "customers"
FOR SELECT
USING (organization_id = current_setting('app.current_org_id'));

CREATE POLICY "Users insert own org customers"
ON "customers"
FOR INSERT
WITH CHECK (organization_id = current_setting('app.current_org_id'));
```

### Setting RLS Context

**Before each query, set user context:**

```typescript
// lib/database/prisma.ts (middleware)
await prisma.$executeRaw`
  SET app.current_user_id = ${userId};
  SET app.current_org_id = ${orgId};
`;

// Now all queries auto-filter by RLS
const customers = await prisma.customer.findMany();
// Only returns customers where organization_id = current_org_id
```

**See Also:** `RLS-POLICIES.md` for complete RLS reference

---

## 🚀 Migration Workflow with Supabase

### How Migrations Work

**Prisma migrations include:**
1. Table creation (DDL)
2. RLS policies (SQL)
3. Indexes (SQL)
4. Constraints (SQL)

**Application process:**
```bash
# 1. Create migration locally
cd (platform)
npm run db:migrate
# Creates: shared/prisma/migrations/XXXXXX_migration_name/migration.sql

# 2. Review migration SQL
npm run db:apply
# Shows SQL including RLS policies

# 3. Apply to Supabase
# Ask Claude: "Apply the latest migration to Supabase production"
# Uses: mcp__supabase-production__apply_migration

# 4. Verify
npm run db:sync
# Confirms schema matches database
```

### Migration SQL Structure

**Typical migration file:**
```sql
-- ============================================
-- DDL: Create tables
-- ============================================
CREATE TABLE "users" (...);

-- ============================================
-- RLS: Enable and create policies
-- ============================================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON "users" ...;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX "users_email_idx" ON "users"("email");
```

**All of this is applied to Supabase via MCP tool or Dashboard.**

---

## 🛠️ Supabase Dashboard Operations

### Common Tasks

**1. View Tables**
- Go to: Table Editor
- Shows all tables with data
- ⚠️ **DON'T use Claude's MCP `list_tables` tool** (18k tokens!)
- ✅ **DO read:** `shared/prisma/SCHEMA-QUICK-REF.md` (500 tokens)

**2. Run SQL**
- Go to: SQL Editor
- Paste migration SQL
- Execute
- Use for: Applying migrations manually

**3. Check RLS Policies**
- Go to: Authentication → Policies
- View all table policies
- Test policies with SQL
- See also: `npm run db:check-rls` (script coming)

**4. View Logs**
- Go to: Logs → Postgres
- Debug query issues
- Check RLS policy violations
- Monitor performance

**5. Manage Storage**
- Go to: Storage
- View buckets and files
- Check RLS policies on buckets
- Test file access

---

## 📊 Monitoring & Debugging

### Check RLS Policy Violations

```sql
-- Run in SQL Editor to see RLS violations
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test RLS as User

```sql
-- Set user context (simulates app behavior)
SET app.current_user_id = 'user-123';
SET app.current_org_id = 'org-456';

-- Now test queries
SELECT * FROM customers;
-- Should only return org-456's customers
```

### Check Database Performance

```sql
-- Slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## ⚠️ Critical Warnings

### NEVER Do This

```typescript
// ❌ Expose service role key to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // WRONG! Client-side code
);

// ❌ Skip RLS context setting
const data = await prisma.customer.findMany();
// Without RLS context, might expose all orgs' data!

// ❌ Disable RLS in production
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;  // NEVER!

// ❌ Use MCP list_tables for schema inspection
// Wastes 18k tokens - read docs instead
```

### ALWAYS Do This

```typescript
// ✅ Service role ONLY on server
'use server';  // Ensures server-only
const supabase = createClient(..., SERVICE_ROLE_KEY!);

// ✅ Set RLS context before queries
await setRLSContext(userId, orgId);
const data = await prisma.customer.findMany();

// ✅ Keep RLS enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

// ✅ Read local schema docs
cat shared/prisma/SCHEMA-QUICK-REF.md  // 500 tokens vs 18k!
```

---

## 📚 Related Documentation

- **Prisma Schema:** `../prisma/README.md` - Schema & migration workflow
- **Storage Buckets:** `STORAGE-BUCKETS.md` - Complete bucket setup
- **RLS Policies:** `RLS-POLICIES.md` - Policy patterns & examples
- **Platform Auth:** `../../(platform)/AUTH-ONBOARDING-GUIDE.md` - Auth implementation
- **Root CLAUDE:** `../../CLAUDE.md` - Database operations workflow

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide:** https://supabase.com/docs/guides/storage

---

**Last Updated:** 2025-10-06
**Supabase Project:** Check `.env.local` for current project ID
