# Strive Tech Platform

**Enterprise B2B SaaS Platform with AI-Powered Tools**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-green)](https://www.prisma.io/)

> **Quick Reference:** For concise development rules and quick lookup, see [`/CLAUDE.md`](../CLAUDE.md) (v3.0). This file contains comprehensive project documentation, architecture details, and complete command references.

---

## 🔴 CRITICAL: READ-BEFORE-EDIT WORKFLOW

**MANDATORY STEPS BEFORE ANY ACTION:**

1. **READ FIRST** - Always use Read tool on any file before editing
2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files, scripts, or tests already exist
   - Don't create `test-*.ts` if similar test files exist
   - Don't create utility functions if they already exist elsewhere
   - Don't create new components if similar ones exist
3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones (99% of the time)
4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first

---

## Project Overview

**Strive Tech SaaS Platform** (`app/`) → `app.strivetech.ai`
- Enterprise B2B platform with AI-powered tools
- Multi-tenant architecture with 3/4-tier subscription model
- Built with Next.js 15.5.4 App Router
- Production-ready with comprehensive security and performance standards

**🔑 Database Strategy (HYBRID APPROACH):**
> **CRITICAL:** Supabase and Prisma work TOGETHER, not as alternatives
>
> - **Supabase** = Database provider (PostgreSQL) + Auth + Storage + Realtime
> - **Prisma** = ORM tool that connects TO Supabase database
> - **Use Prisma for:** Complex queries, transactions, aggregations, migrations
> - **Use Supabase for:** Auth, Realtime updates, file storage, presence tracking
>
> **Full Guide:** [`docs/database/PRISMA-SUPABASE-STRATEGY.md`](docs/database/PRISMA-SUPABASE-STRATEGY.md)

**Legacy Marketing Website** (`app/web/`) → `strivetech.ai` -> In progress
- To be migrated/integrated with SaaS platform in future
- Legacy React app (not actively developed)
- **DO NOT MODIFY** unless explicitly requested

---

## Tech Stack

### SaaS Platform (app/) - PRIMARY FOCUS

```yaml
# Core
Framework: Next.js 15.5.4 (App Router)
Runtime: React 19.1.0
Language: TypeScript 5.6+
Styling: Tailwind CSS 4.0 + shadcn/ui

# Data Layer & Backend (HYBRID APPROACH - Both Required)
Database Provider: Supabase (PostgreSQL hosting)
ORM: Prisma 6.16.2 (connects TO Supabase DB)
Auth: Supabase Auth (JWT in httpOnly cookies)
Storage: Supabase Storage (file uploads)
Realtime: Supabase Realtime (live updates, presence)
RLS: Supabase Row Level Security
Caching: Next.js Cache + React Query

# State Management
Server State: TanStack Query
Client State: Zustand (when needed)
Forms: React Hook Form + Zod

# AI Integration
Providers: OpenRouter + Groq
Models: GPT-4, Claude 3.5, Llama 3.3

# Payments
Provider: Stripe
Webhooks: Stripe CLI (dev) / Webhook endpoints (prod)

# Testing
Unit/Integration: Jest + React Testing Library
E2E: Playwright
Coverage: 80% minimum

# Monitoring
Analytics: Vercel Analytics
Errors: Sentry
Logs: Structured JSON
```

**🔄 How Prisma + Supabase Work Together:**
```
Your Application Code
        ├─► Prisma Client (ORM) ─────► Supabase PostgreSQL
        │                               (Complex queries, transactions)
        │
        └─► Supabase Client ───────────► Supabase Services
                                         ├─► Auth (login, sessions)
                                         ├─► Storage (file uploads)
                                         ├─► Realtime (live updates)
                                         └─► Presence (who's online)
```

### Legacy Marketing Website (app//app/web/) - Will be integrated into the SaaS in the future after it's updated to fit with next.js and the SaaS -> Currrently happening
- Legacy React + Express.js
- PostgreSQL via Supabase (separate DB)
- Drizzle ORM + Passport.js auth
- To be migrated to match SaaS architecture

---

## Project Structure -> Currently changing

### Root Directory
```
/
├── app/web/             # Legacy marketing website (React)
├── app/                 # SaaS platform (Next.js 15)
├── docs/                # Documentation (future)
├── .env                 # Environment variables (gitignored)
├── .gitignore
└── [essential configs only]
```

### Marketing Website (app/web/)
```
app/web/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   ├── App.tsx      # Root component with routing
│   │   └── sw.ts        # Service worker (PWA)
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── middleware/      # Express middleware
│   ├── lib/             # Server utilities
│   ├── index.ts         # Server entry point
│   ├── auth.ts          # Passport authentication
│   └── routes.ts        # Route definitions
├── shared/              # Shared code
│   └── schema.ts        # Drizzle database schema
└── scripts/             # Utility scripts
```

### SaaS Platform (app/) - Production Architecture

```
app/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup, reset)
│   │   └── layout.tsx            # Minimal auth layout
│   ├── (platform)/               # Protected platform routes
│   │   ├── dashboard/            # Role-based dashboards
│   │   ├── crm/                  # CRM system
│   │   ├── projects/             # Project management
│   │   ├── ai/                   # AI assistant (Sai)
│   │   ├── tools/                # Tool marketplace
│   │   ├── settings/             # User/org settings
│   │   └── layout.tsx            # Platform layout with sidebar
│   ├── api/                      # API routes (webhooks only)
│   │   ├── webhooks/
│   │   │   ├── stripe/           # Payment webhooks
│   │   │   └── supabase/         # Auth webhooks
│   │   └── health/               # Health check endpoint
│   ├── layout.tsx                # Root layout
│   ├── error.tsx                 # Global error boundary
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── features/                 # Feature-specific components
│   │   ├── crm/
│   │   ├── projects/
│   │   └── ai/
│   └── shared/                   # Shared components
│       ├── layouts/
│       ├── navigation/
│       └── errors/
├── lib/
│   ├── modules/                  # Feature modules
│   │   └── [feature]/
│   │       ├── actions/          # Server Actions
│   │       ├── queries/          # Data queries
│   │       ├── schemas/          # Zod schemas
│   │       ├── hooks/            # Custom hooks
│   │       ├── types/            # TypeScript types
│   │       └── index.ts          # Public API
│   ├── auth/                     # Auth utilities
│   │   ├── client.ts             # Supabase client
│   │   ├── middleware.ts         # Auth middleware
│   │   └── rbac.ts               # Role-based access
│   ├── database/
│   │   ├── prisma.ts             # Prisma client
│   │   └── queries.ts            # Common queries
│   └── utils/                    # Shared utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests
└── middleware.ts                 # Next.js middleware
```

**Architecture Notes:**
- **Industry-as-plugin architecture**: Multi-industry platform with industry-specific customizations
  - Core modules in `lib/modules/` (CRM, Projects, AI, Tasks)
  - Industry implementations in `lib/industries/[industry]/` (features, tools, overrides)
  - Shared tools in `lib/tools/shared/` (universal marketplace tools)
- **Feature-first organization**: Each business feature is a self-contained module
- **Role-Based Access Control (RBAC)**: Controls which modules users can access based on role and subscription tier
- **Configurable dashboard**: Main dashboard at `/dashboard` shows widgets from enabled modules based on user's industry and subscription tier
- **Modular components**: Each feature module has its own component directory

**📖 Architecture Documentation:**
- Primary architecture: [`docs/structure/STRUCTURE-OVERVIEW-1.md`](docs/structure/STRUCTURE-OVERVIEW-1.md)
- Future scaling: [`docs/structure/MULTI-INDUSTRY-ARCHITECTURE.md`](docs/structure/MULTI-INDUSTRY-ARCHITECTURE.md)
- Type system: [`docs/structure/TYPES-GUIDE.md`](docs/structure/TYPES-GUIDE.md)
- Tool system: [`docs/structure/tools-guide.md`](docs/structure/tools-guide.md)

---

## Common Development Commands

### Marketing Website (app/web/)

```bash
# Development
npm run dev              # Start dev server (tsx server/index.ts)

# Building
npm run build            # Build React app + Express server
npm run build:analyze    # Build with bundle analysis

# Type Checking
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push Drizzle schema changes
npm run db:migrate       # Run Supabase migrations
npm run supabase:start   # Start local Supabase

# Testing
npm run test             # Run tests
npm run test:e2e         # Run Playwright e2e tests
npm run test:coverage    # Generate coverage report

# Production
npm start                # Start production server
```

### SaaS Platform (app/)

```bash
# Setup
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations

# Development
npm run dev              # Start dev server (Turbopack)
npx prisma studio        # Database GUI
npm run lint:fix         # Fix linting issues

# Testing
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
npm test -- --watch      # Watch mode
npm run test:e2e         # E2E tests (if configured)

# Pre-commit (ALWAYS RUN - BLOCKS if fails)
npm run lint             # ESLint - Zero warnings
npx tsc --noEmit         # TypeScript - Zero errors
npm test                 # Tests - 80% coverage minimum

# Performance Analysis
ANALYZE=true npm run build    # Bundle analysis
npm run build -- --profile    # React profiling

# Production
npm run build            # Production build
npm start                # Start production server
```

---

## Critical Development Rules

### 🚫 Project Organization (NEVER DO THIS)

- ❌ **NEVER** create files without checking if they already exist (use Glob/Grep first!)
- ❌ **NEVER** create scripts or tests without checking for existing similar ones
- ❌ **NEVER** create random files in root directory
  - No session logs, chat_logs, random .md files
  - No image.png, test-results.json, etc.
- ❌ **NEVER** commit AI tool configs to source control
  - .claude/, .serena/ must be in .gitignore
- ❌ **NEVER** create parallel route conflicts
  - Both `app/(platform)/page.tsx` AND `app/(web)/page.tsx` = BUILD ERROR
  - Use single `app/page.tsx` with HostDependent pattern for host-based routing
- ❌ **NEVER** create monolithic "god files" over 500 lines (unless pure data/content)
- ❌ **NEVER** mix business logic with UI components
- ❌ **NEVER** use multiple ORMs (Prisma ONLY - no Drizzle, no raw SQL)
- ❌ **NEVER** create duplicate solutions (multiple DB clients, auth systems)
- ❌ **NEVER** skip Zod validation on inputs
- ❌ **NEVER** commit without: lint + typecheck + tests + 80% coverage
- ❌ **NEVER** expose credentials in code or git history

### ✅ Project Organization (DO THIS)

- ✅ All documentation goes in `docs/` directory
- ✅ Keep root directory clean (only essential config files)
- ✅ One file, one responsibility (Single Responsibility Principle)
- ✅ Files under 300 lines - split into smaller modules if exceeding (500 line limit in specific cases)
- ✅ Separate concerns: UI in `components/`, logic in `lib/`, types in `types/`
- ✅ Check for existing implementations before creating new files
- ✅ Update existing files instead of creating duplicates

### 📂 Root Directory Standards

**CRITICAL:** Keep root directory clean - NO random files allowed

**Prohibited in root:**
```
❌ .claude/ .serena/           # AI configs (add to .gitignore)
❌ chat-logs/ session-logs/    # Session data (move to docs/)
❌ *.md files                  # Documentation (move to docs/)
❌ test-*.ts                   # Tests (belongs in __tests__/)
❌ *.log files                 # Logs (add to .gitignore)
❌ database-migration/         # History (move to docs/migration-history/)
```

**Allowed in root:**
```
✅ package.json, package-lock.json
✅ next.config.mjs, tsconfig.json
✅ .env.local, .env.example
✅ .gitignore, .eslintrc
✅ README.md (only this one .md file)
```

**Correct locations:**
- Documentation → `docs/`
- AI configs → Local only (in .gitignore)
- Tests → `__tests__/` or co-located `*.test.ts`
- Scripts → `scripts/` or `tools/`

---

## Architecture Best Practices

### Modular Design (CRITICAL)

**The old codebase failed due to monolithic files. Follow these rules strictly:**

1. **Feature Module Pattern** (for `app/`)
   ```
   lib/modules/[feature]/
   ├── actions/         # Server Actions (mutations with validation)
   ├── queries/         # Database queries (read operations)
   ├── schemas/         # Zod validation schemas
   └── index.ts         # Public API
   ```

2. **Component Organization**
   - Keep components under 200 lines
   - Break into smaller, composable pieces
   - Separate presentational from container components
   - Co-locate related components in feature directories

3. **Business Logic Separation**
   - All data access in `lib/modules/[feature]/`
   - Never inline database queries in components
   - Use repository pattern for data access
   - Keep services pure and testable

4. **File Size Limits**
   - **Hard Limit:** 500 lines per file (enforced by ESLint)
     - Applies to all `.ts`/`.tsx` files
     - Exception: Pure data/content files (Blogs, Case Studies, Whitepapers, Articles, etc.)
     - Blocks PRs when exceeded
   - **Soft Targets (Code Review Warning):**
     - UI Components: 200 lines
     - Server Components: 250 lines
     - Services/Logic: 300 lines
     - API Routes: 150 lines
   - **When approaching soft target:** Extract reusable hooks/utilities, use component composition, separate concerns
   - **If exceeding:** Split into multiple files

### Dependency Management

**Production mindset - every dependency is a liability:**

- ✅ **Check existing dependencies first** before adding new ones
- ✅ **Justify each new package** - document why it's needed
- ✅ **Audit bundle impact** - check size before committing
- ✅ **Security audit** - check for known vulnerabilities
- ❌ **NEVER install multiple solutions for the same problem**

**Dependency Checklist:**
```yaml
Before adding:
  - Can existing deps solve this?
  - Can we build it in <100 lines?
  - Is it actively maintained?
  - Weekly downloads > 100k?
  - Last publish < 6 months?
  - Bundle size < 50kb?
  - Tree-shakeable?
  - TypeScript support?
```

### Single Source of Truth

**The old codebase mixed multiple solutions. Follow these strictly:**

#### For SaaS Platform (app/):
- ✅ **Database:** Prisma 6.16.2 + Supabase PostgreSQL (ONLY)
  - Single Prisma schema at `app/prisma/schema.prisma`
  - Migration command: `npx prisma migrate dev --name <description>`
  - **NO Drizzle, NO raw SQL, NO multiple ORMs**
  - Row Level Security (RLS) for multi-tenancy
- ✅ **Authentication:** Supabase Auth (built-in JWT)
  - httpOnly cookies for sessions
  - Auth middleware in `middleware.ts`
  - RBAC enforcement in all routes
- ✅ **State Management:**
  - Server state: TanStack Query
  - Client state: Zustand (only when needed)
  - Forms: React Hook Form + Zod
- ✅ **Data Fetching Hierarchy:**
  1. Server Components (default) - Direct DB
  2. Server Actions - Mutations with Zod validation
  3. Client Components - Interactive UI
  4. API Routes - Webhooks only (NO internal data fetching)

#### For Marketing Website (app/web/):
- Migration to Prisma in progress
- Follow SaaS architecture patterns
- Only make changes when explicitly requested

### Code Quality Gates

**Pre-commit Checklist (MANDATORY):**

```bash
# Run ALL before pushing - BLOCKS commit if fails
npm run lint             # Zero warnings (BLOCKS)
npx tsc --noEmit         # Zero errors (BLOCKS)
npm test                 # 80% coverage (BLOCKS)
```

**Testing Requirements (ENFORCED):**
```yaml
Approach: Test-Driven Development (TDD)
  - Write tests BEFORE implementation
  - 80% coverage is MINIMUM, not a target
  - Commit BLOCKED if coverage < 80%

Coverage Targets:
  Unit: 80% minimum (statements, branches)
  Integration: All Server Actions + API routes (100%)
  E2E: Critical user flows (auth, payment, core features)

Test File Structure:
  app/
  ├── __tests__/
  │   ├── components/
  │   ├── api/
  │   └── integration/
  ├── lib/
  │   └── modules/
  │       └── crm/
  │           ├── actions.ts
  │           └── actions.test.ts  # Co-located

Required Tests:
  - All Server Actions MUST have tests
  - All API routes MUST have tests
  - All business logic MUST have tests
```

### Performance Standards

**Core Web Vitals (MANDATORY):**
```yaml
Targets:
  LCP: < 2.5s        # Largest Contentful Paint
  FID: < 100ms       # First Input Delay
  CLS: < 0.1         # Cumulative Layout Shift
  TTFB: < 600ms      # Time to First Byte
  Bundle: < 500kb    # Initial JS load
```

**Optimization Patterns:**
```typescript
// 1. Server Components by default (80% of components)
async function Page() {
  const data = await prisma.user.findMany(); // Direct DB access
  return <UserList data={data} />;
}

// 2. Dynamic imports for heavy features
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <Skeleton />,
});

// 3. Image optimization ALWAYS
import Image from 'next/image';
<Image src="..." alt="..." width={...} height={...} priority />

// 4. Tree-shaking imports
import { debounce } from 'lodash-es';  // ✅ Tree-shakeable
import _ from 'lodash';                 // ❌ Imports entire library

// 5. Streaming with Suspense
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataComponent />
    </Suspense>
  );
}

// 6. Bundle analysis
// Run: ANALYZE=true npm run build
```

---

## Environment Variables

### Marketing Website (app/web/.env)
```bash
PORT=3000
SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASS=...
SESSION_SECRET=...
JWT_SECRET=...
NODE_ENV=development
```

### SaaS Platform (app/.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase (SaaS DB)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..." # NEVER expose to client

# AI Providers
OPENROUTER_API_KEY="..."          # Multi-model gateway
GROQ_API_KEY="..."                # Fast open-source models

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NODE_ENV="development"

# Security Note: Rotate all secrets quarterly
# Use different keys per environment (dev/staging/prod)
```

---

## Path Aliases

### Marketing Website (app/web/)
- `@/*` → `app/web/client/src/*`
- `@shared/*` → `app/web/shared/*`
- `@assets/*` → `app/web/attached_assets/*`

### SaaS Platform (app/)
- `@/*` → `app/*` (app root)

---

## Database Architecture

### 🔑 Hybrid Database Strategy (Prisma + Supabase)

**CRITICAL Understanding:** Prisma and Supabase are NOT alternatives - they work TOGETHER:

```
┌─────────────────────────────────────────────────────┐
│          Your Next.js Application                   │
│                                                     │
│  ┌──────────────┐         ┌──────────────┐        │
│  │    Prisma    │         │   Supabase   │        │
│  │  (ORM Tool)  │         │   (Client)   │        │
│  └──────┬───────┘         └──────┬───────┘        │
│         │                        │                 │
└─────────┼────────────────────────┼─────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────┐
│           Supabase Platform                         │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │   PostgreSQL    │  │      Auth       │         │
│  │   (Database)    │  │    Service      │         │
│  └─────────────────┘  └─────────────────┘         │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │    Storage      │  │   Realtime      │         │
│  │   (Files)       │  │   (Websocket)   │         │
│  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────┘
```

**Prisma is used for:** (connects to Supabase PostgreSQL)
- Complex database queries with joins
- Transactions (multi-step operations)
- Aggregations and analytics
- Schema migrations
- All Server Actions and mutations
- AI conversation storage and RAG (vector search)

**Supabase Client is used for:** (connects to Supabase services)
- Authentication (login, signup, sessions)
- Real-time database subscriptions
- File storage (avatars, documents)
- Live presence tracking (who's online)
- Typing indicators
- Live notifications

**Database Details:**
1. **SaaS Platform DB** (`app/`) ✅
   - Provider: Supabase PostgreSQL
   - ORM: Prisma 6.16.2
   - Schema: `app/prisma/schema.prisma`
   - Models: 13 total (User, Organization, Customer, Project, Task, AIConversation, etc.)
   - Multi-tenant with RLS (Row Level Security)
   - Connection: Both Prisma AND Supabase client connect to this same database

2. **Marketing Site DB** (`app/web/`) - Migration in progress
   - Currently: Drizzle ORM (legacy)
   - Migrating to: Prisma (to match SaaS architecture)

**See comprehensive guide:** [`docs/database/PRISMA-SUPABASE-STRATEGY.md`](docs/database/PRISMA-SUPABASE-STRATEGY.md)

---

## Subscription Tiers & Access Control

The SaaS platform has **4 subscription tiers** with different module access:

- **Tier 0 (FREE):** Very low rate limit with open source models, basic features
- **Tier 1 ($299):** Basic dashboard, 3 tools, best for solopreneurs & startups
- **Tier 2 ($699):** Industry-specific dashboard, 10 tools, best for SMEs & growth
- **Tier 3 (Enterprise/Custom):** Fully customized dashboard, unlimited tools, custom workflows

**RBAC Implementation:**
- Middleware checks user role and subscription tier
- Each route protected by role/tier requirements
- Dashboard shows only modules user has access to
- Module access controlled via `lib/rbac.ts`

---

## Testing Strategy

### Unit Tests
- Test business logic in `lib/modules/`
- Test utilities and helpers
- Mock external dependencies (DB, APIs)

### Integration Tests
- Test API routes with real database (test DB)
- Test authentication flows
- Test RBAC enforcement

### E2E Tests (Playwright)
- Test critical user flows
- Test across subscription tiers
- Test role-based access

**Coverage Goals:**
- Minimum 80% for new code
- 100% for critical paths (auth, billing, RBAC)

---

## Security Requirements

### Core Security Checklist
```typescript
// 1. Input validation (ALWAYS)
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
});

// 2. SQL injection prevention
✅ prisma.user.findMany({ where: { name: input }})
❌ prisma.$queryRaw(`SELECT * WHERE name = '${input}'`)

// 3. XSS prevention
✅ <div>{userContent}</div>  // React escapes
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 4. Rate limiting
const { success } = await rateLimit(identifier);
if (!success) return new Response('Too Many Requests', { status: 429 });

// 5. Server-only protection (for sensitive operations)
import 'server-only'; // At top of file - prevents client imports

// 6. Environment validation (add to app startup)
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});
envSchema.parse(process.env);
```

### Multi-tenancy Security (RLS)
```sql
CREATE POLICY "Tenant isolation"
ON all_tables
USING (org_id = current_user_org());
```

### Environment Security & Credential Protection
- **NEVER expose:** `SUPABASE_SERVICE_ROLE_KEY`, API keys, database credentials
- Check git history for exposed secrets: `git log -p | grep -i "password\|secret\|key"`
- Use `.env.example` with dummy values only
- Never commit `.claude/settings.local.json` or similar config files
- Rotate secrets quarterly
- Use different keys per environment
- Enable audit logging for all data access

---

## Deployment

### Marketing Website
- **Platform:** Vercel
- **Environment:** Production config in `.env.production`
- **Domain:** `strivetech.ai`

### SaaS Platform
- **Platform:** Vercel
- **Environment:** Set in Vercel dashboard
- **Domain:** `app.strivetech.ai`
- **Cookie sharing:** Domain set to `.strivetech.ai` for auth

---

## Core Development Principles

### 🎯 Production Mindset
1. **Server-first architecture** - Minimize client-side JavaScript
2. **Type safety everywhere** - TypeScript + Zod validation
3. **Security by default** - Never trust user input
4. **Performance budgets** - Monitor Core Web Vitals
5. **Test-driven development** - Write tests first
6. **Clean architecture** - Separation of concerns
7. **Progressive enhancement** - Works without JavaScript
8. **Accessibility first** - WCAG 2.1 AA compliance
9. **Documentation as code** - Keep docs in sync
10. **Continuous improvement** - Measure and iterate

### ⚠️ Critical Rules
- **File size limits:** Components 200 lines, Services 300 lines, Hard limit 500 lines (exception for data: Blogs, Case Studies, Whitepapers, Articles, etc.)
- **No cross-module imports** - Modules are self-contained (may change in future with data/information transfer system)
- **One solution per problem** - No duplicate dependencies
- **Always run pre-commit checks** - lint, typecheck, test
- **Server Components by default** - "use client" only when needed
- **API routes for webhooks only** - Use Server Actions for mutations

### 📋 Session Checklist

**Before starting any task:**
- [ ] Check if files/scripts/tests already exist (use Glob/Grep)
- [ ] Read existing code (use Read tool on files to modify)
- [ ] Write tests first (TDD approach for new features)
- [ ] Check for route group conflicts
- [ ] Avoid cross-module imports

**During implementation:**
- [ ] Using Server Components by default?
- [ ] Server Actions for mutations with Zod validation?
- [ ] "use client" only when truly needed?
- [ ] Heavy components use dynamic() imports?
- [ ] Slow operations wrapped in Suspense?

**Before completing any task:**
- [ ] Lint passes with zero warnings (BLOCKS)
- [ ] TypeScript has zero errors (BLOCKS)
- [ ] Tests pass with 80%+ coverage (BLOCKS)
- [ ] Security considered (XSS, CSRF, SQL, credentials)
- [ ] Performance impact assessed
- [ ] No cross-module imports
- [ ] Files under size limits (400 soft, 500 hard)
- [ ] No exposed secrets or credentials
- [ ] Run: `npm run lint && npx tsc --noEmit && npm test`

**Remember:** This is a production system. Every line of code should be secure, performant, and maintainable. Secure > Fast > Pretty. No shortcuts.