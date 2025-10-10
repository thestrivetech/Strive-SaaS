# 🔒 STRIVE SAAS SECURITY PROTOCOL

**Enterprise-Level Security Standards & Testing Framework**

**Version:** 1.0.0
**Last Updated:** 2025-10-09
**Status:** 🔴 PRE-PRODUCTION (CRITICAL BLOCKERS PRESENT)
**Repository:** Strive-SaaS (Tri-Fold Architecture)

---

## 📋 TABLE OF CONTENTS

1. [Critical Pre-Deployment Blockers](#1-critical-pre-deployment-blockers)
2. [Authentication Security](#2-authentication-security)
3. [Authorization & RBAC](#3-authorization--rbac)
4. [Multi-Tenancy Isolation](#4-multi-tenancy-isolation)
5. [API Security](#5-api-security)
6. [Data Security & Encryption](#6-data-security--encryption)
7. [File Upload & Storage Security](#7-file-upload--storage-security)
8. [Secret Management](#8-secret-management)
9. [Security Testing Framework](#9-security-testing-framework)
10. [Monitoring & Logging](#10-monitoring--logging)
11. [Incident Response Procedures](#11-incident-response-procedures)
12. [Compliance & Auditing](#12-compliance--auditing)
13. [Security Test Scripts](#13-security-test-scripts)
14. [Appendix](#14-appendix)

---

## 1. CRITICAL PRE-DEPLOYMENT BLOCKERS

### ⚠️ DEPLOYMENT STATUS: 🔴 BLOCKED

**These issues MUST be resolved before deploying to production. Failure to do so will result in critical security vulnerabilities.**

### 1.1 Localhost Authentication Bypass (CRITICAL)

**Status:** 🔴 ACTIVE - Security vulnerability if deployed
**Priority:** P0 - MUST FIX BEFORE PRODUCTION
**Impact:** Complete authentication bypass on production if deployed

**Location:**
- `(platform)/lib/auth/auth-helpers.ts` - Lines 85-124 and 222-260
- `(platform)/lib/middleware/auth.ts` - Check for isLocalhost bypass

**Vulnerability:**
```typescript
// ❌ CURRENT CODE (REMOVE BEFORE PRODUCTION):
const isLocalhost = typeof window === 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

if (isLocalhost) {
  // Returns mock user - ANYONE can access without authentication!
  return enhanceUser({
    id: 'demo-user',
    email: 'demo@strivetech.ai',
    role: 'USER',
    subscription_tier: 'ELITE',
    // ... mock user data
  });
}
```

**Required Actions:**

1. **Remove localhost bypass from `getCurrentUser()`** (line ~85)
   ```typescript
   // DELETE lines 85-124 in lib/auth/auth-helpers.ts
   ```

2. **Remove localhost bypass from `requireAuth()`** (line ~222)
   ```typescript
   // DELETE lines 222-260 in lib/auth/auth-helpers.ts
   ```

3. **Test with real authentication**
   ```bash
   # 1. Remove bypass code
   # 2. Create real Supabase test users
   # 3. Test all protected routes
   # 4. Verify authentication works correctly
   ```

4. **Verify multi-tenancy isolation**
   ```typescript
   // Test that users CANNOT access other organizations' data
   // Test that unauthenticated requests are rejected
   ```

**Verification Checklist:**
- [ ] Search codebase for `isLocalhost` - should return 0 results in auth files
- [ ] All protected routes redirect to /login when unauthenticated
- [ ] Real Supabase authentication works correctly
- [ ] No mock user data returned in production environment
- [ ] Multi-tenancy isolation verified (see section 4.4)

---

### 1.2 Server-Only Imports Issue

**Status:** 🟡 NEEDS INVESTIGATION
**Priority:** P1 - INVESTIGATE BEFORE PRODUCTION

**Issue:**
Server-only imports were removed to make the build work for showcase. This needs to be investigated and fixed.

**Investigation Steps:**

1. **Check if `server-only` package is installed**
   ```bash
   cd (platform)
   npm list server-only
   # If not installed: npm install server-only
   ```

2. **Identify files that should be server-only**
   ```bash
   # Search for files that handle sensitive operations
   grep -r "SUPABASE_SERVICE_ROLE_KEY" lib/
   grep -r "DATABASE_URL" lib/
   grep -r "prisma" lib/
   ```

3. **Add server-only import to sensitive files**
   ```typescript
   // At TOP of file (before any other imports)
   import 'server-only';

   // ... rest of file
   ```

4. **Test that client components cannot import server modules**
   ```bash
   npm run build
   # Should fail if client tries to import server-only modules
   ```

**Files that MUST have `server-only`:**
- `lib/database/prisma.ts`
- `lib/auth/auth-helpers.ts`
- All files in `lib/modules/**/actions.ts`
- All files in `lib/modules/**/queries.ts`
- Any file that uses `SUPABASE_SERVICE_ROLE_KEY`

**Verification:**
- [ ] `server-only` package installed
- [ ] All server-only files have `import 'server-only'` at top
- [ ] Build succeeds
- [ ] Client components cannot import server-only modules (build fails if attempted)

---

### 1.3 Environment Variable Validation

**Status:** 🟡 REQUIRED BEFORE PRODUCTION
**Priority:** P1 - VALIDATE ALL SECRETS

**Required Environment Variables:**

```bash
# CRITICAL SECRETS (NEVER COMMIT)
SUPABASE_SERVICE_ROLE_KEY="..."           # Bypasses RLS - admin only
DOCUMENT_ENCRYPTION_KEY="..."             # 32-byte hex - lost key = lost documents!
STRIPE_SECRET_KEY="..."                   # Payment processing
DATABASE_URL="..."                        # Contains password
JWT_SECRET="..."                          # Session encryption

# SUPABASE (PUBLIC + PRIVATE)
NEXT_PUBLIC_SUPABASE_URL="..."           # Public
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."      # Public
SUPABASE_SERVICE_ROLE_KEY="..."          # PRIVATE (server-only)

# STRIPE (PUBLIC + PRIVATE)
STRIPE_PUBLISHABLE_KEY="pk_..."          # Public
STRIPE_SECRET_KEY="sk_..."               # PRIVATE (server-only)
STRIPE_WEBHOOK_SECRET="whsec_..."        # PRIVATE (webhook validation)

# AI PROVIDERS (OPTIONAL)
OPENROUTER_API_KEY="sk-or-v1-..."
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-proj-..."

# RATE LIMITING
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Validation Script:**

Create `(platform)/scripts/validate-env.ts`:

```typescript
import 'dotenv/config';

const REQUIRED_SECRETS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'DOCUMENT_ENCRYPTION_KEY',
];

const PRODUCTION_REQUIRED = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

function validateEnvironment() {
  const missing: string[] = [];
  const weak: string[] = [];

  // Check required secrets
  for (const key of REQUIRED_SECRETS) {
    if (!process.env[key]) {
      missing.push(key);
    } else if (process.env[key]?.includes('your_') || process.env[key]?.includes('xxxxx')) {
      weak.push(key);
    }
  }

  // Check production-only secrets
  if (process.env.NODE_ENV === 'production') {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  // Validate DOCUMENT_ENCRYPTION_KEY format
  if (process.env.DOCUMENT_ENCRYPTION_KEY) {
    const key = process.env.DOCUMENT_ENCRYPTION_KEY;
    if (key.length !== 64 || !/^[0-9a-f]{64}$/i.test(key)) {
      console.error('❌ DOCUMENT_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
      process.exit(1);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  if (weak.length > 0) {
    console.error('⚠️  Warning: Placeholder values detected:');
    weak.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

validateEnvironment();
```

**Run before deployment:**
```bash
cd (platform)
npx tsx scripts/validate-env.ts
```

**Checklist:**
- [ ] All required secrets are set in `.env.local` (development)
- [ ] All required secrets are set in Vercel (production)
- [ ] No placeholder values (e.g., "your_token_here", "xxxxx")
- [ ] DOCUMENT_ENCRYPTION_KEY is 64 hex characters
- [ ] `.env.local` is in `.gitignore` (NEVER commit!)
- [ ] `.env.example` has placeholders only

---

### 1.4 ESLint Error Resolution

**Status:** 🔴 BLOCKING BUILD
**Priority:** P0 - MUST FIX BEFORE PRODUCTION

**Current Errors:**
- **25 instances of `react/no-unescaped-entities`** - Blocks build
- **291 instances of `@typescript-eslint/no-explicit-any`** - Warnings (tech debt)

**Fix `react/no-unescaped-entities` errors:**

```bash
cd (platform)
npm run lint 2>&1 | grep "no-unescaped-entities"
```

**Common fixes:**

```tsx
// ❌ WRONG - Unescaped apostrophe
<p>Don't use unescaped quotes</p>

// ✅ CORRECT - Use HTML entities
<p>Don&apos;t use unescaped quotes</p>

// ✅ CORRECT - Use curly braces
<p>{"Don't use unescaped quotes"}</p>

// ❌ WRONG - Unescaped quotes
<p>"Hello world"</p>

// ✅ CORRECT
<p>&quot;Hello world&quot;</p>
```

**Fix TypeScript `any` types (tech debt):**

```typescript
// ❌ AVOID
function handleData(data: any) { ... }

// ✅ PREFER
import { z } from 'zod';

const DataSchema = z.object({
  id: z.string(),
  name: z.string(),
});

function handleData(data: z.infer<typeof DataSchema>) { ... }
```

**Verification:**
```bash
cd (platform)
npm run lint        # MUST show 0 errors
npm run build       # MUST succeed
```

**Checklist:**
- [ ] All 25 `react/no-unescaped-entities` errors fixed
- [ ] `npm run build` succeeds with 0 errors
- [ ] Plan to fix 291 `any` type warnings (tech debt, not blocking)

---

### 1.5 Pre-Deployment Security Checklist

**Run this checklist BEFORE every production deployment:**

```bash
#!/bin/bash
# (platform)/scripts/pre-deployment-security-check.sh

echo "🔒 Running Pre-Deployment Security Checks..."

# 1. Check for localhost bypass
echo "1. Checking for localhost authentication bypass..."
if grep -r "isLocalhost" lib/auth/; then
  echo "❌ FAIL: Localhost bypass still present in auth files"
  exit 1
fi

# 2. Validate environment variables
echo "2. Validating environment variables..."
npx tsx scripts/validate-env.ts || exit 1

# 3. Run linter
echo "3. Running ESLint..."
npm run lint || exit 1

# 4. Run type check
echo "4. Running TypeScript type check..."
npx tsc --noEmit || exit 1

# 5. Run security tests
echo "5. Running security tests..."
npm test -- --testPathPattern=security || exit 1

# 6. Run build
echo "6. Running production build..."
npm run build || exit 1

# 7. Check for secrets in code
echo "7. Scanning for exposed secrets..."
if grep -r "sk_live_" .; then
  echo "❌ FAIL: Production Stripe key found in code"
  exit 1
fi

echo "✅ All pre-deployment security checks passed!"
```

**Make executable:**
```bash
chmod +x (platform)/scripts/pre-deployment-security-check.sh
```

**Run before every deployment:**
```bash
cd (platform)
./scripts/pre-deployment-security-check.sh
```

---

## 2. AUTHENTICATION SECURITY

### 2.1 Supabase Auth Architecture

**Provider:** Supabase Auth
**Strategy:** JWT tokens in httpOnly cookies
**Flow:** Lazy sync (Supabase Auth → Prisma database)

**Authentication Flow:**

```
┌─────────────────────────────────────────┐
│  1. User Sign Up/Login                  │
│     ↓                                    │
│  2. Supabase Auth (password/OAuth)      │
│     ↓                                    │
│  3. JWT token in httpOnly cookie        │
│     ↓                                    │
│  4. Session check: getCurrentUser()     │
│     ↓                                    │
│  5. Lazy sync to Prisma (if needed)     │
│     ↓                                    │
│  6. No organization? → /onboarding      │
│     ↓                                    │
│  7. Access granted to dashboard         │
└─────────────────────────────────────────┘
```

### 2.2 Authentication Testing

**Test 1: Unauthenticated Access Rejection**

```typescript
// __tests__/security/auth/unauthenticated.test.ts
import { getCurrentUser } from '@/lib/auth/auth-helpers';

describe('Unauthenticated Access', () => {
  it('should reject access without authentication', async () => {
    // Clear all cookies
    // Attempt to access protected route
    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it('should redirect to login for protected routes', async () => {
    const response = await fetch('/real-estate/dashboard', {
      redirect: 'manual'
    });

    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('location')).toBe('/login');
  });
});
```

**Test 2: Session Validation**

```typescript
// __tests__/security/auth/session-validation.test.ts
import { createSupabaseServerClient } from '@/lib/auth/auth-helpers';

describe('Session Validation', () => {
  it('should validate JWT server-side', async () => {
    const supabase = await createSupabaseServerClient();

    // getUser() validates JWT server-side (secure)
    const { data: { user }, error } = await supabase.auth.getUser();

    expect(error).toBeNull();
    expect(user).toBeDefined();
    expect(user?.id).toBeTruthy();
  });

  it('should reject expired tokens', async () => {
    // Set expired JWT in cookie
    // Attempt to access protected route

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('should reject tampered tokens', async () => {
    // Modify JWT payload
    // Attempt to access protected route

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});
```

**Test 3: Password Security**

```typescript
describe('Password Security', () => {
  it('should enforce minimum password length', async () => {
    const result = await signUp('test@example.com', '12345'); // Too short

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('password');
  });

  it('should prevent password reuse', async () => {
    // TODO: Implement password history check
    // Supabase Auth doesn't have this built-in
    // May need custom validation
  });

  it('should hash passwords (Supabase handles this)', async () => {
    // Verify passwords are never stored in plaintext
    // Check database - password column should not exist in users table
  });
});
```

### 2.3 Authentication Security Checklist

**Development:**
- [ ] `getCurrentUser()` returns null when unauthenticated
- [ ] `requireAuth()` redirects to /login when unauthenticated
- [ ] JWT tokens are validated server-side (using getUser(), not getSession())
- [ ] Passwords are hashed (Supabase Auth handles this)
- [ ] Session cookies are httpOnly (prevents XSS access)
- [ ] Session cookies are Secure (HTTPS only in production)
- [ ] Session cookies are SameSite=Lax (CSRF protection)

**Production:**
- [ ] No localhost authentication bypass
- [ ] All protected routes require authentication
- [ ] OAuth providers configured (if used)
- [ ] Email verification enabled
- [ ] Password reset flow tested
- [ ] Rate limiting on auth endpoints (5 req/min)
- [ ] Failed login attempts are logged
- [ ] Account lockout after repeated failures (Supabase feature)

---

## 3. AUTHORIZATION & RBAC

### 3.1 Role-Based Access Control Architecture

**Dual-Role System:**

```typescript
interface User {
  // GLOBAL ROLE (platform-wide)
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';

  // ORGANIZATION ROLE (per-org)
  organization_members: [{
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    organization_id: string;
  }];

  // SUBSCRIPTION TIER (billing)
  subscription_tier: 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';
}
```

**Permission Hierarchy:**

```
SUPER_ADMIN (Platform Admin)
  └─> Full platform access
  └─> All organizations visible
  └─> Bypass subscription tiers
  └─> Access to /strive/platform-admin

ADMIN (Organization Admin)
  └─> Full organization access
  └─> Manage users & settings
  └─> Access to /admin

MODERATOR (Content Manager)
  └─> Manage content
  └─> Moderate users
  └─> Limited settings access

USER (Standard User)
  └─> Access to modules based on subscription tier
  └─> Create/edit own resources
```

### 3.2 RBAC Testing Framework

**Test 1: Global Role Enforcement**

```typescript
// __tests__/security/rbac/global-roles.test.ts
import { canAccessPlatformAdmin, canAccessAdminPanel } from '@/lib/auth/rbac';

describe('Global Role Enforcement', () => {
  it('should allow SUPER_ADMIN to access platform admin', () => {
    const user = { role: 'SUPER_ADMIN' as const };
    expect(canAccessPlatformAdmin(user.role)).toBe(true);
  });

  it('should deny ADMIN access to platform admin', () => {
    const user = { role: 'ADMIN' as const };
    expect(canAccessPlatformAdmin(user.role)).toBe(false);
  });

  it('should allow ADMIN to access org admin panel', () => {
    const user = { role: 'ADMIN' as const };
    expect(canAccessAdminPanel(user.role)).toBe(true);
  });

  it('should deny USER access to admin panels', () => {
    const user = { role: 'USER' as const };
    expect(canAccessAdminPanel(user.role)).toBe(false);
    expect(canAccessPlatformAdmin(user.role)).toBe(false);
  });
});
```

**Test 2: Organization Role Enforcement**

```typescript
describe('Organization Role Enforcement', () => {
  it('should allow OWNER to delete members', () => {
    const user = { organizationRole: 'OWNER' };
    expect(canDeleteMembers({ organizationRole: user.organizationRole })).toBe(true);
  });

  it('should deny MEMBER from deleting members', () => {
    const user = { organizationRole: 'MEMBER' };
    expect(canDeleteMembers({ organizationRole: user.organizationRole })).toBe(false);
  });

  it('should allow VIEWER to view content only', () => {
    const user = { organizationRole: 'VIEWER' };
    expect(canViewCustomer({ role: 'USER' })).toBe(true);
    expect(canManageCustomer({ role: 'USER' })).toBe(true); // USER can manage
  });
});
```

**Test 3: Subscription Tier Enforcement**

```typescript
describe('Subscription Tier Enforcement', () => {
  it('should deny FREE tier access to CRM', () => {
    const user = { subscriptionTier: 'FREE' };
    expect(canAccessFeature(user, 'crm')).toBe(false);
  });

  it('should allow STARTER tier access to CRM', () => {
    const user = { subscriptionTier: 'STARTER' };
    expect(canAccessFeature(user, 'crm')).toBe(true);
  });

  it('should allow ELITE tier access to all features', () => {
    const user = { subscriptionTier: 'ELITE' };
    expect(canAccessFeature(user, 'crm')).toBe(true);
    expect(canAccessFeature(user, 'reid')).toBe(true);
    expect(canAccessFeature(user, 'reid-ai')).toBe(true);
  });

  it('should bypass tier restrictions for SUPER_ADMIN', () => {
    const user = {
      role: 'SUPER_ADMIN' as const,
      subscriptionTier: 'FREE'
    };
    expect(canUsePremiumTools(user.subscriptionTier, user.role)).toBe(true);
  });
});
```

**Test 4: Server Action Protection**

```typescript
// __tests__/security/rbac/server-actions.test.ts
import { createCustomer } from '@/lib/modules/crm/contacts/actions';

describe('Server Action Protection', () => {
  it('should require authentication for createCustomer', async () => {
    // Clear auth context
    // Attempt to create customer

    await expect(createCustomer({
      name: 'Test Customer',
      email: 'test@example.com'
    })).rejects.toThrow('Unauthorized');
  });

  it('should check RBAC permissions before mutation', async () => {
    // Authenticate as VIEWER (no write access)
    // Attempt to create customer

    await expect(createCustomer({
      name: 'Test Customer',
      email: 'test@example.com'
    })).rejects.toThrow('Forbidden');
  });
});
```

### 3.3 RBAC Security Checklist

**Code Review:**
- [ ] All Server Actions have `requireAuth()` at the top
- [ ] All Server Actions check RBAC permissions before mutations
- [ ] All admin routes check `canAccessAdminPanel()` or `canAccessPlatformAdmin()`
- [ ] Feature access checks subscription tier via `canAccessFeature()`
- [ ] No hardcoded permission checks (use RBAC functions)

**Testing:**
- [ ] All global roles tested (SUPER_ADMIN, ADMIN, MODERATOR, USER)
- [ ] All organization roles tested (OWNER, ADMIN, MEMBER, VIEWER)
- [ ] All subscription tiers tested (FREE, CUSTOM, STARTER, GROWTH, ELITE, ENTERPRISE)
- [ ] SUPER_ADMIN bypass tested for tier restrictions
- [ ] Server Actions reject unauthenticated requests
- [ ] Server Actions reject unauthorized requests (wrong role)

**Production:**
- [ ] Middleware enforces RBAC on all protected routes
- [ ] API routes check permissions before processing
- [ ] Dashboard navigation hides items based on role
- [ ] Feature gates display upgrade prompts for insufficient tier
- [ ] Audit logs capture permission changes

---

## 4. MULTI-TENANCY ISOLATION

### 4.1 Multi-Tenancy Architecture

**Two-Layer Security:**

```
┌─────────────────────────────────────────┐
│  Layer 1: Prisma Middleware             │  ← Application-level filtering
│  - Auto-inject organizationId filters   │
│  - Block queries without tenant context │
│  - Audit logging                        │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  Layer 2: RLS Policies                  │  ← Database-level filtering
│  - PostgreSQL Row Level Security        │
│  - Backup if middleware bypassed        │
│  - Defense in depth                     │
└─────────────────┬───────────────────────┘
                  ▼
        ┌──────────────────┐
        │  Supabase PostgreSQL │
        └──────────────────┘
```

**Critical Principle:** EVERY query MUST be filtered by `organization_id`

### 4.2 RLS Policy Testing

**Test 1: Organization Isolation**

```typescript
// __tests__/security/multi-tenancy/organization-isolation.test.ts
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { prisma } from '@/lib/database/prisma';

describe('Organization Isolation', () => {
  beforeEach(async () => {
    // Create test data for two organizations
    await prisma.customer.createMany({
      data: [
        { id: 'cust-1', name: 'Org 1 Customer', organization_id: 'org-1' },
        { id: 'cust-2', name: 'Org 2 Customer', organization_id: 'org-2' },
      ]
    });
  });

  it('should only return org-1 data when tenant context is org-1', async () => {
    setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

    const customers = await prisma.customer.findMany();

    expect(customers).toHaveLength(1);
    expect(customers[0].organization_id).toBe('org-1');
  });

  it('should only return org-2 data when tenant context is org-2', async () => {
    setTenantContext({ organizationId: 'org-2', userId: 'user-2' });

    const customers = await prisma.customer.findMany();

    expect(customers).toHaveLength(1);
    expect(customers[0].organization_id).toBe('org-2');
  });

  it('should prevent cross-organization data access', async () => {
    setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

    // Attempt to access org-2's customer
    const customer = await prisma.customer.findUnique({
      where: { id: 'cust-2' } // Belongs to org-2
    });

    expect(customer).toBeNull(); // Should be filtered by RLS
  });
});
```

**Test 2: Cross-Organization Write Prevention**

```typescript
describe('Cross-Organization Write Prevention', () => {
  it('should prevent creating records for other organizations', async () => {
    setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

    // Attempt to create customer for org-2
    await expect(prisma.customer.create({
      data: {
        name: 'Malicious Customer',
        organization_id: 'org-2' // WRONG ORG!
      }
    })).rejects.toThrow(); // RLS policy should block
  });

  it('should prevent updating records of other organizations', async () => {
    setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

    // Attempt to update org-2's customer
    await expect(prisma.customer.update({
      where: { id: 'cust-2' }, // Belongs to org-2
      data: { name: 'Hacked Name' }
    })).rejects.toThrow(); // Should fail
  });

  it('should prevent deleting records of other organizations', async () => {
    setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

    // Attempt to delete org-2's customer
    await expect(prisma.customer.delete({
      where: { id: 'cust-2' } // Belongs to org-2
    })).rejects.toThrow(); // Should fail
  });
});
```

**Test 3: RLS Policy Verification**

```sql
-- Run in Supabase SQL Editor
-- Test organization isolation

-- 1. Set tenant context (simulates org-1 user)
SET app.current_user_id = 'user-1';
SET app.current_org_id = 'org-1';

-- 2. Query customers (should only return org-1 customers)
SELECT * FROM customers;
-- Expected: Only customers where organization_id = 'org-1'

-- 3. Attempt to insert for different org (should fail)
INSERT INTO customers (id, name, organization_id)
VALUES ('cust-999', 'Hacker Customer', 'org-2');
-- Expected: ERROR - new row violates row-level security policy

-- 4. Reset context
RESET app.current_user_id;
RESET app.current_org_id;

-- 5. Query without context (should return 0 rows)
SELECT * FROM customers;
-- Expected: 0 rows (RLS blocks all without context)
```

### 4.3 Manual Penetration Testing

**Test Scenario: Attempt Cross-Organization Access**

1. **Setup:**
   ```bash
   # Create two test organizations and users
   # Org 1: org-test-1 (user: test1@example.com)
   # Org 2: org-test-2 (user: test2@example.com)
   ```

2. **Test Case 1: API Manipulation**
   ```javascript
   // 1. Login as test1@example.com (org-test-1)
   // 2. Open browser DevTools → Network tab
   // 3. Create a customer (observe the request)
   // 4. Modify the request to use org-test-2's ID
   // 5. Send modified request

   // Expected Result: Request should FAIL (403 Forbidden or data not created)
   ```

3. **Test Case 2: Direct Database Query (if Supabase client exposed)**
   ```javascript
   // In browser console (SHOULD NOT WORK)
   const { data } = await supabase
     .from('customers')
     .select('*')
     .eq('organization_id', 'org-test-2'); // Different org!

   // Expected: Empty array (RLS filters it out)
   ```

4. **Test Case 3: URL Parameter Manipulation**
   ```
   # 1. Login as test1@example.com (org-test-1)
   # 2. Access customer detail page:
   #    /real-estate/crm/customers/{customer-id-from-org-2}

   # Expected: 404 Not Found or Forbidden (cannot access)
   ```

### 4.4 Multi-Tenancy Security Checklist

**Code Review:**
- [ ] All Prisma queries use `withTenantContext()`
- [ ] No direct Prisma queries without tenant context
- [ ] No `$queryRaw` usage (bypasses middleware)
- [ ] All Server Actions set tenant context
- [ ] organizationId automatically injected by middleware

**Database:**
- [ ] All multi-tenant tables have `organization_id` column
- [ ] All multi-tenant tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] All multi-tenant tables have SELECT, INSERT, UPDATE, DELETE policies
- [ ] RLS policies use `current_setting('app.current_org_id')`
- [ ] Indexes created on `organization_id` for performance

**Testing:**
- [ ] Organization isolation test passes (Test 1)
- [ ] Cross-organization write prevention test passes (Test 2)
- [ ] RLS policy SQL verification passes (Test 3)
- [ ] Manual penetration test passes (section 4.3)
- [ ] No data leaks between organizations

**Production:**
- [ ] RLS policies enabled on ALL multi-tenant tables
- [ ] Middleware active in production build
- [ ] Tenant context set for every authenticated request
- [ ] Audit logs capture organization context
- [ ] Regular RLS policy reviews (quarterly)

---

## 5. API SECURITY

### 5.1 API Route Protection

**All API routes MUST be protected with:**
1. Authentication check
2. RBAC permission check
3. Rate limiting
4. Input validation
5. CORS headers (if needed)

**Example: Protected API Route**

```typescript
// app/api/v1/crm/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessCRM } from '@/lib/auth/rbac';
import { z } from 'zod';

const CustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Require authentication
    const user = await requireAuth();

    // 2. Check RBAC permissions
    if (!canAccessCRM(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. Validate input
    const body = await req.json();
    const validated = CustomerSchema.parse(body);

    // 4. Process request (tenant context auto-applied)
    const customer = await createCustomer(validated);

    // 5. Return response
    return NextResponse.json({ data: customer }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[API] POST /api/v1/crm/customers failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5.2 Rate Limiting

**Configuration:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Authentication endpoints: 5 requests per minute per IP
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

// API endpoints: 100 requests per minute per IP
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

// Webhook endpoints: 1000 requests per minute
export const webhookRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:webhook',
});
```

**Testing Rate Limiting:**

```typescript
// __tests__/security/api/rate-limiting.test.ts
describe('Rate Limiting', () => {
  it('should block after 5 auth requests per minute', async () => {
    // Make 5 requests to /api/auth/login
    for (let i = 0; i < 5; i++) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'test' })
      });
      expect(response.status).not.toBe(429);
    }

    // 6th request should be blocked
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'test' })
    });
    expect(response.status).toBe(429);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
  });

  it('should include rate limit headers', async () => {
    const response = await fetch('/api/v1/crm/customers');

    expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });
});
```

### 5.3 Input Validation

**Always use Zod for validation:**

```typescript
import { z } from 'zod';

// Define schemas
const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone').optional(),
  company: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// Validate in API route
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const validated = CreateCustomerSchema.parse(body);
    // Use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
  }
}
```

**Common Validation Patterns:**

```typescript
// Email validation
z.string().email()

// UUID validation
z.string().uuid()

// Enum validation
z.enum(['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'])

// Date validation
z.string().datetime()
z.date()

// Number with constraints
z.number().int().positive().max(1000)

// Array with min/max length
z.array(z.string()).min(1).max(10)

// Object with nested validation
z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email()
  }),
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().positive()
  }))
})
```

### 5.4 SQL Injection Prevention

**✅ SAFE: Use Prisma (parameterized queries)**

```typescript
// Prisma automatically escapes all inputs
const customer = await prisma.customer.findFirst({
  where: { email: userInput } // Safe - parameterized
});
```

**❌ DANGEROUS: Raw SQL with string concatenation**

```typescript
// NEVER DO THIS
const customers = await prisma.$queryRaw(`
  SELECT * FROM customers WHERE email = '${userInput}'
`); // Vulnerable to SQL injection!
```

**✅ SAFE: Raw SQL with parameters**

```typescript
// If you MUST use raw SQL, use parameterized queries
const customers = await prisma.$queryRaw`
  SELECT * FROM customers WHERE email = ${userInput}
`; // Safe - parameterized
```

**SQL Injection Test:**

```typescript
// __tests__/security/api/sql-injection.test.ts
describe('SQL Injection Prevention', () => {
  it('should not be vulnerable to SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE customers; --";

    // Attempt SQL injection via API
    const response = await fetch('/api/v1/crm/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: maliciousInput,
        email: 'test@example.com'
      })
    });

    // Request should succeed (input treated as literal string)
    expect(response.status).not.toBe(500);

    // Verify customers table still exists
    const customers = await prisma.customer.findMany();
    expect(customers).toBeDefined(); // Table not dropped
  });
});
```

### 5.5 XSS Prevention

**✅ SAFE: React automatically escapes**

```tsx
// React escapes all content by default
function CustomerCard({ customer }) {
  return (
    <div>
      <h3>{customer.name}</h3> {/* Safe - auto-escaped */}
      <p>{customer.description}</p> {/* Safe - auto-escaped */}
    </div>
  );
}
```

**❌ DANGEROUS: dangerouslySetInnerHTML**

```tsx
// AVOID unless absolutely necessary
function UnsafeComponent({ htmlContent }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    // Vulnerable to XSS if htmlContent is user-provided!
  );
}
```

**✅ SAFE: Sanitize before using dangerouslySetInnerHTML**

```typescript
import DOMPurify from 'isomorphic-dompurify';

function SafeComponent({ userHtml }) {
  const sanitized = DOMPurify.sanitize(userHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**XSS Test:**

```typescript
// __tests__/security/xss-prevention.test.ts
describe('XSS Prevention', () => {
  it('should escape malicious scripts in customer names', async () => {
    const maliciousName = '<script>alert("XSS")</script>';

    const customer = await createCustomer({
      name: maliciousName,
      email: 'test@example.com'
    });

    // Render component
    render(<CustomerCard customer={customer} />);

    // Verify script is escaped (not executed)
    expect(screen.getByText(maliciousName)).toBeInTheDocument();
    // Script should NOT execute (no alert)
  });
});
```

### 5.6 CSRF Protection

**Next.js provides built-in CSRF protection for Server Actions.**

**For API routes, use CSRF tokens:**

```typescript
// lib/csrf.ts
import { createHash, randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  // Implement CSRF verification logic
  // Compare token from request with token from session
  return token === sessionToken;
}
```

**Middleware CSRF check:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Check CSRF for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('X-CSRF-Token');
    const session = await getSession();

    if (!csrfToken || !verifyCSRFToken(csrfToken, session.csrfToken)) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  return NextResponse.next();
}
```

### 5.7 API Security Checklist

**Authentication:**
- [ ] All API routes require authentication (except public endpoints)
- [ ] JWT tokens validated server-side
- [ ] Unauthenticated requests return 401

**Authorization:**
- [ ] All API routes check RBAC permissions
- [ ] Unauthorized requests return 403
- [ ] Users cannot access other organizations' data

**Rate Limiting:**
- [ ] Auth endpoints: 5 req/min per IP
- [ ] API endpoints: 100 req/min per IP
- [ ] Rate limit headers included in responses
- [ ] Rate limiting enforced in middleware

**Input Validation:**
- [ ] All inputs validated with Zod schemas
- [ ] Invalid inputs return 400 with error details
- [ ] File uploads validate type and size
- [ ] No raw SQL with user input (use Prisma)

**Security Headers:**
- [ ] CORS headers configured correctly
- [ ] Content-Security-Policy set
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HSTS) in production

**Testing:**
- [ ] Rate limiting tests pass
- [ ] SQL injection tests pass
- [ ] XSS prevention tests pass
- [ ] CSRF protection tests pass
- [ ] API authentication tests pass

---

## 6. DATA SECURITY & ENCRYPTION

### 6.1 Database Encryption

**Encryption at Rest:**
- Supabase provides automatic encryption at rest for all data
- AES-256 encryption for PostgreSQL database
- No additional configuration needed

**Encryption in Transit:**
- All database connections use SSL/TLS
- `DATABASE_URL` includes `?sslmode=require`
- No unencrypted database connections allowed

### 6.2 Document Encryption (AES-256-GCM)

**Use Case:** Transaction documents, receipts, sensitive files

**Setup:**

```bash
# Generate encryption key (DO THIS ONCE)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local (NEVER COMMIT)
DOCUMENT_ENCRYPTION_KEY="<64-hex-character-key>"
```

**Encryption Implementation:**

```typescript
// lib/storage/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export function encryptDocument(buffer: Buffer): Buffer {
  // Get encryption key from environment
  const key = Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY!, 'hex');

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Generate random salt
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);

  // Get auth tag
  const tag = cipher.getAuthTag();

  // Combine: salt + iv + tag + encrypted data
  return Buffer.concat([salt, iv, tag, encrypted]);
}

