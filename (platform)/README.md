# Strive Tech SaaS Platform

**Multi-Tenant B2B Platform with Role-Based Access**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-green)](https://www.prisma.io/)

> **Quick Reference:** For development rules and best practices, see [`/CLAUDE.md`](./CLAUDE.md). For root project standards, see [`../CLAUDE.md`](../CLAUDE.md).

---

## 🎯 Project Overview

**Strive Tech Platform** is an enterprise B2B SaaS application serving multiple user types:

### User Types & Dashboards

**1. Admin Dashboard** (Global ADMIN role)
- System management and configuration
- User and organization administration
- Analytics and reporting
- Billing and subscription management

**2. Employee Workspace** (EMPLOYEE role)
- Projects and task management
- CRM system
- AI assistant (Sai)
- Tool marketplace
- Time tracking

**3. Client Portal** (CLIENT role)
- Project visibility
- Invoices and payments
- Support tickets
- Communication hub

### Key Features

- **Multi-Tenancy** - Organizations isolated via Row Level Security (RLS)
- **Multiple Dashboards/Modules** - Industry specific dashboards and modules that will be available for users to use
- **Dual-Role RBAC** - Global + organization roles
- **Subscription Tiers** - STARTER, GROWTH, ELITE, Custom, Enterprise
- **Module Architecture** - Self-contained feature modules
- **AI Integration** - Sai intelligent assistant project & AI agents that can be used in the SaaS app via tools (mulitple AI models will be used for different AI agents and workflows or automations that's selected or )
- **Tool Marketplace** - Installable add-on tools
- **Stripe Integration** - Subscription billing and webhooks

---

## Tech Stack

### Core Framework
```yaml
Framework: Next.js 15 (App Router)
Runtime: React 19.1.0
Language: TypeScript 5.6+
Styling: Tailwind CSS + shadcn/ui
```

### Database & Backend (HYBRID APPROACH)
```yaml
# Supabase and Prisma work TOGETHER:
Database Provider: Supabase (PostgreSQL hosting)
ORM: Prisma 6.16.2 (connects TO Supabase DB)
Auth: Supabase Auth (JWT in httpOnly cookies)
Storage: Supabase Storage
RLS: Supabase Row Level Security
Realtime: Supabase Realtime (live updates)

# How they work together:
Your App
  ├─► Prisma (ORM) ──────► Supabase PostgreSQL (queries, transactions)
  └─► Supabase Client ───► Supabase Services (auth, storage, realtime)
```

### State & Forms
```yaml
Server State: TanStack Query
Client State: Zustand (when needed)
Forms: React Hook Form + Zod
```

### Payments & Billing
```yaml
Provider: Stripe
Products: Subscription plans (STARTER, GROWTH, ELITE)
Webhooks: Stripe events (payment, subscription changes)
```

### AI & Tools
```yaml
AI Assistant: Sai (from (chatbot) project)
Tool System: Pluggable marketplace tools
```

### Testing & Quality
```yaml
Unit/Integration: Jest + React Testing Library
Coverage: 80% minimum (Auth/RBAC: 100%)
E2E: Playwright (future)
```

---

## Getting Started

### 1. Environment Setup

Create `.env.local`:
```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..." # Server-only

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AI (from chatbot project)
NEXT_PUBLIC_CHATBOT_URL="http://localhost:3000" # chatbot dev server

# App
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed

# Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Stripe Webhook Setup (Development)

In a separate terminal:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Project Structure

```
(platform)/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page (role-based redirect)
│   ├── globals.css          # Global styles
│   │
│   ├── (platform)/          # Protected platform routes
│   │   ├── dashboard/       # Role-based dashboards
│   │   │   ├── admin/      # Admin-only views
│   │   │   ├── employee/   # Employee workspace
│   │   │   └── client/     # Client portal
│   │   ├── crm/            # CRM system
│   │   │   ├── page.tsx   # Customer list
│   │   │   └── [customerId]/
│   │   ├── projects/       # Project management
│   │   ├── ai/             # Sai AI assistant
│   │   ├── tools/          # Tool marketplace
│   │   └── settings/       # User/org settings
│   │
│   ├── (auth)/             # Auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset/
│   │
│   └── api/                # API routes (webhooks only)
│       └── webhooks/
│           └── stripe/     # Stripe webhook handler
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── features/           # Feature-specific components
│   │   ├── crm/
│   │   ├── projects/
│   │   └── ai/
│   └── shared/             # Shared components
│       ├── layouts/
│       │   ├── dashboard-shell.tsx
│       │   └── sidebar.tsx
│       ├── navigation/
│       └── errors/
│
├── lib/
│   ├── modules/            # Feature modules (self-contained)
│   │   ├── crm/
│   │   │   ├── actions.ts  # Server Actions
│   │   │   ├── queries.ts  # Data queries
│   │   │   ├── schemas.ts  # Zod schemas
│   │   │   └── index.ts    # Public API
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── dashboard/
│   │
│   ├── auth/
│   │   ├── middleware.ts   # Auth middleware
│   │   ├── rbac.ts         # Role-based access control
│   │   └── utils.ts        # Auth utilities
│   │
│   ├── database/
│   │   └── prisma.ts       # Prisma client
│   │
│   └── utils/              # Shared utilities
│
├── prisma/
│   ├── schema.prisma       # Database schema (13 models)
│   ├── migrations/         # Migration history
│   └── seed.ts             # Seed data
│
├── __tests__/              # Test suites
│   ├── auth/               # Auth & RBAC tests
│   ├── modules/            # Module tests
│   └── integration/        # Integration tests
│
└── middleware.ts           # Next.js middleware (auth + RBAC)
```

---

## Database Architecture

### Schema Overview (13 Models)

**Core Models:**
1. **User** - User accounts and profiles
2. **Organization** - Multi-tenant organizations
3. **OrganizationMember** - User-org relationships with roles

**Feature Models:**
4. **Customer** - CRM customer records
5. **Project** - Project management
6. **Task** - Task tracking with Kanban support
7. **AIConversation** - Sai assistant chat history
8. **AITool** - Available AI tools catalog

**Billing Models:**
9. **Subscription** - Stripe billing management
10. **UsageTracking** - Usage metrics for billing

**Additional Models:**
11. **Appointment** - Calendar and scheduling
12. **Content** - CMS content management
13. **ActivityLog** - Audit trail

### Multi-Tenancy with RLS

**Row Level Security (RLS)** ensures organizations only see their own data:

```sql
-- Example RLS policy on customers table
CREATE POLICY "tenant_isolation" ON customers
  USING (organization_id = current_user_org());

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

**In application code:**
```typescript
// RLS context is set automatically via middleware
const customers = await prisma.customer.findMany({
  where: {
    organizationId: session.user.organizationId
  }
});
// Returns only customers for current user's organization
```

---

## Role-Based Access Control (RBAC)

### Dual-Role System

Users have **two roles**:

**1. Global Role** (System-wide)
- `ADMIN` - Full system access
- `MODERATOR` - Limited admin privileges
- `EMPLOYEE` - Internal team member
- `CLIENT` - External customer

**2. Organization Role** (Per-organization)
- `OWNER` - Organization creator
- `ADMIN` - Org administrator
- `MEMBER` - Standard member
- `VIEWER` - Read-only access

### Permission Checking

```typescript
// lib/auth/rbac.ts
export function canAccessCRM(user: User): boolean {
  // Check both global AND org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

export function canManageUsers(user: User): boolean {
  // Admin only
  return user.globalRole === 'ADMIN';
}

export function canEditProject(user: User, project: Project): boolean {
  // Owner, Admin, or project creator
  const isOrgAdmin = ['OWNER', 'ADMIN'].includes(user.organizationRole);
  const isCreator = project.createdById === user.id;

  return isOrgAdmin || isCreator;
}
```

### RBAC in Routes

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (session.user.globalRole !== 'ADMIN') {
      return NextResponse.redirect('/dashboard');
    }
  }

  // Protect CRM
  if (req.nextUrl.pathname.startsWith('/crm')) {
    if (!canAccessCRM(session.user)) {
      return NextResponse.redirect('/dashboard');
    }
  }

  return NextResponse.next();
}
```

### RBAC in Server Actions

```typescript
// lib/modules/crm/actions.ts
'use server';

