# CLAUDE-PLATFORM.md

**Claude's Session Memory | v3.0 | Platform Project Standards**

## 🚨 CRITICAL: PRODUCTION DEPLOYMENT BLOCKERS

### 1. Localhost Authentication Bypass
**Status:** 🔴 ACTIVE - Security vulnerability if deployed to production

**Files Modified:**
- `lib/auth/auth-helpers.ts` - `requireAuth()` and `getCurrentUser()` functions
- `lib/middleware/auth.ts`

**What Changed:** Added `isLocalhost` checks that bypass authentication and return mock user data (demo-user, demo-org, ELITE tier)

**BEFORE PRODUCTION:**
1. Remove all `isLocalhost` checks from auth files
2. Implement proper Supabase authentication flow
3. Test all routes with real authentication
4. Verify RBAC permissions and multi-tenancy isolation

### 2. Server-Only Imports
**Status:** 🟡 NEEDS INVESTIGATION
- Server-only imports were removed to make build work
- Investigate and fix before production deployment

---

## 🔴 READ-BEFORE-EDIT MANDATE

**MANDATORY STEPS:**
1. **READ FIRST** - Always use Read tool before editing
2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files exist
3. **UPDATE, DON'T CREATE** - Prefer editing over creating new files
4. **ASK IF UNCERTAIN** - When unsure, ask the user

**Root Documentation:**
- [`../CLAUDE.md`](../CLAUDE.md) - Repository-wide standards
- [`../README.md`](../README.md) - Repository structure

---

## 🎯 PROJECT: Strive Tech SaaS Platform

**Location:** `(platform)/` → app.strivetech.ai
**Stack:** Next.js 15 + React 19.1.0 + TypeScript + Prisma + Supabase
**Database:** 42 models, 69 enums (synced from Supabase production DB)

**Purpose:** Enterprise B2B multi-tenant SaaS
- Admin Dashboard - System management, analytics
- Employee Workspace - Projects, CRM, tasks
- Client Portal - Project visibility, invoices
- AI Assistant (Sai) - Embedded chatbot

---

## ⚡ TECH STACK

```yaml
Core: Next.js 15, React 19.1.0, TypeScript 5.6+
Database: Supabase PostgreSQL + Prisma ORM
Auth: Supabase Auth (JWT in httpOnly cookies)
Storage: Supabase Storage + Row Level Security
State: TanStack Query + Zustand
Forms: React Hook Form + Zod
UI: shadcn/ui + Radix UI + Tailwind
Payments: Stripe
AI: OpenRouter + Groq
Testing: Jest + React Testing Library + Playwright
Coverage: 80% minimum
```

**Multi-Tenancy:** RLS (Row Level Security) - Organizations share tables, isolated by org_id
**RBAC:** Role-Based Access Control - User + Organization roles

---

## 🏗️ ARCHITECTURE: 3-LEVEL HIERARCHY

### Level 1: INDUSTRY
- Top-level business vertical (Real Estate, Healthcare, Legal, etc.)
- Location: `app/{industry}/`
- URL: `/real-estate/*`
- Currently: Real Estate fully implemented

### Level 2: MODULE
- Complete functional area (CRM, Transactions, Analytics, AI Hub)
- Location: `app/{industry}/{module}/`
- URL: `/real-estate/crm/*`

### Level 3: PAGE
- Dashboard, feature pages, or detail pages
- URL: `/real-estate/crm/contacts/`

### Frontend vs Backend Modules

**Frontend (Routes):** `app/real-estate/{module}/` - UI components, pages
**Backend (Logic):** `lib/modules/{module}/` - Server Actions, Prisma queries, business logic

**Example:**
```
User visits: app/real-estate/crm/contacts/page.tsx
     ↓ calls
Server Action: lib/modules/crm/contacts/actions.ts
     ↓ queries
Database: Supabase via Prisma
```

**Naming Note:** Some modules have different names for UX
- Frontend: `app/real-estate/workspace/` (user-friendly)
- Backend: `lib/modules/transactions/` (technical accuracy)

---

## 📁 KEY DIRECTORIES