export function decryptDocument(buffer: Buffer): Buffer {
  // Get encryption key from environment
  const key = Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY!, 'hex');

  // Extract components
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Derive key
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}
```

**Usage:**

```typescript
// Upload encrypted document
import { encryptDocument } from '@/lib/storage/encryption';

export async function uploadDocument(file: File, organizationId: string) {
  // Read file as buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Encrypt
  const encrypted = encryptDocument(buffer);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${organizationId}/transactions/${file.name}.enc`, encrypted, {
      contentType: 'application/octet-stream',
      upsert: false
    });

  return { data, error };
}

// Download and decrypt document
export async function downloadDocument(path: string) {
  // Download from Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .download(path);

  if (error) throw error;

  // Read as buffer
  const arrayBuffer = await data.arrayBuffer();
  const encrypted = Buffer.from(arrayBuffer);

  // Decrypt
  const decrypted = decryptDocument(encrypted);

  return decrypted;
}
```

**Encryption Testing:**

```typescript
// __tests__/security/encryption.test.ts
import { encryptDocument, decryptDocument } from '@/lib/storage/encryption';

describe('Document Encryption', () => {
  it('should encrypt and decrypt correctly', () => {
    const original = Buffer.from('Secret document content');

    const encrypted = encryptDocument(original);
    const decrypted = decryptDocument(encrypted);

    expect(decrypted.toString()).toBe(original.toString());
  });

  it('should produce different ciphertext for same plaintext', () => {
    const plaintext = Buffer.from('Same content');

    const encrypted1 = encryptDocument(plaintext);
    const encrypted2 = encryptDocument(plaintext);

    // Different IV/salt = different ciphertext
    expect(encrypted1).not.toEqual(encrypted2);

    // But both decrypt correctly
    expect(decryptDocument(encrypted1).toString()).toBe('Same content');
    expect(decryptDocument(encrypted2).toString()).toBe('Same content');
  });

  it('should fail decryption with wrong key', () => {
    const original = Buffer.from('Secret');
    const encrypted = encryptDocument(original);

    // Change encryption key
    const originalKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    process.env.DOCUMENT_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

    // Decryption should fail
    expect(() => decryptDocument(encrypted)).toThrow();

    // Restore key
    process.env.DOCUMENT_ENCRYPTION_KEY = originalKey;
  });
});
```

### 6.3 PII (Personally Identifiable Information) Handling

**PII Data Types:**
- Names
- Email addresses
- Phone numbers
- Physical addresses
- SSN / Tax IDs
- Financial information

**PII Protection Guidelines:**

1. **Minimize Collection:**
   - Only collect PII that is absolutely necessary
   - Use optional fields when possible
   - Allow users to delete their PII

2. **Encrypt Sensitive PII:**
   ```typescript
   // Encrypt SSN before storing
   const encryptedSSN = encrypt(customer.ssn);
   await prisma.customer.update({
     where: { id: customer.id },
     data: { ssn_encrypted: encryptedSSN }
   });
   ```

3. **Mask PII in Logs:**
   ```typescript
   // DON'T log full SSN
   console.log('SSN:', customer.ssn); // ❌

   // Mask sensitive data
   console.log('SSN:', `***-**-${customer.ssn.slice(-4)}`); // ✅
   ```

4. **Secure Deletion:**
   ```typescript
   // Soft delete with PII redaction
   await prisma.customer.update({
     where: { id: customerId },
     data: {
       is_deleted: true,
       email: '[REDACTED]',
       phone: '[REDACTED]',
       ssn_encrypted: null,
       deleted_at: new Date()
     }
   });
   ```

### 6.4 Data Security Checklist

**Encryption:**
- [ ] Database encryption at rest enabled (Supabase default)
- [ ] All connections use SSL/TLS
- [ ] DOCUMENT_ENCRYPTION_KEY is 64 hex characters (32 bytes)
- [ ] Encryption key stored securely (never committed)
- [ ] Encryption key backed up securely (lost key = lost documents!)

**PII Protection:**
- [ ] PII collection minimized
- [ ] Sensitive PII encrypted before storage
- [ ] PII masked in logs and error messages
- [ ] Secure deletion process implemented
- [ ] Data retention policy documented

**Testing:**
- [ ] Encryption/decryption tests pass
- [ ] Key rotation procedure tested
- [ ] PII masking tests pass
- [ ] Secure deletion tests pass

---

## 7. FILE UPLOAD & STORAGE SECURITY

### 7.1 Supabase Storage Architecture

**Buckets:**
- `media` - User-uploaded images/files (platform)
- `documents` - Transaction documents (platform) - ENCRYPTED
- `receipts` - Expense receipts (platform)
- `avatars` - User profile pictures (all projects)

**Organization-Scoped Storage:**

```
media/
├── org-123/
│   ├── properties/
│   │   ├── 2025-01-01-house-1.jpg
│   │   └── 2025-01-02-house-2.jpg
│   └── team/
│       └── 2025-01-03-team-photo.jpg
└── org-456/
    └── properties/
        └── 2025-01-04-apartment.jpg
```

### 7.2 RLS Policies for Storage

**Create RLS policies for Supabase Storage:**

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload to their own org folder
CREATE POLICY "Users can upload to own org folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id IN ('media', 'receipts') AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()::text
    LIMIT 1
  )
);