export async function createCustomer(data: CustomerInput) {
  const session = await requireAuth();

  // Check permission
  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized: CRM access required');
  }

  // Validate input
  const validated = CustomerSchema.parse(data);

  // Create (RLS ensures org isolation)
  return await prisma.customer.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId
    }
  });
}
```

---

## Subscription Tiers

### Available Tiers

**FREE** - $0/month
- Basic dashboard
- Limited AI queries (10/month)
- No tools
- 1 user

**STARTER** - $299/month
- Full dashboard
- CRM (100 customers)
- Projects (10 active)
- 3 tools from marketplace
- 5 users

**GROWTH** - $699/month
- Everything in STARTER
- CRM (unlimited customers)
- Projects (unlimited)
- AI assistant (unlimited)
- 10 tools from marketplace
- 20 users

**ELITE** - Custom pricing
- Everything in GROWTH
- Custom workflows
- Unlimited tools
- Priority support
- Dedicated account manager
- Unlimited users

### Tier Enforcement

```typescript
// lib/auth/rbac.ts
export function canAccessFeature(
  user: User,
  feature: string
): boolean {
  const tierFeatures = {
    FREE: ['dashboard', 'profile'],
    STARTER: ['dashboard', 'profile', 'crm', 'projects'],
    GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai', 'tools'],
    ELITE: ['*'], // All features
  };

  const allowed = tierFeatures[user.subscriptionTier];
  return allowed.includes('*') || allowed.includes(feature);
}