```
(platform)/
├── app/
│   ├── (auth)/              # Login, signup, onboarding
│   ├── (marketing)/         # Landing, pricing, features
│   ├── settings/            # SHARED - User/org settings
│   ├── strive/              # SUPER_ADMIN only - Internal tools
│   └── real-estate/         # INDUSTRY - Real Estate
│       ├── dashboard/       # Industry dashboard
│       ├── crm/            # CRM module (contacts, leads, deals)
│       ├── workspace/      # Transaction management
│       ├── ai-hub/         # AI Hub (skeleton)
│       ├── rei-analytics/  # REI Intelligence (skeleton)
│       ├── expense-tax/    # Expense & Tax (skeleton)
│       ├── cms-marketing/  # CMS & Marketing (skeleton)
│       └── marketplace/    # Tool Marketplace (skeleton)
│
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/            # Shared components
│   ├── layouts/           # Layout components
│   └── real-estate/       # Real Estate components
│
├── lib/
│   ├── modules/           # Backend modules (13 consolidated)
│   │   ├── crm/          # CRM (contacts, leads, deals)
│   │   ├── transactions/ # Transactions (tasks, activity, listings)
│   │   └── [others]/     # Other modules
│   ├── auth/             # Auth middleware, RBAC
│   ├── database/         # Prisma client, middleware
│   ├── types/            # Type definitions
│   └── utils/            # Shared utilities
│
├── prisma/
│   ├── schema.prisma     # Database schema (42 models, 69 enums)
│   ├── SCHEMA-*.md       # Generated documentation
│   └── migrations/       # Migration history (empty - introspected)
│
└── __tests__/            # Test suites
```

### SUPER_ADMIN & /strive Directory

**Access:** SUPER_ADMIN role only (3 users: Grant Ramey, Garrett Holland, Jeff Meyer)
**Location:** `app/strive/`
**Routes:** `/strive/platform-admin`, `/strive/admin`, `/strive/dashboard`, `/strive/sid`

**Capabilities:**
- Full platform visibility across ALL organizations
- Platform-wide system administration
- Bypass all subscription tier gates
- All actions logged for security/compliance

**Development Note:** SUPER_ADMIN users bypass authentication on localhost (demo-user, demo-org)

---

## 🔗 ROLES & TIERS REFERENCE

**Global Roles:**
- SUPER_ADMIN - Platform admin (unrestricted, /strive access)
- ADMIN - Org admin (org-scoped)
- MODERATOR - Content/support moderator
- USER - Standard user

**Organization Roles:**
- OWNER - Organization creator
- ADMIN - Org administrator
- MEMBER - Standard member
- VIEWER - Read-only

**Subscription Tiers (per-seat):**
- FREE - SUPER_ADMIN assignment only
- CUSTOM - Pay-per-use marketplace
- STARTER ($299) - CRM, CMS, Transactions
- GROWTH ($699) - Starter + modules + tools
- ELITE ($999) - Everything + all tools
- ENTERPRISE (Custom) - Unlimited

---

## 🏭 MULTI-INDUSTRY SCALABILITY

**Pattern:**
```typescript
app/
├── real-estate/      // INDUSTRY 1 (implemented)
│   ├── crm/         // Modules
│   └── workspace/
├── healthcare/      // INDUSTRY 2 (future)
│   └── patients/
└── legal/          // INDUSTRY 3 (future)
    └── cases/

lib/
├── auth/           // Shared infrastructure
├── payments/       // Shared across all industries
└── modules/
    ├── crm/       // Shared when applicable
    └── real-estate/ // Industry-specific
```

**Adding New Industry:**
1. Create `app/[industry-name]/`
2. Create `components/[industry-name]/`
3. Create `lib/types/[industry-name]/`
4. Reuse shared infrastructure (auth, payments, AI)
5. Add industry selection in signup

---

## 🔴 CRITICAL RULES

### Multi-Tenancy & RLS

**1. ALWAYS Filter by Organization**
```typescript
// ✅ Correct
const projects = await prisma.project.findMany({
  where: { organizationId: session.user.organizationId }
});

// ❌ WRONG - Data leak!
const projects = await prisma.project.findMany();
```