-- Policy: Users can read their own org's files
CREATE POLICY "Users can read own org files"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('media', 'receipts') AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()::text
    LIMIT 1
  )
);

-- Policy: Users can update their own org's files
CREATE POLICY "Users can update own org files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id IN ('media', 'receipts') AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()::text
    LIMIT 1
  )
);

-- Policy: Users can delete their own org's files
CREATE POLICY "Users can delete own org files"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('media', 'receipts') AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM organization_members
    WHERE user_id = auth.uid()::text
    LIMIT 1
  )
);

-- ENCRYPTED DOCUMENTS BUCKET (stricter policies)
CREATE POLICY "Only org admins can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE om.user_id = auth.uid()::text
    AND om.role IN ('OWNER', 'ADMIN')
    LIMIT 1
  )
);
```

### 7.3 File Upload Validation

**Validate file type, size, and name:**

```typescript
// lib/storage/validation.ts
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain'
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size: 5MB'
    };
  }

  // Check filename for malicious patterns
  if (file.name.includes('..') || file.name.includes('/')) {
    return {
      valid: false,
      error: 'Invalid filename'
    };
  }

  return { valid: true };
}

export function validateDocument(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT'
    };
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size: 10MB'
    };
  }

  // Check filename
  if (file.name.includes('..') || file.name.includes('/')) {
    return {
      valid: false,
      error: 'Invalid filename'
    };
  }

  return { valid: true };
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '_')           // Replace multiple dots
    .slice(0, 255);                    // Limit length
}
```

**Upload with validation:**

```typescript
// Server Action
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { validateImage, sanitizeFilename } from '@/lib/storage/validation';
import { createClient } from '@supabase/supabase-js';

