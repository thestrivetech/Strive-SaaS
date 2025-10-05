# CLAUDE-PLATFORM.md

**Claude's Session Memory | v2.0 | Platform Project Standards - Multi-Industry Architecture**

> ## 🔴 CRITICAL: READ-BEFORE-EDIT MANDATE
>
> **YOU MUST FOLLOW THESE STEPS BEFORE ANY ACTION:**
>
> 1. **READ FIRST** - Always use Read tool on any file before editing it
> 2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files, scripts, or tests already exist
> 3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones (99% of the time)
> 4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first
>
> **For root project documentation:**
> - Main standards: [`../CLAUDE.md`](../CLAUDE.md) - Core development rules
> - Project overview: [`../README.md`](../README.md) - Repository structure

---

## 🎯 PROJECT: Strive Tech SaaS Platform

**Location:** `(platform)/` → app.strivetech.ai (Next.js project)
**Stack:** Next.js 15 + React 19.1.0 + TypeScript + Prisma + Supabase
**Focus:** Enterprise B2B multi-tenant SaaS with role-based access control

> **Purpose:** Complete SaaS application with:
> - Admin Dashboard - System management, analytics, user administration
> - Employee Workspace - Projects, CRM, tasks, tools
> - Client Portal - Project visibility, invoices, support
> - AI Assistant (Sai) - Embedded chatbot from (chatbot) project

---

## ⚡ TECH STACK

```yaml
Core: Next.js 15, React 19.1.0, TypeScript 5.6+

# Database & Backend
Database Provider: Supabase (PostgreSQL hosting)
ORM: Prisma 6.16.2 (connects to Supabase DB)
Auth: Supabase Auth (JWT in httpOnly cookies)
Storage: Supabase Storage
RLS: Supabase Row Level Security (multi-tenancy)

# State & Forms
Server State: TanStack Query
Client State: Zustand (when needed)
Forms: React Hook Form + Zod

# UI & Styling
UI: shadcn/ui + Radix UI
Styling: Tailwind CSS
Icons: Lucide React

# Payments & Subscriptions
Provider: Stripe
Webhooks: Stripe CLI (dev) / Production webhooks
Billing: Usage-based + tier-based

# AI Integration
Source: (chatbot) project embedded
Models: OpenRouter + Groq

# Testing
Unit/Integration: Jest + React Testing Library
E2E: Playwright
Coverage: 80% minimum
```

**IMPORTANT:** Multi-tenancy via Row Level Security (RLS):
- **RLS** = PostgreSQL feature that filters rows based on user context
- **Multi-tenant** = Multiple organizations share same tables, isolated by org_id
- **RBAC** = Role-Based Access Control (User + Organization roles)

---

## 📁 STRUCTURE

> **Multi-Industry Scalable Architecture:**
> - Platform designed to support multiple industries (Real Estate, Healthcare, Legal, etc.)
> - Each industry has isolated routes, components, and business logic
> - Shared infrastructure (auth, payments, AI) used across all industries
> - Currently: Real Estate vertical fully implemented