**2. Set Tenant Context**
```typescript
import { setTenantContext } from '@/lib/database/prisma-middleware';

// ALWAYS set before queries
await setTenantContext({
  organizationId: session.user.organizationId,
  userId: session.user.id
});

// Now queries auto-filter by organization
const data = await prisma.customer.findMany();
```

### RBAC (Role-Based Access Control)

**Dual-Role System:**
```typescript
interface User {
  globalRole: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';
  organizationRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ✅ Check BOTH roles
export function canAccessCRM(user: User) {
  const hasGlobalRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return hasGlobalRole && hasOrgAccess;
}
```

**Server Action Protection:**
```typescript
'use server';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessCRM } from '@/lib/auth/rbac';

export async function createCustomer(data: CustomerInput) {
  const session = await requireAuth();
  if (!canAccessCRM(session.user)) throw new Error('Unauthorized');

  return await prisma.customer.create({
    data: { ...data, organizationId: session.user.organizationId }
  });
}
```

### Subscription Tiers

**6-Tier System (per-seat):**
- FREE - SUPER_ADMIN assignment only
- CUSTOM - Pay-per-use marketplace
- STARTER ($299) - CRM, CMS, Transactions
- GROWTH ($699) - Starter + modules + tools
- ELITE ($999) - Everything + all tools
- ENTERPRISE (Custom) - Unlimited

**Feature Gating:**
```typescript
export function canAccessFeature(user: User, feature: Feature): boolean {
  const tierLimits = {
    FREE: ['dashboard', 'profile'],
    STARTER: ['dashboard', 'crm', 'cms', 'transactions'],
    GROWTH: ['dashboard', 'crm', 'cms', 'transactions', 'ai', 'tools'],
    ELITE: ['*'],
    ENTERPRISE: ['*'],
  };
  const allowed = tierLimits[user.subscriptionTier];
  return allowed.includes('*') || allowed.includes(feature);
}
```

### Module Architecture

**Self-Containment:**
```typescript
// lib/modules/crm/
// ├── contacts/
// │   ├── actions.ts
// │   ├── queries.ts
// │   ├── schemas.ts
// │   └── index.ts
// └── index.ts

// ✅ Export only what's needed
export { createContact, updateContact } from './contacts/actions';
export { getContacts, getContactById } from './contacts/queries';

// ❌ NEVER cross-import between modules
import { getTransactions } from '@/lib/modules/transactions/queries'; // FORBIDDEN
```

---

## 🔒 SECURITY MANDATES

```typescript
// 1. Multi-Tenancy Isolation
await setTenantContext({ organizationId, userId });

// 2. RBAC Enforcement
if (!checkPermission(user, 'crm:write')) throw new Error('Forbidden');

// 3. Input Validation (ALWAYS)
const validated = CustomerSchema.parse(input);

// 4. SQL Injection Prevention
✅ prisma.customer.findMany({ where: { name } })
❌ prisma.$queryRaw`SELECT * WHERE name = '${name}'`

// 5. XSS Prevention
✅ <div>{userContent}</div>
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 6. Server-Only Protection
import 'server-only'; // At top of sensitive files

// 7. Document Encryption (Transaction Documents)
import { encryptDocument } from '@/lib/storage/encryption';
const encrypted = encryptDocument(fileBuffer);
```

**NEVER Expose:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DOCUMENT_ENCRYPTION_KEY` (in `.env.local` only!)
- Database credentials
- Other organizations' data

---

## 🚀 PERFORMANCE TARGETS

```yaml
Page Load: LCP < 2.5s, FID < 100ms, CLS < 0.1, TTFB < 600ms
Database: Query < 100ms, Complex Query < 500ms, RLS < 50ms
API: Server Action < 200ms, Webhook < 1s
Bundle: Initial JS < 500kb, Route JS < 100kb, Server Components 80%+
```

**Optimization Patterns:**
```typescript
// 1. Server Components by default
async function Page() {
  const data = await prisma.customer.findMany();
  return <CustomerList data={data} />;
}

// 2. Parallel queries
const [customers, projects, tasks] = await Promise.all([...]);