export async function uploadPropertyImage(formData: FormData) {
  const user = await requireAuth();
  const file = formData.get('file') as File;

  // Validate file
  const validation = validateImage(file);
  if (!validation.valid) {
    return { error: validation.error };
  }

  // Sanitize filename
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(file.name);
  const filename = `${user.organizationId}/properties/${timestamp}-${sanitized}`;

  // Upload to Supabase Storage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
  );

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    console.error('[Upload] Failed:', error);
    return { error: 'Upload failed' };
  }

  return { data };
}
```

### 7.4 File Upload Security Testing

```typescript
// __tests__/security/file-upload.test.ts
describe('File Upload Security', () => {
  it('should reject files larger than 5MB', async () => {
    // Create 6MB file
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    );

    const validation = validateImage(largeFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('too large');
  });

  it('should reject non-image files', async () => {
    const file = new File(['content'], 'test.exe', {
      type: 'application/x-msdownload'
    });

    const validation = validateImage(file);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Invalid file type');
  });

  it('should sanitize malicious filenames', () => {
    const malicious = '../../../etc/passwd';
    const sanitized = sanitizeFilename(malicious);

    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
  });

  it('should prevent path traversal in uploads', async () => {
    const file = new File(['content'], '../../../evil.jpg', {
      type: 'image/jpeg'
    });

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadPropertyImage(formData);

    // Should either reject or sanitize filename
    expect(result.error).toBeDefined();
  });
});
```

### 7.5 File Storage Security Checklist

**RLS Policies:**
- [ ] RLS enabled on storage.objects
- [ ] Users can only upload to their org folder
- [ ] Users can only read their org's files
- [ ] Users cannot access other organizations' files
- [ ] Documents bucket requires OWNER/ADMIN role

**Validation:**
- [ ] File type validation (whitelist only)
- [ ] File size limits enforced (5MB images, 10MB docs)
- [ ] Filename sanitization (no path traversal)
- [ ] Content-Type header validation

**Encryption:**
- [ ] Sensitive documents encrypted before upload
- [ ] Encryption key secured and backed up

**Testing:**
- [ ] File type validation tests pass
- [ ] File size validation tests pass
- [ ] Filename sanitization tests pass
- [ ] Path traversal prevention tests pass
- [ ] Cross-organization access tests fail (RLS blocks)

---

## 8. SECRET MANAGEMENT

### 8.1 Environment Variables

**Critical Secrets (NEVER COMMIT):**

```bash
# .env.local - LOCAL DEVELOPMENT ONLY
SUPABASE_SERVICE_ROLE_KEY="..."
DOCUMENT_ENCRYPTION_KEY="..."
STRIPE_SECRET_KEY="..."
DATABASE_URL="..."
DIRECT_URL="..."
JWT_SECRET="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Public Variables (safe to commit in .env.example):**