```
(platform)/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root redirect (role-based routing)
│   ├── globals.css              # Global styles
│   │
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup + industry selection
│   │   ├── onboarding/          # Post-signup onboarding
│   │   └── reset-password/      # Password reset
│   │
│   ├── (marketing)/             # SaaS app marketing (NOT website project)
│   │   ├── page.tsx            # Landing page (app.strivetech.ai)
│   │   ├── pricing/            # Pricing page
│   │   └── features/           # Features showcase
│   │
│   ├── real-estate/             # Real Estate Industry App
│   │   ├── crm/                # CRM (contacts, leads, deals)
│   │   ├── dashboard/          # Role-based dashboards
│   │   └── transactions/       # Transaction management
│   │
│   └── api/                     # API routes
│       ├── webhooks/           # Stripe, Supabase webhooks
│       └── ai/                 # AI endpoints
│
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── shared/                  # Shared across all features
│   │   ├── navigation/         # Nav components
│   │   ├── forms/              # Reusable forms
│   │   └── data-display/       # Tables, cards, etc.
│   ├── layouts/                 # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── MarketingLayout.tsx
│   └── real-estate/             # Real Estate-specific components
│       ├── crm/                # CRM components
│       ├── transactions/       # Transaction components
│       ├── listings/           # Listing components
│       └── analytics/          # Analytics components
│
├── lib/
│   ├── modules/                 # Feature modules (15 consolidated)
│   │   ├── crm/                # CRM module
│   │   │   ├── contacts/      # Contact management
│   │   │   ├── leads/         # Lead management
│   │   │   └── deals/         # Deal management
│   │   ├── transactions/       # Transaction module
│   │   │   ├── tasks/         # Transaction tasks
│   │   │   ├── activity/      # Activity tracking
│   │   │   ├── analytics/     # Analytics
│   │   │   └── listings/      # Property listings
│   │   ├── ai/                 # AI module
│   │   ├── analytics/          # Analytics module
│   │   └── [other-modules]/    # Other consolidated modules
│   │       ├── actions.ts      # Server Actions
│   │       ├── queries.ts      # Data queries
│   │       ├── schemas.ts      # Zod schemas
│   │       └── index.ts        # Public API
│   │
│   ├── auth/
│   │   ├── middleware.ts       # Auth middleware
│   │   └── rbac.ts             # Role-based access control
│   ├── database/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── types/
│   │   ├── real-estate/        # Real Estate types
│   │   └── shared/             # Shared types
│   └── utils/                   # Shared utilities
│
├── prisma/
│   ├── schema.prisma            # Database schema (13 models)
│   └── migrations/              # Migration history
│
├── __tests__/                   # Test suites
│   ├── modules/                # Module tests
│   ├── components/             # Component tests
│   └── integration/            # Integration tests
│
└── middleware.ts                # Next.js middleware (auth + RBAC)
```

---

## 🔴 CRITICAL RULES - PLATFORM SPECIFIC

### Multi-Tenancy & RLS

**1. ALWAYS Filter by Organization**
```typescript
// ✅ Correct - RLS automatically filters by org_id
const projects = await prisma.project.findMany({
  where: {
    organizationId: session.user.organizationId
  }
});

// ❌ WRONG - Missing org filter (data leak!)
const projects = await prisma.project.findMany();
```

**2. RLS Policy Enforcement**
```sql
-- All tables MUST have RLS policies
CREATE POLICY "tenant_isolation" ON projects
  USING (organization_id = current_user_org());

-- Enable RLS on ALL multi-tenant tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

**3. Session Management**
```typescript
// ✅ Set RLS context for every request
await prisma.$executeRaw`
  SET app.current_user_id = ${userId};
  SET app.current_org_id = ${orgId};
`;