// Usage in components
export function FeatureGuard({ feature, children }: Props) {
  const user = useUser();

  if (!canAccessFeature(user, feature)) {
    return <UpgradePrompt feature={feature} />;
  }

  return children;
}
```

---

## Module Development

### Module Structure

Each module is **self-contained** with no cross-module dependencies:

```
lib/modules/crm/
├── actions.ts     # Server Actions (mutations)
├── queries.ts     # Data fetching (read-only)
├── schemas.ts     # Zod validation schemas
├── types.ts       # TypeScript types (optional)
└── index.ts       # Public API (exports)
```

### Example Module

**1. Schemas** (schemas.ts)
```typescript
import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  organizationId: z.string().uuid(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
```

**2. Queries** (queries.ts)
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getCustomers() {
  const session = await requireAuth();

  return await prisma.customer.findMany({
    where: {
      organizationId: session.user.organizationId
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCustomerById(id: string) {
  const session = await requireAuth();

  return await prisma.customer.findUnique({
    where: {
      id,
      organizationId: session.user.organizationId
    }
  });
}
```

**3. Actions** (actions.ts)
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canAccessCRM } from '@/lib/auth/rbac';
import { CustomerSchema } from './schemas';

export async function createCustomer(input: CustomerInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = CustomerSchema.parse(input);

  return await prisma.customer.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId
    }
  });
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = CustomerSchema.partial().parse(input);

  return await prisma.customer.update({
    where: {
      id,
      organizationId: session.user.organizationId
    },
    data: validated
  });
}
```

**4. Public API** (index.ts)
```typescript
// Export only what's needed
export { createCustomer, updateCustomer, deleteCustomer } from './actions';
export { getCustomers, getCustomerById } from './queries';
export { CustomerSchema } from './schemas';
export type { Customer } from '@prisma/client';
```

---

## Development Commands

```bash
# Setup
npm install                     # Install dependencies
npx prisma generate            # Generate Prisma client
npx prisma migrate dev         # Run migrations