```bash
# .env.example - TEMPLATE ONLY
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 8.2 Secret Rotation Policy

**Rotation Schedule:**

| Secret | Rotation Frequency | Trigger |
|--------|-------------------|---------|
| SUPABASE_SERVICE_ROLE_KEY | Every 90 days | Quarterly |
| DOCUMENT_ENCRYPTION_KEY | Never (data loss risk) | Emergency only |
| STRIPE_SECRET_KEY | Every 90 days | Quarterly |
| DATABASE_URL password | Every 90 days | Quarterly |
| JWT_SECRET | Every 90 days | Quarterly |
| API keys (AI providers) | Every 90 days | Quarterly |
| ALL SECRETS | Immediately | Staff departure, breach |

**Rotation Procedure:**

1. **Generate New Secret:**
   ```bash
   # Example: Rotate Supabase token
   # 1. Go to Supabase Dashboard → Settings → API
   # 2. Generate new service role key
   # 3. Copy new key
   ```

2. **Update Environment Variables:**
   ```bash
   # Local development
   # Edit .env.local → Replace old key with new key

   # Production (Vercel)
   # 1. Go to Vercel Dashboard → Settings → Environment Variables
   # 2. Edit SUPABASE_SERVICE_ROLE_KEY
   # 3. Replace with new key
   # 4. Redeploy application
   ```

3. **Test New Secret:**
   ```bash
   # Run validation script
   npx tsx scripts/validate-env.ts

   # Test authentication
   npm run dev
   # Login and verify functionality
   ```

4. **Revoke Old Secret:**
   ```bash
   # After confirming new secret works
   # Go back to Supabase Dashboard
   # Delete old service role key
   ```

5. **Document Rotation:**
   ```
   # Create rotation log entry
   Date: 2025-01-09
   Secret: SUPABASE_SERVICE_ROLE_KEY
   Reason: Quarterly rotation
   Old Key: sbp_old... (first 10 chars)
   New Key: sbp_new... (first 10 chars)
   Rotated By: [Name]
   ```

### 8.3 GitHub Secret Scanning

**Setup GitHub Secret Scanning:**

1. **Enable in Repository:**
   ```
   1. Go to: https://github.com/thestrivetech/Strive-SaaS/settings/security_analysis
   2. Enable: "Secret scanning"
   3. Enable: "Push protection" (blocks commits with secrets)
   ```

2. **Configure Alerts:**
   ```
   - Alert recipients: Repository admins
   - Notification frequency: Immediate
   - Auto-close resolved alerts: Enabled
   ```

3. **Test Secret Scanning:**
   ```bash
   # Attempt to commit a secret (will be blocked)
   echo "SUPABASE_KEY=sbp_test123" >> test-secret.txt
   git add test-secret.txt
   git commit -m "Test secret detection"
   # Expected: Push blocked with secret warning
   ```

### 8.4 Pre-Commit Hooks for Secret Detection

**Install detect-secrets:**

```bash
pip install detect-secrets
```

**Initialize baseline:**

```bash
detect-secrets scan > .secrets.baseline
```

**Add to .pre-commit-config.yaml:**

```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package-lock.json
```

**Install pre-commit:**

```bash
npm install -g pre-commit
pre-commit install
```

**Test:**

```bash
# Create file with fake secret
echo "API_KEY=sk_test_fake123" >> test.txt
git add test.txt
git commit -m "Test"
# Expected: Commit blocked with secret detection warning
```

### 8.5 Vercel Environment Variables

**Setup in Vercel:**

1. **Add Environment Variables:**
   ```
   1. Go to: https://vercel.com/thestrivetech/strive-saas/settings/environment-variables
   2. Add all secrets from .env.local
   3. Select environments: Production, Preview, Development
   4. Click "Save"
   ```

2. **Sensitive Variables:**
   ```
   ✅ Mark as "Sensitive" (hidden in logs):
   - SUPABASE_SERVICE_ROLE_KEY
   - DOCUMENT_ENCRYPTION_KEY
   - STRIPE_SECRET_KEY
   - DATABASE_URL
   - JWT_SECRET
   ```

3. **Verify Deployment:**
   ```bash
   # After deployment, check logs for errors
   # Ensure no secrets are printed in logs
   ```

### 8.6 Secret Management Checklist

**Development:**
- [ ] `.env.local` exists and has all required secrets
- [ ] `.env.local` is in `.gitignore` (NEVER commit!)
- [ ] `.env.example` has placeholders only (safe to commit)
- [ ] No secrets in source code
- [ ] No secrets in git history

**Production:**
- [ ] All secrets set in Vercel environment variables
- [ ] Sensitive variables marked as "Sensitive"
- [ ] Environment variables validated before deployment
- [ ] No secrets in build logs

**Secret Scanning:**
- [ ] GitHub secret scanning enabled
- [ ] Push protection enabled (blocks commits with secrets)
- [ ] Pre-commit hooks installed
- [ ] detect-secrets baseline created
- [ ] Regular secret scans scheduled (quarterly)

**Rotation:**
- [ ] Rotation schedule documented
- [ ] Rotation procedure tested
- [ ] Calendar reminders set (quarterly)
- [ ] Emergency rotation procedure documented

---

## 9. SECURITY TESTING FRAMEWORK

### 9.1 Automated Security Tests

**Test Structure:**

```
__tests__/
├── security/
│   ├── auth/
│   │   ├── authentication.test.ts
│   │   ├── session-validation.test.ts
│   │   └── password-security.test.ts
│   ├── rbac/
│   │   ├── global-roles.test.ts
│   │   ├── organization-roles.test.ts
│   │   └── subscription-tiers.test.ts
│   ├── multi-tenancy/
│   │   ├── organization-isolation.test.ts
│   │   ├── rls-policies.test.ts
│   │   └── cross-org-prevention.test.ts
│   ├── api/
│   │   ├── rate-limiting.test.ts
│   │   ├── input-validation.test.ts
│   │   ├── sql-injection.test.ts
│   │   └── xss-prevention.test.ts
│   ├── encryption/
│   │   ├── document-encryption.test.ts
│   │   └── key-rotation.test.ts
│   └── file-upload/
│       ├── validation.test.ts
│       ├── size-limits.test.ts
│       └── path-traversal.test.ts
```

**Run Security Tests:**

```bash
cd (platform)

# Run all security tests
npm test -- --testPathPattern=security

# Run specific security test category
npm test -- --testPathPattern=security/auth
npm test -- --testPathPattern=security/multi-tenancy
npm test -- --testPathPattern=security/api