// Then queries auto-filter by RLS policies
const data = await prisma.customer.findMany(); // Only current org's customers
```

### RBAC (Role-Based Access Control)

**1. Dual-Role System**
```typescript
// User has TWO roles:
interface User {
  globalRole: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';
  organizationRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ✅ Check BOTH roles for access
export function canAccessCRM(user: User) {
  const hasGlobalRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return hasGlobalRole && hasOrgAccess;
}

// ❌ WRONG - Only checking global role
export function canAccessCRM(user: User) {
  return user.globalRole === 'USER'; // Missing org check!
}
```

**2. Middleware RBAC Enforcement**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (session.user.globalRole !== 'ADMIN') {
      return NextResponse.redirect('/dashboard');
    }
  }

  if (req.nextUrl.pathname.startsWith('/crm')) {
    if (!canAccessCRM(session.user)) {
      return NextResponse.redirect('/dashboard');
    }
  }

  return NextResponse.next();
}
```

**3. Server Action Protection**
```typescript
// lib/modules/crm/actions.ts
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canAccessCRM } from '@/lib/auth/rbac';

export async function createCustomer(data: CustomerInput) {
  const session = await requireAuth();

  // Check RBAC permissions
  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  // RLS will auto-filter by org
  return await prisma.customer.create({
    data: {
      ...data,
      organizationId: session.user.organizationId
    }
  });
}
```

### Subscription Tier Enforcement

**1. Feature Gating**
```typescript
// lib/auth/rbac.ts
export function canAccessFeature(
  user: User,
  feature: Feature
): boolean {
  const tierLimits = {
    FREE: ['dashboard', 'profile'], // SUPER_ADMIN assignment only
    CUSTOM: [], // Pay-per-use marketplace
    STARTER: ['dashboard', 'crm', 'cms', 'transactions'],
    GROWTH: ['dashboard', 'crm', 'cms', 'transactions', 'ai', 'tools'],
    ELITE: ['*'], // All features + all tools
    ENTERPRISE: ['*'], // Unlimited
  };

  const allowedFeatures = tierLimits[user.subscriptionTier];
  return allowedFeatures.includes('*') || allowedFeatures.includes(feature);
}

// ✅ Check before rendering feature
export function FeatureGuard({ feature, children }: Props) {
  const user = useUser();

  if (!canAccessFeature(user, feature)) {
    return <UpgradePrompt feature={feature} />;
  }

  return children;
}
```

**2. Usage Tracking**
```typescript
// Track usage for billing
export async function trackUsage(
  userId: string,
  metric: string,
  value: number
) {
  await prisma.usageTracking.create({
    data: {
      userId,
      metric,
      value,
      timestamp: new Date(),
    }
  });

  // Check if user exceeded tier limits
  const usage = await getMonthlyUsage(userId);
  if (usage[metric] > TIER_LIMITS[user.tier][metric]) {
    await notifyUsageLimitExceeded(userId, metric);
  }
}
```

### Module Architecture

**1. Module Self-Containment**
```typescript
// lib/modules/crm/
// ├── contacts/
// │   ├── actions.ts     - Contact Server Actions
// │   ├── queries.ts     - Contact data fetching
// │   ├── schemas.ts     - Contact Zod schemas
// │   └── index.ts       - Public API
// ├── leads/             - Lead management
// ├── deals/             - Deal management
// └── index.ts           - Module exports

// ✅ index.ts exports ONLY what's needed
export { createContact, updateContact } from './contacts/actions';
export { getContacts, getContactById } from './contacts/queries';
export { ContactSchema } from './contacts/schemas';
export type { Contact } from '@prisma/client';

// ❌ NEVER cross-import between modules
import { getTransactions } from '@/lib/modules/transactions/queries'; // FORBIDDEN
```

**2. Shared Types Only**
```typescript
// ✅ Share types from Prisma
import type { Customer, Project } from '@prisma/client';

// ✅ Share utility types
import type { PaginationParams, SortParams } from '@/lib/types';

// ❌ NEVER import module internals
import { validateCustomer } from '@/lib/modules/crm/actions'; // WRONG
```

---

## 🔒 SECURITY MANDATES - PLATFORM SPECIFIC

```typescript
// 1. Multi-Tenancy Isolation (RLS)
// ALWAYS set org context before queries
await setRLSContext(session.user.id, session.user.organizationId);

// 2. RBAC Enforcement
const hasAccess = checkPermission(user, 'crm:write');
if (!hasAccess) throw new Error('Forbidden');

// 3. Input Validation (ALWAYS with Zod)
const validated = CustomerSchema.parse(input);

// 4. SQL Injection Prevention
✅ prisma.customer.findMany({ where: { name } })
❌ prisma.$queryRaw(`SELECT * WHERE name = '${name}'`)

// 5. XSS Prevention
✅ <div>{userContent}</div>
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 6. Rate Limiting (per organization)
const { success } = await rateLimit(orgId);
if (!success) return new Response('429', { status: 429 });

// 7. Server-Only Protection
import 'server-only'; // At top of sensitive files

// 8. Webhook Signature Verification
const isValid = await stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
if (!isValid) return new Response('400', { status: 400 });

// 9. Document Encryption (Transaction Documents)
// CRITICAL: Encryption key ONLY in .env.local (NEVER commit!)
// Location: .env.local -> DOCUMENT_ENCRYPTION_KEY
import { encryptDocument } from '@/lib/storage/encryption';
const encrypted = encryptDocument(fileBuffer);
```

**NEVER expose:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DOCUMENT_ENCRYPTION_KEY` ⚠️ **CRITICAL - In .env.local only!**
- Database credentials
- Other organizations' data

**⚠️ CRITICAL: Document Encryption Key**
- **Location:** `.env.local` file (NEVER commit this file!)
- **Purpose:** AES-256-GCM encryption for transaction documents
- **Format:** 64 hex characters (32 bytes)
- **Backup:** Store securely - lost key = lost documents!
- **Generate:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Session:** Added in Session 2 (Storage Infrastructure)

---

## 🚀 PERFORMANCE TARGETS - PLATFORM

```yaml
# Page Load
LCP: < 2.5s              # Largest Contentful Paint
FID: < 100ms             # First Input Delay
CLS: < 0.1               # Cumulative Layout Shift
TTFB: < 600ms            # Time to First Byte

# Database
Query Time: < 100ms      # Most queries
Complex Query: < 500ms   # Aggregations, joins
RLS Overhead: < 50ms     # RLS policy check

# API
Server Action: < 200ms   # Simple mutations
Webhook: < 1s            # Process webhook

# Bundle
Initial JS: < 500kb      # First load
Route JS: < 100kb        # Per route
Server Components: 80%+  # Minimize client JS
```

**Optimization Patterns:**
```typescript
// 1. Server Components by default
async function Page() {
  const data = await prisma.customer.findMany();
  return <CustomerList data={data} />;
}

// 2. Parallel queries
const [customers, projects, tasks] = await Promise.all([
  prisma.customer.findMany(),
  prisma.project.findMany(),
  prisma.task.findMany(),
]);

// 3. Suspense for streaming
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataComponent />
    </Suspense>
  );
}