# Development
npm run dev                     # Start dev server (Turbopack)
npx prisma studio              # Database GUI
npm run lint:fix               # Fix linting issues

# Database Management
npx prisma migrate dev --name description   # Create migration
npx prisma db push                          # Push schema (dev only)
npx prisma migrate deploy                   # Apply migrations (prod)
npx prisma db seed                          # Seed database

# Testing
npm test                        # Run all tests
npm test -- --coverage          # With coverage report
npm test auth                   # Test auth/RBAC only
npm test modules                # Test modules only
npm test -- --watch             # Watch mode

# Pre-commit (ALWAYS RUN)
npm run lint                    # ESLint - Zero warnings
npm run type-check              # TypeScript - Zero errors
npm test                        # Tests - 80% coverage minimum

# Stripe (Development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production
npm run build                   # Production build
npm start                       # Start production server
```

---

## Testing Strategy

### Coverage Requirements

- **Auth & RBAC:** 100% (critical for security)
- **Server Actions:** 100% (critical for data integrity)
- **API Routes:** 100% (critical for webhooks)
- **Business Logic:** 90%
- **UI Components:** 70%
- **Overall:** 80% minimum

### Test Examples

**Auth/RBAC:**
```typescript
// __tests__/auth/rbac.test.ts
describe('RBAC - CRM Access', () => {
  it('should allow EMPLOYEE with MEMBER org role', () => {
    const user = { globalRole: 'EMPLOYEE', organizationRole: 'MEMBER' };
    expect(canAccessCRM(user)).toBe(true);
  });

  it('should deny CLIENT users', () => {
    const user = { globalRole: 'CLIENT', organizationRole: 'MEMBER' };
    expect(canAccessCRM(user)).toBe(false);
  });
});
```

**Server Actions:**
```typescript
// __tests__/modules/crm/actions.test.ts
describe('CRM Actions', () => {
  it('should create customer for current org only', async () => {
    const customer = await createCustomer({
      name: 'Test Customer',
      email: 'test@example.com',
      organizationId: 'org-123'
    });

    expect(customer.organizationId).toBe('org-123');
  });

  it('should throw error for unauthorized user', async () => {
    // Mock session with CLIENT role
    await expect(createCustomer({ ... })).rejects.toThrow('Unauthorized');
  });
});
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Environment variables set in Vercel
- [ ] Stripe webhooks configured
- [ ] 80%+ test coverage
- [ ] Build succeeds
- [ ] Security review complete
- [ ] Performance targets met

### Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Verify deployment
# - https://app.strivetech.ai
```

### Environment Variables (Vercel)

Set in Vercel dashboard:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (encrypted)
- `STRIPE_SECRET_KEY` (encrypted)
- `STRIPE_WEBHOOK_SECRET` (encrypted)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Troubleshooting

### RLS Issues

**Problem:** User sees data from other organizations
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable RLS if missing
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

**Problem:** Queries return no data
```typescript
// Ensure org ID is set in query
const customers = await prisma.customer.findMany({
  where: {
    organizationId: session.user.organizationId // Must include this!
  }
});
```

### Auth Issues

**Problem:** Session not persisting
```typescript
// Check cookie settings
const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Stripe Webhooks

**Problem:** Webhooks not working locally
```bash
# Make sure stripe CLI is listening
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook
stripe trigger payment_intent.succeeded
```

---

## Related Documentation

- [Development Rules](./CLAUDE.md) - Platform-specific standards
- [Root Project Standards](../CLAUDE.md) - Shared development rules
- [Root README](../README.md) - Repository overview
- [Chatbot Project](../(chatbot)/README.md) - AI chatbot (Sai)
- [Website Project](../(website)/README.md) - Marketing site

---

**Built with ❤️ by Strive Tech**