// 3. Pagination
const customers = await prisma.customer.findMany({
  take: 50,
  skip: page * 50,
});
```

---

## ✅ PRE-COMMIT CHECKLIST

```bash
npm run lint        # Zero warnings
npm run type-check  # Zero errors
npm test            # 80%+ coverage
```

**ESLint Status (2025-10-07):**
- `@typescript-eslint/no-explicit-any`: WARN (291 instances to fix)
- `max-lines-per-function`: REMOVED
- `react/no-unescaped-entities`: ERROR (25 instances blocking build)

**CRITICAL - Before Vercel Deployment:**
```bash
npm run build  # Must succeed with ZERO errors
npm run lint   # Must show ZERO warnings
```

**Platform-Specific Checks:**
- [ ] RLS policies enabled on all multi-tenant tables
- [ ] RBAC permissions checked in Server Actions
- [ ] Organization ID included in all queries
- [ ] Subscription tier limits enforced
- [ ] Input validated with Zod
- [ ] No cross-module imports
- [ ] No exposed secrets
- [ ] ESLint warnings addressed

---

## 🛠 COMMANDS

```bash
# Setup
npm install
npx prisma generate
npx prisma migrate dev

# Development
npm run dev              # Start dev server (Turbopack)
npx prisma studio        # Database GUI
npm run lint:fix         # Fix linting

# Database (USE HELPER SCRIPTS)
npm run db:docs         # Generate schema docs (ALWAYS after schema changes)
npm run db:status       # Check migration status
npm run db:migrate      # Create migration (interactive)
npm run db:sync         # Check for schema drift

# Schema Inspection (99% token savings!)
# ❌ NEVER: Use MCP list_tables tool (18k tokens!)
# ✅ ALWAYS: Read local docs (500 tokens)
cat prisma/SCHEMA-QUICK-REF.md    # Quick reference
cat prisma/SCHEMA-MODELS.md       # Model details
cat prisma/SCHEMA-ENUMS.md        # Enum values

# Database Documentation
cat lib/database/docs/SUPABASE-SETUP.md
cat lib/database/docs/RLS-POLICIES.md
cat lib/database/docs/STORAGE-BUCKETS.md
cat lib/database/docs/PRISMA-SUPABASE-DECISION-TREE.md
cat lib/database/docs/HYBRID-PATTERNS.md
cat lib/database/docs/TESTING-RLS.md

# Testing
npm test                 # Run all tests
npm test -- --coverage   # With coverage
npm test auth           # Test auth/RBAC

# Pre-commit (ALWAYS)
npm run lint && npx tsc --noEmit && npm test

# Stripe (Development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production
npm run build
npm start
```

---

## 🎯 CORE PRINCIPLES

1. **Multi-tenant by default** - Organization isolation via RLS
2. **RBAC everywhere** - Check permissions for every action
3. **Tier-based access** - Enforce subscription limits
4. **Module isolation** - No cross-module dependencies
5. **Server-first** - Minimize client JavaScript
6. **Type safety** - TypeScript + Zod everywhere
7. **Security by default** - Never trust input
8. **Production mindset** - Every line matters

---

## 📋 MODULE DEVELOPMENT WORKFLOW

**Creating a Module:**

1. **Structure**
```bash
mkdir -p lib/modules/my-feature
```

2. **Schemas** (schemas.ts)
```typescript
import { z } from 'zod';
export const MyFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  organizationId: z.string().uuid(),
});
```

3. **Queries** (queries.ts)
```typescript
'use server';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getMyFeatures() {
  const session = await requireAuth();
  return await prisma.myFeature.findMany({
    where: { organizationId: session.user.organizationId }
  });
}
```

4. **Actions** (actions.ts)
```typescript
'use server';
import { requireAuth } from '@/lib/auth/middleware';

export async function createMyFeature(input: MyFeatureInput) {
  const session = await requireAuth();
  const validated = MyFeatureSchema.parse(input);
  return await prisma.myFeature.create({
    data: { ...validated, organizationId: session.user.organizationId }
  });
}
```

5. **Public API** (index.ts)
```typescript
export { createMyFeature } from './actions';
export { getMyFeatures } from './queries';
export { MyFeatureSchema } from './schemas';
```

6. **Tests**
```typescript
import { createMyFeature } from '@/lib/modules/my-feature';