# Run with coverage
npm test -- --testPathPattern=security --coverage
```

### 9.2 Manual Security Testing

**Checklist for Manual Testing:**

**Authentication Testing:**
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Failure
- [ ] Login with expired session → Redirect to login
- [ ] Logout → Session cleared, redirect to login
- [ ] Access protected route while unauthenticated → Redirect to login
- [ ] Password reset flow → Email sent, token works, password updated

**Authorization Testing:**
- [ ] SUPER_ADMIN can access /strive/platform-admin
- [ ] ADMIN cannot access /strive/platform-admin (403 Forbidden)
- [ ] ADMIN can access /admin
- [ ] USER cannot access /admin (403 Forbidden)
- [ ] FREE tier cannot access CRM (upgrade prompt)
- [ ] STARTER tier can access CRM
- [ ] ELITE tier can access all features

**Multi-Tenancy Testing:**
- [ ] User in org-1 cannot see org-2's customers
- [ ] User in org-1 cannot create customer for org-2
- [ ] User in org-1 cannot update org-2's customer
- [ ] User in org-1 cannot delete org-2's customer
- [ ] API call with org-1 token returns only org-1 data

**API Security Testing:**
- [ ] Unauthenticated API call → 401 Unauthorized
- [ ] Unauthorized API call (wrong role) → 403 Forbidden
- [ ] API call with invalid input → 400 Bad Request with details
- [ ] API call exceeding rate limit → 429 Too Many Requests
- [ ] SQL injection attempt → Escaped, no damage
- [ ] XSS attempt in input → Escaped in output

**File Upload Testing:**
- [ ] Upload 6MB image → Rejected (too large)
- [ ] Upload .exe file → Rejected (invalid type)
- [ ] Upload with path traversal (../../../) → Rejected or sanitized
- [ ] Upload to another org's folder → Rejected (RLS)
- [ ] Download another org's file → Rejected (RLS)

### 9.3 Penetration Testing

**Use Burp Suite or OWASP ZAP:**

1. **Setup Proxy:**
   ```
   1. Install Burp Suite Community Edition
   2. Configure browser proxy: localhost:8080
   3. Navigate to http://localhost:3000
   4. Burp will capture all requests
   ```

2. **Test Cases:**

   **A. Authentication Bypass:**
   ```
   1. Capture login request
   2. Modify JWT token payload
   3. Send request
   4. Expect: 401 Unauthorized
   ```

   **B. Session Fixation:**
   ```
   1. Obtain session cookie before login
   2. Login
   3. Check if session cookie changed
   4. Expect: New session cookie issued
   ```

   **C. IDOR (Insecure Direct Object Reference):**
   ```
   1. Login as user-1 (org-1)
   2. Access /api/v1/crm/customers/[org-2-customer-id]
   3. Expect: 403 Forbidden or 404 Not Found
   ```

   **D. Parameter Tampering:**
   ```
   1. Intercept POST /api/v1/crm/customers
   2. Modify organizationId in request body
   3. Send request
   4. Expect: 403 Forbidden (RLS blocks)
   ```

   **E. Rate Limit Bypass:**
   ```
   1. Send 5 login requests
   2. Change X-Forwarded-For header
   3. Send 6th request
   4. Expect: Still rate limited (use IP + session)
   ```

3. **Document Findings:**
   ```
   Finding: IDOR vulnerability in customer API
   Severity: High
   Steps to Reproduce:
   1. ...
   2. ...
   Expected Behavior: 403 Forbidden
   Actual Behavior: Data returned
   Recommendation: Add RLS policy check
   ```

### 9.4 Dependency Scanning

**npm audit:**

```bash
cd (platform)

# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix including breaking changes
npm audit fix --force

# Generate audit report
npm audit --json > security-audit-report.json
```

**Automate with GitHub Actions:**

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  push:
    branches: [main, platform]
  pull_request:
    branches: [main, platform]

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd (platform)
          npm ci

      - name: Run npm audit
        run: |
          cd (platform)
          npm audit --audit-level=moderate

      - name: Run security tests
        run: |
          cd (platform)
          npm test -- --testPathPattern=security

      - name: Upload audit results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: security-audit
          path: (platform)/npm-audit.json
```

### 9.5 OWASP Top 10 Coverage

**Verify protection against OWASP Top 10 (2021):**

| # | Vulnerability | Protection | Tested |
|---|---------------|------------|--------|
| A01 | Broken Access Control | RBAC + RLS + Middleware | ✅ |
| A02 | Cryptographic Failures | TLS + AES-256-GCM + Supabase encryption | ✅ |
| A03 | Injection | Prisma (parameterized) + Zod validation | ✅ |
| A04 | Insecure Design | Security-first architecture + defense in depth | ✅ |
| A05 | Security Misconfiguration | Environment validation + secure defaults | ✅ |
| A06 | Vulnerable Components | npm audit + automated scanning | ✅ |
| A07 | Authentication Failures | Supabase Auth + JWT + rate limiting | ✅ |
| A08 | Software/Data Integrity | Vercel signed builds + RLS | ✅ |
| A09 | Logging Failures | Supabase logs + audit trails | ⏳ |
| A10 | SSRF | Input validation + URL whitelisting | ⏳ |

**✅ = Implemented and tested**
**⏳ = Partially implemented**

### 9.6 Security Testing Checklist

**Automated Tests:**
- [ ] All security tests pass (100% pass rate)
- [ ] Test coverage ≥ 80% for security-critical code
- [ ] CI/CD runs security tests on every PR
- [ ] Security tests run on schedule (weekly)

**Manual Tests:**
- [ ] Authentication bypass attempts fail
- [ ] Authorization checks enforced (roles + tiers)
- [ ] Multi-tenancy isolation verified
- [ ] Rate limiting enforced
- [ ] Input validation prevents injection

**Penetration Testing:**
- [ ] Burp Suite / OWASP ZAP scan completed
- [ ] IDOR vulnerabilities tested and blocked
- [ ] Session management vulnerabilities tested
- [ ] Parameter tampering blocked
- [ ] Findings documented and remediated

**Dependency Scanning:**
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] Automated scanning enabled in CI/CD
- [ ] Vulnerable dependencies updated
- [ ] Security patches applied promptly

---

## 10. MONITORING & LOGGING

### 10.1 Security Event Logging

**Events to Log:**

```typescript
// lib/logging/security-logger.ts
export enum SecurityEvent {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Multi-Tenancy
  CROSS_ORG_ACCESS_ATTEMPT = 'CROSS_ORG_ACCESS_ATTEMPT',

  // API Security
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',

  // Data Security
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  DECRYPTION_FAILURE = 'DECRYPTION_FAILURE',

  // File Upload
  FILE_UPLOAD_REJECTED = 'FILE_UPLOAD_REJECTED',

  // Suspicious Activity
  MULTIPLE_FAILED_LOGINS = 'MULTIPLE_FAILED_LOGINS',
  UNUSUAL_API_ACTIVITY = 'UNUSUAL_API_ACTIVITY',
}

export interface SecurityLogEntry {
  event: SecurityEvent;
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export async function logSecurityEvent(entry: SecurityLogEntry) {
  // Log to console (dev) or external service (prod)
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY]', entry);
  } else {
    // TODO: Send to logging service (Datadog, Sentry, etc.)
    await sendToLoggingService(entry);
  }

  // Store in database for audit trail
  await prisma.securityLog.create({
    data: {
      event: entry.event,
      user_id: entry.userId,
      organization_id: entry.organizationId,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      details: entry.details,
      severity: entry.severity,
      timestamp: entry.timestamp,
    }
  });
}
```

**Usage:**

```typescript
// Log failed login
await logSecurityEvent({
  event: SecurityEvent.LOGIN_FAILURE,
  ipAddress: req.ip,
  userAgent: req.headers.get('user-agent'),
  timestamp: new Date(),
  details: { email: sanitizeEmail(email) },
  severity: 'medium',
});

// Log unauthorized access
await logSecurityEvent({
  event: SecurityEvent.UNAUTHORIZED_ACCESS,
  userId: user.id,
  organizationId: user.organizationId,
  ipAddress: req.ip,
  timestamp: new Date(),
  details: { route: req.nextUrl.pathname },
  severity: 'high',
});

// Log cross-org access attempt
await logSecurityEvent({
  event: SecurityEvent.CROSS_ORG_ACCESS_ATTEMPT,
  userId: user.id,
  organizationId: user.organizationId,
  timestamp: new Date(),
  details: {
    attemptedOrgId: targetOrgId,
    resourceType: 'customer',
    resourceId: customerId
  },
  severity: 'critical',
});
```

### 10.2 Real-Time Alerting

**Setup Alerts for Critical Events:**

```typescript
// lib/alerting/security-alerts.ts
export async function checkForSuspiciousActivity(userId: string) {
  // Check for multiple failed logins (last 5 minutes)
  const failedLogins = await prisma.securityLog.count({
    where: {
      user_id: userId,
      event: SecurityEvent.LOGIN_FAILURE,
      timestamp: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      }
    }
  });

  if (failedLogins >= 5) {
    await sendSecurityAlert({
      type: 'MULTIPLE_FAILED_LOGINS',
      userId,
      count: failedLogins,
      action: 'Consider locking account or investigating',
    });
  }
}

export async function sendSecurityAlert(alert: {
  type: string;
  userId?: string;
  organizationId?: string;
  count?: number;
  action?: string;
}) {
  // Send to Slack, email, or alerting service
  if (process.env.SLACK_SECURITY_WEBHOOK) {
    await fetch(process.env.SLACK_SECURITY_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Security Alert: ${alert.type}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Type:* ${alert.type}\n*User ID:* ${alert.userId || 'N/A'}\n*Count:* ${alert.count || 'N/A'}\n*Recommended Action:* ${alert.action}`
            }
          }
        ]
      })
    });
  }
}
```

### 10.3 Supabase Audit Logs

**Access Supabase Logs:**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/[project-id]/logs
   ```

2. **Filter by Event Type:**
   ```
   - Auth logs: User logins, signups, logouts
   - Database logs: Queries, errors, slow queries
   - Storage logs: File uploads, downloads, deletions
   - API logs: Edge function calls
   ```

3. **Export Logs for Analysis:**
   ```sql
   -- Query auth logs (last 7 days)
   SELECT
     created_at,
     user_id,
     email,
     event_type,
     metadata
   FROM auth.audit_log_entries
   WHERE created_at >= NOW() - INTERVAL '7 days'
   ORDER BY created_at DESC;
   ```

### 10.4 Monitoring Checklist

**Logging:**
- [ ] Security events logged (auth, authz, data access)
- [ ] Logs include user ID, org ID, IP address, timestamp
- [ ] PII masked in logs (email addresses, names)
- [ ] Logs stored securely (encrypted at rest)
- [ ] Log retention policy defined (90 days)