// 4. Pagination for large lists
const customers = await prisma.customer.findMany({
  take: 50,
  skip: page * 50,
});
```

---

## ✅ PRE-COMMIT CHECKLIST - PLATFORM

**MANDATORY before ANY commit:**
```bash
npm run lint        # Zero warnings
npm run type-check  # Zero errors
npm test            # 80% coverage
```

**Platform-Specific Checks:**
- [ ] RLS policies enabled on all multi-tenant tables
- [ ] RBAC permissions checked in Server Actions
- [ ] Organization ID included in all queries
- [ ] Subscription tier limits enforced
- [ ] Input validated with Zod
- [ ] No cross-module imports
- [ ] Stripe webhooks verified
- [ ] No exposed secrets

**Test Coverage Requirements:**
- Auth & RBAC: 100%
- Server Actions: 100%
- API Routes: 100%
- Business Logic: 90%
- UI Components: 70%
- Overall: 80% minimum

---

## 🛠 COMMANDS - PLATFORM

```bash
# Setup
npm install
npx prisma generate
npx prisma migrate dev

# Development
npm run dev              # Start dev server (Turbopack)
npx prisma studio        # Database GUI
npm run lint:fix         # Fix linting issues

# Database
npx prisma migrate dev --name description    # Create migration
npx prisma db push                          # Push schema (dev only)
npx prisma migrate deploy                   # Apply migrations (prod)

# Testing
npm test                 # Run all tests
npm test -- --coverage   # With coverage
npm test auth           # Test auth/RBAC
npm test modules        # Test modules

# Pre-commit (ALWAYS)
npm run lint && npx tsc --noEmit && npm test

# Stripe (Development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production
npm run build
npm start
```

---

## 🎯 CORE PRINCIPLES - PLATFORM

1. **Multi-tenant by default** - Organization isolation via RLS
2. **RBAC everywhere** - Check permissions for every action
3. **Tier-based access** - Enforce subscription limits
4. **Module isolation** - No cross-module dependencies
5. **Server-first** - Minimize client JavaScript
6. **Type safety** - TypeScript + Zod everywhere
7. **Security by default** - Never trust input
8. **Production mindset** - Every line matters
9. **Industry scalability** - Multi-industry architecture for horizontal expansion

---

## 🏭 MULTI-INDUSTRY ARCHITECTURE

**Current State:**
- **Real Estate vertical:** Fully implemented (CRM, Transactions, Listings, Analytics)
- **Future verticals:** Healthcare, Legal, Construction, etc.

**Scalability Pattern:**
```typescript
// Each industry gets isolated route structure
app/
├── real-estate/        // Industry 1
│   ├── dashboard/
│   ├── crm/
│   └── transactions/
├── healthcare/         // Industry 2 (future)
│   ├── dashboard/
│   ├── patients/
│   └── appointments/
└── legal/              // Industry 3 (future)
    ├── dashboard/
    ├── cases/
    └── clients/