describe('MyFeature', () => {
  it('creates feature for current org only', async () => {
    const feature = await createMyFeature({ name: 'Test', organizationId: 'org-123' });
    expect(feature.organizationId).toBe('org-123');
  });
});
```

**Note:** Prefer consolidation - group related features under parent modules (13 consolidated modules, down from 26)

---

## ❌ NEVER DO THIS

```typescript
// Multi-Tenancy
❌ const data = await prisma.customer.findMany(); // Missing org filter!
❌ await prisma.$queryRaw`SELECT * FROM customers`; // Bypasses RLS
❌ const orgId = req.query.get('orgId'); // User-controlled org switching!

// RBAC
❌ if (user.role === 'ADMIN') { } // Only global role check
❌ const hasAccess = true; // Hardcoded permissions
❌ // No permission check in Server Action

// Module Architecture
❌ import { ... } from '@/lib/modules/other-module'; // Cross-module import
❌ export { prismaClient }; // Exposing internals
❌ // Missing Zod validation

// Routing
❌ app/(platform)/crm/ // OLD - use app/real-estate/crm/
❌ app/dashboard/ // Missing industry prefix
❌ app/real-estate/transactions/ // OLD - use workspace/

// Security
❌ const apiKey = process.env.STRIPE_SECRET_KEY; // Exposed to client
❌ await prisma.$queryRaw(`...${userInput}...`); // SQL injection
❌ const isValid = true; // Skip webhook verification

// Performance
❌ for (const item of items) { await prisma... } // N+1 query
❌ const allData = await prisma.customer.findMany(); // No pagination
❌ "use client"; // Without valid reason

// Database Workflow
❌ Use MCP list_tables // 18k tokens wasted!
❌ Query database for models // Read prisma/SCHEMA-QUICK-REF.md
❌ Create migration without docs // Run npm run db:docs after
❌ Skip setTenantContext // SECURITY RISK - data leak!
❌ Import from @/lib/prisma // Use @/lib/database/prisma
```

---

## 🎯 DECISION TREE

**Before you start:**
1. Is this Real Estate-specific or shared?
2. Are RLS policies enabled for table?
3. What roles can access this?
4. What subscription tier is required?
5. Does similar functionality exist?

**During implementation:**
- Query data? → Add organizationId filter + setTenantContext
- Mutate data? → Server Action + RBAC check + Zod validation
- Need interactivity? → "use client" (minimize)
- Need webhook? → Verify signature first
- Cross-module data? → Use @prisma/client types only
- New route? → Place in `app/real-estate/`
- New component? → `components/shared/` or `components/real-estate/`
- New module? → Check if it belongs under existing module

**Before committing:**
- [ ] RLS context set
- [ ] RBAC checked
- [ ] Org isolation verified
- [ ] Tier limits enforced
- [ ] Input validated
- [ ] 80%+ test coverage
- [ ] No secrets exposed
- [ ] Correct directories used

---

**Remember:** This is multi-tenant SaaS. **Isolation > Speed > Features.** One data leak = catastrophic failure.

---

## 📝 VERSION HISTORY

**v3.0 (2025-10-10)** - Production Schema + Cleanup
- Database synced from Supabase production (42 models, 69 enums)
- Removed mock data infrastructure - using real database
- Removed outdated schema migration documentation
- Cleaned up migrations directory
- Schema source of truth: Supabase production database
- Condensed CLAUDE.md from 1,255 lines to ~650 lines

**v2.3 (2025-10-07)** - Mock Data Infrastructure (DEPRECATED)
- Temporary mock data infrastructure for UI development
- Replaced with real database on 2025-10-10

**v2.0-2.2 (2025-10-05)** - Architecture Updates
- Multi-industry architecture
- Module consolidation (26 → 13)
- Frontend/backend module clarification

**v1.0 (2025-10-04)** - Initial Standards
- Multi-tenancy and RLS rules
- RBAC enforcement
- Module architecture
- Security mandates

**Last Updated:** 2025-10-10