**Alerting:**
- [ ] Critical events trigger real-time alerts
- [ ] Multiple failed logins alert sent
- [ ] Unauthorized access attempts alert sent
- [ ] Unusual API activity alert sent
- [ ] Alert recipients configured (Slack, email)

**Monitoring:**
- [ ] Supabase audit logs reviewed weekly
- [ ] Failed authentication attempts tracked
- [ ] Rate limiting metrics monitored
- [ ] API error rates monitored
- [ ] Database performance monitored

---

## 11. INCIDENT RESPONSE PROCEDURES

### 11.1 Security Incident Types

**Level 1 - Critical:**
- Data breach (customer data exposed)
- Authentication bypass vulnerability
- RLS policy failure (cross-org data leak)
- Ransomware / malware infection
- DOCUMENT_ENCRYPTION_KEY exposure

**Level 2 - High:**
- API secret exposure (Stripe, Supabase)
- Multiple unauthorized access attempts
- DDoS attack
- Privilege escalation vulnerability

**Level 3 - Medium:**
- Single failed login from unusual location
- Rate limit bypass
- Input validation bypass
- Non-critical dependency vulnerability

**Level 4 - Low:**
- Outdated dependency (non-security)
- Minor configuration issue
- Informational security scan finding

### 11.2 Incident Response Plan

**Step 1: Detection & Assessment (15 minutes)**

1. **Identify the incident:**
   - Alert received (automated or manual)
   - Verify it's a real incident (not false positive)
   - Classify severity level (1-4)

2. **Assess impact:**
   ```
   Questions to answer:
   - How many users affected?
   - How many organizations affected?
   - What data was accessed/exposed?
   - Is the vulnerability still active?
   - Can it be exploited again?
   ```

3. **Document initial findings:**
   ```
   Incident ID: INC-2025-001
   Date/Time: 2025-01-09 14:30 UTC
   Severity: Level 1 - Critical
   Type: RLS Policy Failure
   Impact: 5 organizations, 200 customers exposed
   Reported By: Automated monitoring
   ```

**Step 2: Containment (30 minutes)**

1. **Immediate actions:**
   ```bash
   # For authentication bypass
   - Force logout all users
   - Disable affected authentication method
   - Deploy hotfix if available

   # For data breach
   - Disable affected API endpoints
   - Revoke compromised credentials
   - Enable additional logging

   # For RLS failure
   - Disable affected features
   - Review and fix RLS policies
   - Verify fix in staging
   ```

2. **Communication:**
   ```
   Internal:
   - Notify incident response team
   - Notify engineering team
   - Notify management (if Level 1 or 2)

   External:
   - DO NOT notify customers yet (wait for full assessment)
   ```

**Step 3: Eradication (2-4 hours)**

1. **Fix the root cause:**
   ```typescript
   // Example: Fix RLS policy
   // BEFORE (vulnerable):
   CREATE POLICY "customers_select"
   ON customers FOR SELECT
   USING (true); -- WRONG! Allows all access

   // AFTER (secure):
   CREATE POLICY "customers_select"
   ON customers FOR SELECT
   USING (organization_id = current_setting('app.current_org_id'));
   ```

2. **Deploy fix:**
   ```bash
   # 1. Test fix in local environment
   # 2. Deploy to staging
   # 3. Verify fix in staging
   # 4. Deploy to production
   # 5. Verify fix in production
   ```

3. **Verify fix:**
   ```bash
   # Run security tests
   npm test -- --testPathPattern=security/multi-tenancy

   # Manual verification
   # 1. Login as org-1 user
   # 2. Attempt to access org-2 data
   # 3. Expect: 403 Forbidden (RLS blocks)
   ```

**Step 4: Recovery (1-2 hours)**

1. **Restore normal operations:**
   ```
   - Re-enable affected features
   - Re-enable authentication methods
   - Monitor for anomalies
   ```

2. **Verify system integrity:**
   ```
   - Check database integrity
   - Verify RLS policies active
   - Verify no lingering vulnerabilities
   ```

**Step 5: Communication (Immediate)**

1. **Internal notification:**
   ```
   Subject: RESOLVED - Security Incident INC-2025-001

   Team,

   The security incident has been resolved.

   Summary:
   - Incident: RLS policy failure
   - Impact: 5 organizations, 200 customers
   - Root Cause: Missing organization_id check in RLS policy
   - Fix: Updated RLS policy, deployed to production
   - Verification: Security tests passed, manual verification completed

   Next Steps:
   - Customer notification (if required)
   - Post-incident review scheduled for [date]
   ```

2. **Customer notification (if Level 1 or 2):**
   ```
   Subject: Security Notice - Data Access Incident

   Dear [Customer Name],

   We are writing to inform you of a security incident that may have affected your data.

   What Happened:
   On [date], we discovered a vulnerability that allowed unauthorized access to customer data.

   What Data Was Affected:
   - Customer names and email addresses
   - No financial data, passwords, or SSNs were affected

   What We've Done:
   - Fixed the vulnerability immediately
   - Verified no unauthorized access occurred
   - Enhanced security monitoring

   What You Should Do:
   - No action required on your part
   - We recommend changing your password as a precaution

   Questions?
   Contact our security team at security@strivetech.ai
   ```

**Step 6: Post-Incident Review (1 week)**

1. **Schedule review meeting:**
   ```
   Attendees:
   - Engineering team
   - Security team
   - Management

   Agenda:
   1. Timeline of incident
   2. Root cause analysis
   3. Response effectiveness
   4. Lessons learned
   5. Action items for prevention
   ```

2. **Document lessons learned:**
   ```markdown
   # Post-Incident Review: INC-2025-001

   ## Timeline
   - 14:30 - Incident detected
   - 14:35 - Severity assessed (Level 1)
   - 14:40 - Containment actions taken
   - 16:00 - Fix developed and tested
   - 16:30 - Fix deployed to production
   - 17:00 - Verification completed

   ## Root Cause
   RLS policy was missing organization_id check, allowing users to access other organizations' data.

   ## What Went Well
   - Automated monitoring detected the issue
   - Incident response was fast (2.5 hours to resolution)
   - Fix was thoroughly tested before deployment

   ## What Could Be Improved
   - RLS policies should be reviewed before deployment
   - Automated tests should cover all RLS policies
   - Need better staging environment for testing

   ## Action Items
   - [ ] Add RLS policy tests to CI/CD (Owner: Engineering, Due: 2025-01-16)
   - [ ] Create RLS policy review checklist (Owner: Security, Due: 2025-01-16)
   - [ ] Improve staging environment (Owner: DevOps, Due: 2025-01-30)
   ```

### 11.3 Emergency Contacts

**Internal Team:**
```
Lead Engineer: [Name] - [Phone] - [Email]
Security Lead: [Name] - [Phone] - [Email]
CTO: [Name] - [Phone] - [Email]
CEO: [Name] - [Phone] - [Email]
```

**External Vendors:**
```
Supabase Support: support@supabase.io (Enterprise customers only)
Vercel Support: support@vercel.com
Stripe Security: security@stripe.com
```

**Escalation Path:**
```
Level 1 (Critical):
1. Notify Lead Engineer immediately
2. Notify CTO within 15 minutes
3. Notify CEO within 30 minutes

Level 2 (High):
1. Notify Lead Engineer immediately
2. Notify CTO within 1 hour

Level 3-4 (Medium/Low):
1. Create incident ticket
2. Notify Lead Engineer within 24 hours
```

### 11.4 Incident Response Checklist

**Detection & Assessment:**
- [ ] Incident verified (not false positive)
- [ ] Severity level classified (1-4)
- [ ] Impact assessed (users, orgs, data)
- [ ] Initial findings documented

**Containment:**
- [ ] Immediate actions taken (disable features, revoke access)
- [ ] Internal team notified
- [ ] Additional logging enabled
- [ ] Vulnerability cannot be exploited further

**Eradication:**
- [ ] Root cause identified
- [ ] Fix developed and tested
- [ ] Fix deployed to production
- [ ] Security tests pass

**Recovery:**
- [ ] Normal operations restored
- [ ] System integrity verified
- [ ] Monitoring active

**Communication:**
- [ ] Internal notification sent
- [ ] Customer notification sent (if required)
- [ ] Incident documented

**Post-Incident:**
- [ ] Post-incident review scheduled
- [ ] Lessons learned documented
- [ ] Action items assigned
- [ ] Preventive measures implemented

---

## 12. COMPLIANCE & AUDITING

### 12.1 Quarterly Security Audit Schedule

**Q1 (January - March):**
- Week 1: Dependency audit (npm audit)
- Week 6: RLS policy review
- Week 12: Full penetration test
- Week 13: Secret rotation

**Q2 (April - June):**
- Week 14: Code security review
- Week 20: API security audit
- Week 26: Authentication/authorization audit
- Week 27: Secret rotation

**Q3 (July - September):**
- Week 28: File upload security review
- Week 34: Multi-tenancy isolation testing
- Week 39: Full penetration test
- Week 40: Secret rotation

**Q4 (October - December):**
- Week 41: Encryption audit
- Week 47: Third-party security assessment
- Week 52: Annual security review
- Week 53: Secret rotation

### 12.2 Security Audit Checklist

**Code Review:**
- [ ] All Server Actions have authentication checks
- [ ] All Server Actions have RBAC permission checks
- [ ] All API routes validate input with Zod
- [ ] No SQL injection vulnerabilities (no raw SQL with user input)
- [ ] No XSS vulnerabilities (no dangerouslySetInnerHTML without sanitization)
- [ ] All secrets in environment variables (none in code)
- [ ] server-only import on all sensitive server files

**Database Security:**
- [ ] All multi-tenant tables have RLS enabled
- [ ] All multi-tenant tables have SELECT/INSERT/UPDATE/DELETE policies
- [ ] RLS policies use correct context variables (app.current_org_id)
- [ ] Database connections use SSL/TLS (sslmode=require)
- [ ] Database credentials rotated (last 90 days)

**Authentication & Authorization:**
- [ ] Supabase Auth configured correctly
- [ ] JWT tokens validated server-side (using getUser())
- [ ] Session cookies are httpOnly, Secure, SameSite
- [ ] RBAC functions used for all permission checks
- [ ] Subscription tier enforcement active