// Shared infrastructure used across all industries
lib/
├── auth/               // Shared auth
├── payments/           // Shared payments
├── ai/                 // Shared AI
└── modules/
    ├── crm/           // Shared when applicable
    └── real-estate/   // Industry-specific modules
```

**Adding a New Industry:**
1. Create industry route group: `app/[industry-name]/`
2. Industry-specific components: `components/[industry-name]/`
3. Industry-specific types: `lib/types/[industry-name]/`
4. Industry-specific modules (if needed): `lib/modules/[industry-name]/`
5. Reuse shared infrastructure (auth, payments, AI)
6. Industry selection during signup: `app/(auth)/signup/`

**Benefits:**
- **Horizontal scaling** - Add industries without touching existing code
- **Code reuse** - Shared infrastructure (auth, payments, AI)
- **Industry isolation** - Industry-specific features don't pollute shared code
- **Clear boundaries** - Easy to understand what's industry-specific vs shared

---

## 📋 MODULE DEVELOPMENT WORKFLOW

**Creating a New Module (or Sub-module):**

1. **Create module directory structure**
```bash
# For a new top-level module
mkdir -p lib/modules/my-feature

# For a sub-module within existing module (preferred for consolidation)
mkdir -p lib/modules/existing-module/my-subfeature
```

2. **Create schemas** (schemas.ts)
```typescript
import { z } from 'zod';

export const MyFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  organizationId: z.string().uuid(),
});

export type MyFeatureInput = z.infer<typeof MyFeatureSchema>;
```

3. **Create queries** (queries.ts)
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getMyFeatures() {
  const session = await requireAuth();

  return await prisma.myFeature.findMany({
    where: {
      organizationId: session.user.organizationId
    }
  });
}
```

4. **Create actions** (actions.ts)
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { MyFeatureSchema } from './schemas';

export async function createMyFeature(input: MyFeatureInput) {
  const session = await requireAuth();
  const validated = MyFeatureSchema.parse(input);

  return await prisma.myFeature.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId
    }
  });
}
```

5. **Create public API** (index.ts)
```typescript
export { createMyFeature, updateMyFeature } from './actions';
export { getMyFeatures, getMyFeatureById } from './queries';
export { MyFeatureSchema } from './schemas';
export type { MyFeature } from '@prisma/client';
```

6. **Write tests** (__tests__/modules/my-feature.test.ts)
```typescript
import { createMyFeature } from '@/lib/modules/my-feature';

describe('MyFeature Module', () => {
  it('should create feature for current org only', async () => {
    const feature = await createMyFeature({
      name: 'Test Feature',
      organizationId: 'org-123',
    });

    expect(feature.organizationId).toBe('org-123');
  });
});
```

**Note on Module Organization:**
- **Prefer consolidation** - Group related features under a parent module (e.g., `crm/contacts/`, `crm/leads/`)
- **Current count:** 15 consolidated modules (down from 26)
- **Before creating new module:** Check if it belongs under existing module structure

---

## ❌ NEVER DO THIS - PLATFORM

```typescript
// Multi-Tenancy Anti-patterns
❌ const data = await prisma.customer.findMany(); // Missing org filter!
❌ await prisma.$queryRaw`SELECT * FROM customers`; // Bypasses RLS
❌ const orgId = req.query.get('orgId'); // User-controlled org switching!

// RBAC Anti-patterns
❌ if (user.role === 'ADMIN') { } // Only global role check
❌ const hasAccess = true; // Hardcoded permissions
❌ // No permission check in Server Action

// Module Anti-patterns
❌ import { ... } from '@/lib/modules/other-module'; // Cross-module import
❌ export { prismaClient }; // Exposing internals
❌ // Missing Zod validation on input
❌ mkdir lib/modules/orphan-feature // Create without checking consolidation