**API Security:**
- [ ] Rate limiting enforced (auth: 5/min, API: 100/min)
- [ ] All inputs validated with Zod schemas
- [ ] CORS configured correctly
- [ ] Security headers set (CSP, X-Frame-Options, etc.)

**File Upload Security:**
- [ ] File type validation (whitelist only)
- [ ] File size limits enforced (5MB images, 10MB docs)
- [ ] Filename sanitization (no path traversal)
- [ ] RLS policies on storage.objects
- [ ] Sensitive documents encrypted before upload

**Secret Management:**
- [ ] All secrets in .env.local (never committed)
- [ ] All secrets in Vercel environment variables
- [ ] GitHub secret scanning enabled
- [ ] Pre-commit hooks for secret detection
- [ ] Secrets rotated in last 90 days

**Monitoring & Logging:**
- [ ] Security events logged
- [ ] Supabase audit logs reviewed
- [ ] Failed authentication tracked
- [ ] Unauthorized access attempts logged
- [ ] Real-time alerts configured

### 12.3 Compliance Requirements

**GDPR (General Data Protection Regulation) - If serving EU customers:**

1. **Data Subject Rights:**
   - [ ] Right to access (users can download their data)
   - [ ] Right to erasure (users can delete their account)
   - [ ] Right to rectification (users can update their data)
   - [ ] Right to data portability (users can export their data)

2. **Data Processing:**
   - [ ] Privacy policy published
   - [ ] Cookie consent banner (if using cookies)
   - [ ] Data Processing Agreement with Supabase (check Supabase DPA)

3. **Data Breach Notification:**
   - [ ] Breach notification procedure (within 72 hours)
   - [ ] Data Protection Officer (DPO) appointed (if required)

**SOC 2 Preparation - For enterprise customers:**

1. **Security Controls:**
   - [ ] Access control policies documented
   - [ ] Multi-factor authentication available
   - [ ] Encryption at rest and in transit
   - [ ] Incident response plan documented

2. **Monitoring & Logging:**
   - [ ] Security event logging
   - [ ] Audit trail for data access
   - [ ] Regular security reviews

3. **Vendor Management:**
   - [ ] Supabase SOC 2 report reviewed
   - [ ] Vercel SOC 2 report reviewed
   - [ ] Stripe PCI DSS compliance verified

### 12.4 Third-Party Security Assessment

**Annual Security Audit by External Firm:**

1. **Select Auditor:**
   ```
   Options:
   - Big 4 consulting firms (Deloitte, PwC, EY, KPMG)
   - Specialized security firms (Trail of Bits, NCC Group)
   - Penetration testing services (Bugcrowd, HackerOne)
   ```

2. **Scope of Assessment:**
   ```
   - Application penetration testing
   - Infrastructure review
   - Code review (security-critical modules)
   - Social engineering testing
   - Cloud configuration review (Vercel, Supabase)
   ```

3. **Deliverables:**
   ```
   - Executive summary
   - Detailed findings report
   - Risk ratings (Critical, High, Medium, Low)
   - Remediation recommendations
   - Compliance gap analysis
   ```

4. **Remediation:**
   ```
   - Review findings with team
   - Prioritize by risk level
   - Create remediation plan
   - Implement fixes
   - Re-test to verify fixes
   ```

### 12.5 Compliance & Auditing Checklist

**Quarterly Audit:**
- [ ] Security audit checklist completed
- [ ] All critical/high findings remediated
- [ ] Medium/low findings prioritized
- [ ] Audit report saved and archived

**Annual Audit:**
- [ ] Third-party security assessment completed
- [ ] Compliance requirements reviewed (GDPR, SOC 2)
- [ ] Security policies updated
- [ ] Team security training completed

**Ongoing:**
- [ ] Dependency vulnerabilities monitored (weekly)
- [ ] Security patches applied promptly (within 7 days)
- [ ] Incident response plan tested (annually)
- [ ] Disaster recovery plan tested (annually)

---

## 13. SECURITY TEST SCRIPTS

### 13.1 Automated Test Runner

Create `(platform)/scripts/run-security-tests.sh`:

```bash
#!/bin/bash
# Run all security tests and generate report

set -e

echo "🔒 Running Security Test Suite..."
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test categories
CATEGORIES=(
  "auth"
  "rbac"
  "multi-tenancy"
  "api"
  "encryption"
  "file-upload"
)

# Results
TOTAL=0
PASSED=0
FAILED=0

# Run tests for each category
for category in "${CATEGORIES[@]}"; do
  echo ""
  echo "📋 Testing: $category"
  echo "-------------------"

  if npm test -- --testPathPattern=security/$category --silent 2>&1; then
    echo -e "${GREEN}✅ $category tests PASSED${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ $category tests FAILED${NC}"
    FAILED=$((FAILED + 1))
  fi

  TOTAL=$((TOTAL + 1))
done

# Summary
echo ""
echo "=================================="
echo "📊 Security Test Summary"
echo "=================================="
echo "Total categories: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

# Exit code
if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}⚠️  SECURITY TESTS FAILED${NC}"
  echo "Please fix failing tests before deploying to production"
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ ALL SECURITY TESTS PASSED${NC}"
  exit 0
fi
```

Make executable:
```bash
chmod +x (platform)/scripts/run-security-tests.sh
```

Run:
```bash
cd (platform)
./scripts/run-security-tests.sh
```

### 13.2 RLS Policy Verification Script

Create `(platform)/scripts/verify-rls-policies.sql`:

```sql
-- RLS Policy Verification Script
-- Run in Supabase SQL Editor

-- 1. Check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All multi-tenant tables should have rls_enabled = true

-- 2. List all RLS policies
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

-- Expected: Each multi-tenant table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 3. Test organization isolation
-- Set user context
SET app.current_user_id = 'test-user-1';
SET app.current_org_id = 'test-org-1';

-- Query customers (should only return org-1 customers)
SELECT organization_id, COUNT(*) as count
FROM customers
GROUP BY organization_id;
-- Expected: Only organization_id = 'test-org-1'

-- Try to insert for different org (should fail)
INSERT INTO customers (id, name, organization_id)
VALUES ('test-customer', 'Test', 'test-org-2');
-- Expected: ERROR - new row violates row-level security policy

-- Reset context
RESET app.current_user_id;
RESET app.current_org_id;

-- Query without context (should return 0 rows)
SELECT COUNT(*) FROM customers;
-- Expected: 0

-- 4. Verify RLS on storage.objects
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;
-- Expected: Policies that check organization folder
```

### 13.3 Secret Scanning Script

Create `(platform)/scripts/scan-for-secrets.sh`:

```bash
#!/bin/bash
# Scan codebase for exposed secrets

set -e

echo "🔍 Scanning for exposed secrets..."

# Patterns to search for
PATTERNS=(
  "sk_live_"              # Stripe live keys
  "sk_test_"              # Stripe test keys (warning)
  "sbp_"                  # Supabase tokens
  "eyJhbGci"              # JWT tokens
  "api_key"               # API keys
  "secret_key"            # Secret keys
  "-----BEGIN PRIVATE KEY-----"  # Private keys
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  echo "Searching for: $pattern"

  if grep -r "$pattern" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" . 2>/dev/null; then
    echo "❌ FOUND: $pattern"
    FOUND=$((FOUND + 1))
  fi
done

if [ $FOUND -gt 0 ]; then
  echo ""
  echo "⚠️  WARNING: $FOUND secret pattern(s) found in codebase"
  echo "Review the files above and ensure no real secrets are committed"
  exit 1
else
  echo ""
  echo "✅ No secrets found in codebase"
  exit 0
fi
```

Make executable:
```bash
chmod +x (platform)/scripts/scan-for-secrets.sh
```

---

## 14. APPENDIX

### 14.1 Security Headers Configuration

**Next.js Security Headers:**

Add to `(platform)/next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com"
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 14.2 Recommended Security Tools

**Development:**
- **ESLint Security Plugin:** `eslint-plugin-security`
- **detect-secrets:** Secret detection pre-commit hook
- **npm audit:** Dependency vulnerability scanning
- **TypeScript:** Type safety and null safety

**Testing:**
- **Jest:** Unit/integration testing
- **Playwright:** E2E testing
- **Burp Suite:** Manual penetration testing
- **OWASP ZAP:** Automated security scanning

**Production:**
- **Vercel:** Hosting with automatic HTTPS, DDoS protection
- **Supabase:** Database with built-in RLS, encryption at rest
- **Upstash Redis:** Rate limiting
- **Sentry:** Error tracking and monitoring
- **Datadog/LogRocket:** Application monitoring

**CI/CD:**
- **GitHub Actions:** Automated security tests
- **Dependabot:** Automated dependency updates
- **GitHub Secret Scanning:** Automatic secret detection
- **Vercel Preview Deployments:** Secure PR previews

### 14.3 Security Resources

**Documentation:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Stripe Security](https://stripe.com/docs/security)

**Training:**
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/) - Security training
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) - Free training
- [HackTheBox](https://www.hackthebox.com/) - Penetration testing practice

**Vulnerability Databases:**
- [CVE Database](https://cve.mitre.org/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [Snyk Vulnerability Database](https://security.snyk.io/)

### 14.4 Contact Information

**Security Team:**
```
Email: security@strivetech.ai
Emergency Hotline: [Phone Number]
PGP Key: [Public Key for encrypted communication]
```

**Vulnerability Disclosure:**
```
Email: security@strivetech.ai
Subject: [SECURITY] Vulnerability Report

Please include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We will respond within 48 hours.
```

---

## CHANGELOG

**Version 1.0.0 (2025-10-09):**
- Initial security protocol document
- Comprehensive coverage of all security layers
- Pre-deployment blockers documented
- Testing framework established
- Incident response procedures defined
- Compliance and auditing guidelines added

---

## DOCUMENT MAINTENANCE

**Review Schedule:** Quarterly (January, April, July, October)

**Responsible Party:** Security Team Lead

**Update Triggers:**
- New security vulnerability discovered
- New technology/framework adopted
- Compliance requirement changes
- Security incident learnings
- Third-party audit recommendations

**Version Control:** This document is version-controlled in the repository at `SECURITY-PROTOCOL.md`

---

**END OF SECURITY PROTOCOL**

*This document is confidential and for internal use only. Do not share outside the organization without approval from Security Team Lead.*