// Routing Anti-patterns
❌ app/(platform)/crm/ // OLD structure - use app/real-estate/crm/
❌ components/(platform)/ // OLD - use components/real-estate/
❌ app/dashboard/ // Missing industry prefix (real-estate/)

// Security Anti-patterns
❌ const apiKey = process.env.STRIPE_SECRET_KEY; // Exposed to client
❌ await prisma.$queryRaw(`...${userInput}...`); // SQL injection
❌ return new Response(data); // Without CORS/auth check
❌ const isValid = true; // Skip webhook verification

// Performance Anti-patterns
❌ for (const item of items) { await prisma... } // N+1 query
❌ const allData = await prisma.customer.findMany(); // No pagination
❌ "use client"; // Without valid reason
```

---

## 🔗 QUICK REFS - PLATFORM

- **Subscription Tiers (per-seat):**
  - FREE - SUPER_ADMIN assignment only
  - CUSTOM - Pay-per-use marketplace
  - STARTER ($299) - CRM, CMS, Transactions
  - GROWTH ($699) - Starter + modules + tools
  - ELITE ($999) - Everything + all tools
  - ENTERPRISE (Custom) - Unlimited

- **User Roles (Global):**
  - SUPER_ADMIN - Platform dev (unrestricted, /platform-admin)
  - ADMIN - Org admin (org-scoped, /admin)
  - MODERATOR - Content/support moderator
  - USER - Standard user

- **Organization Roles:**
  - OWNER - Organization creator
  - ADMIN - Org administrator
  - MEMBER - Standard member
  - VIEWER - Read-only

- **Database Models:** 13 total
  - User, Organization, OrganizationMember
  - Customer, Project, Task
  - AIConversation, AITool
  - Subscription, UsageTracking
  - Appointment, Content, ActivityLog

---

## 🎯 DECISION TREE - PLATFORM

**Before you start:**
1. **Check industry** → Is this Real Estate-specific or shared?
2. **Check RLS** → Are RLS policies enabled for table?
3. **Check RBAC** → What roles can access this?
4. **Check tier** → What subscription tier required?
5. **Check module** → Does similar functionality exist?

**During implementation:**
- **Need to query data?** → Add organizationId filter
- **Need to mutate data?** → Server Action with RBAC check
- **Need interactivity?** → "use client" component (minimize)
- **Need webhook?** → Verify signature first
- **Cross-module data?** → Use @prisma/client types only
- **New feature?** → Check subscription tier
- **New route?** → Place in correct industry folder (`app/real-estate/`)
- **New component?** → Shared or industry-specific? (`components/shared/` vs `components/real-estate/`)
- **New module?** → Can it be consolidated under existing module?

**Before committing:**
- [ ] RLS context set for queries
- [ ] RBAC permissions checked
- [ ] Org isolation verified
- [ ] Tier limits enforced
- [ ] Input validated
- [ ] 80%+ test coverage
- [ ] No secrets exposed
- [ ] Correct industry directory used
- [ ] No duplicate routes (check old `app/(platform)/` removed)

---

**Remember:** This is multi-tenant SaaS. Isolation > Speed > Features. One data leak = catastrophic failure.

---

## 📝 VERSION HISTORY

**v2.0 (2025-10-05)** - Multi-Industry Architecture
- Updated directory structure to reflect multi-industry scalability
- Changed `app/(platform)/` → `app/real-estate/` (industry-specific routes)
- Added `app/(auth)/` and `app/(marketing)/` route groups
- Changed `components/(platform)/` → `components/real-estate/`
- Added `components/shared/` and `components/layouts/`
- Updated module structure to reflect consolidation (26 → 15 modules)
- Added `lib/types/real-estate/` for industry-specific types
- Added Multi-Industry Architecture section
- Updated Decision Tree with industry considerations

**v1.0 (2025-10-04)** - Initial Platform Standards
- Initial platform-specific standards
- Multi-tenancy and RLS rules
- RBAC enforcement patterns
- Module architecture guidelines
- Security mandates
- Performance targets

**Last Updated:** 2025-10-05
