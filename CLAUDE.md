# CLAUDE-CONCISE.md

**Claude's Session Memory | v3.0 | Production Standards**

> ## 🔴 CRITICAL: READ-BEFORE-EDIT MANDATE
>
> **YOU MUST FOLLOW THESE STEPS BEFORE ANY ACTION:**
>
> 1. **READ FIRST** - Always use Read tool on any file before editing it
> 2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files, scripts, or tests already exist
>    - Don't create `test-*.ts` if similar test files exist
>    - Don't create utility functions if they already exist elsewhere
>    - Don't create new components if similar ones exist
> 3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones (99% of the time)
> 4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first
>
> **For comprehensive documentation:** See [`docs/README.md`](docs/README.md) for detailed architecture, complete command references, and expanded explanations.

---

## 🎯 PROJECT: Strive Tech SaaS Platform

**Location:** `app/` → app.strivetech.ai (Next.js project root)
**Stack:** Next.js 15.5.4 + React 19.1.0 + TypeScript + Prisma + Supabase
**Focus:** Enterprise B2B, Multi-tenant, 3-tier subscriptions, and used internally by Strive Tech daily (employees & admins)

> **NOTE:** `app/web/` = legacy marketing site (DO NOT MODIFY unless asked)
> **IMPORTANT:** Next.js App Router files are in `app/app/` subdirectory

---

## ⚡ TECH STACK

```yaml
Core: Next.js 15.5.4, React 19.1.0, TypeScript 5.6+

# Database & Backend
Database Provider: Supabase (PostgreSQL hosting)
ORM: Prisma 6.16.2 (connects to Supabase DB)
Auth: Supabase Auth (JWT in httpOnly cookies)
Storage: Supabase Storage
RLS: Supabase Row Level Security

State: TanStack Query (server) + Zustand (client, if needed)
Forms: React Hook Form + Zod
AI: OpenRouter + Groq
Payments: Stripe
Testing: Jest + React Testing Library (80% min) + Playwright
```

**IMPORTANT:** Supabase and Prisma work TOGETHER:
- **Supabase** = Database provider (PostgreSQL) + Auth + Storage + RLS
- **Prisma** = ORM tool to query the Supabase database
- They are NOT alternatives - Prisma connects TO Supabase
## 🎨 DESIGN SYSTEM (Must Use Old Site Color Scheme)


## 📁 STRUCTURE

```
app/                          # Next.js project root
├── app/                      # App Router directory (Next.js requirement)
│   ├── page.tsx             # Root page (redirects to /platform/dashboard)
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── (platform)/          # Protected: dashboard, crm, projects, ai, tools
│   ├── (web)/               # Marketing routes (legacy)
│   ├── api/                 # Webhooks ONLY
│   └── favicon.ico
├── components/
│   ├── ui/                  # shadcn
│   ├── features/            # Feature-specific
│   └── shared/              # Layouts, nav
├── lib/
│   └── modules/[feat]/      # Self-contained modules
│       ├── actions/         # Server Actions
│       ├── queries/         # Data fetching
│       ├── schemas/         # Zod
│       └── index.ts         # Public API
├── middleware.ts            # Auth + RBAC
├── package.json
└── next.config.mjs
```

---

## 🔴 CRITICAL RULES

### DEFAULT: Server Components ALWAYS
```typescript
// DEFAULT - no directive needed
async function Page() {
  const data = await prisma.user.findMany(); // ✅ Direct DB
  return <div>{data}</div>;
}

// ONLY add "use client" for:
// - useState, useEffect, or any hooks
// - onClick, onChange, or any event handlers
// - Browser APIs (window, document)
// - Third-party client libraries
```

### Data Fetching Hierarchy
1. **Server Components** (default) → Direct DB access
2. **Server Actions** → Mutations with validation
3. **Client Components** → Interactive UI only
4. **API Routes** → Webhooks ONLY

### Architecture Laws
- **NO cross-module imports** (`crm/` ❌→ `projects/`) -> User: This will definitely have to change in the future unless we can setup data or information transfer system (whatever is more efficient)
- **Edit existing files** - don't create new ones unless necessary
- **NO route group conflicts** - Never create parallel `page.tsx` in different route groups that resolve to same path
  - ❌ WRONG: Both `app/(platform)/page.tsx` AND `app/(web)/page.tsx` (conflict at `/`)
  - ✅ RIGHT: Single `app/page.tsx` using HostDependent pattern for host-based routing
- **Middleware complexity limit** - Keep under 200 lines; extract concerns into separate files when approaching limit
  - Extract: `lib/middleware/auth.ts`, `lib/middleware/cors.ts`, `lib/middleware/routing.ts`

### File Size Standards
**Hard Limit:** 500 lines per file (enforced by ESLint)
- Applies to all `.ts`/`.tsx` files
- Exception: Pure data/content files (no logic)
- Blocks PRs when exceeded

**Soft Targets (Code Review Warning):**
- UI Components: 200 lines
- Server Components: 250 lines
- Services/Logic: 300 lines
- API Routes: 150 lines

**When approaching soft target:**
- Extract reusable hooks/utilities
- Use component composition
- Separate concerns into modules
- Consider if file has multiple responsibilities

**Refactoring triggers:**
- File reaches 400+ lines
- Multiple responsibilities in one file
- Difficulty testing or understanding
- Logic that could be reused elsewhere

### Single Source of Truth

**Database Stack (Supabase + Prisma):**
- **Database Provider:** Supabase PostgreSQL (hosting + RLS)
- **ORM:** Prisma 6.16.2 ONLY (no Drizzle, no raw SQL, no multiple ORMs)
  - Single Prisma schema at `app/prisma/schema.prisma`
  - Connects to Supabase via `DATABASE_URL`
  - Migration command: `npx prisma migrate dev --name <description>`
  - NO separate database clients or ORM strategies

**How they work together:**
```typescript
// Prisma connects TO Supabase database
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Points to Supabase PostgreSQL
}

// Your code uses Prisma to query Supabase
import { prisma } from '@/lib/prisma';
const users = await prisma.user.findMany(); // Queries Supabase DB
```

**Other Single Sources:**
- **Auth:** Supabase Auth ONLY
- **Storage:** Supabase Storage ONLY
- **Types:** `@prisma/client` ONLY
- **Validation:** Zod ALWAYS

### Root Directory Standards
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

## 🔒 SECURITY MANDATES

```typescript
// 1. ALWAYS validate input
const schema = z.object({ email: z.string().email() });

// 2. SQL injection prevention
✅ prisma.user.findMany({ where: { name }})
❌ prisma.$queryRaw(`SELECT * WHERE name='${name}'`)

// 3. XSS prevention
✅ <div>{userContent}</div>
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 4. Rate limiting
if (!await rateLimit(id)) return new Response('429', { status: 429 });

// 5. Multi-tenancy (RLS)
CREATE POLICY "tenant_isolation" ON tables USING (org_id = current_org());

// 6. Server-only protection (for sensitive operations)
import 'server-only'; // At top of file - prevents client imports

// 7. Environment validation (add to app startup)
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});
envSchema.parse(process.env);
```

**NEVER expose:** `SUPABASE_SERVICE_ROLE_KEY`, API keys, database credentials

**Credential Protection:**
- Check git history for exposed secrets: `git log -p | grep -i "password\|secret\|key"`
- Use `.env.example` with dummy values only
- Never commit `.claude/settings.local.json` or similar config files

---

## 🚀 PERFORMANCE TARGETS

```yaml
LCP: < 2.5s
FID: < 100ms
CLS: < 0.1
Bundle: < 500kb
Server Components: 80%+
```

```typescript
// Always optimize
import Image from 'next/image'; // ✅
<img src="..." /> // ❌

import { debounce } from 'lodash-es'; // ✅
import _ from 'lodash'; // ❌

const Heavy = dynamic(() => import('./Heavy'), { ssr: false }); // ✅
```

---

## ✅ PRE-COMMIT CHECKLIST

**MANDATORY before ANY commit:**
```bash
npm run lint        # Zero warnings (BLOCKS commit)
npx tsc --noEmit    # Zero errors (BLOCKS commit)
npm test            # 80% coverage (BLOCKS commit)
```

**Testing Requirements (ENFORCED):**
- Write tests BEFORE implementation (TDD approach)
- 80% coverage is MINIMUM, not a target
- Tests must exist in `__tests__/` or co-located `*.test.ts`
- All Server Actions MUST have tests
- All API routes MUST have tests
- Run tests before committing: `npm test -- --coverage`

**Test File Structure:**
```
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
```

**Ask yourself:**
- [ ] Tests written FIRST (TDD)?
- [ ] 80%+ coverage achieved?
- [ ] Server Component or needs "use client"?
- [ ] Input validated with Zod?
- [ ] No cross-module imports?
- [ ] Files under 200/300 lines?
- [ ] Security considered (XSS, CSRF, SQL)?
- [ ] Performance impact assessed?
- [ ] No credentials in commit?

---

## 🛠 COMMANDS

```bash
# Setup
npx prisma generate && npx prisma migrate dev

# Development
npm run dev          # Turbopack dev server
npx prisma studio    # Database GUI

# Pre-commit (ALWAYS)
npm run lint && npx tsc --noEmit && npm test

# Performance Analysis
ANALYZE=true npm run build    # Bundle analysis
npm run build -- --profile    # React profiling

# Testing
npm test                      # Run all tests
npm test -- --coverage        # With coverage report
npm test -- --watch          # Watch mode
npm run test:e2e             # E2E tests (if configured)
```

**Performance Optimization Patterns:**
```typescript
// 1. Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <Skeleton />,
});

// 2. Server Component data fetching (default)
async function Page() {
  const data = await prisma.user.findMany(); // Direct DB access
  return <UserList data={data} />;
}

// 3. Streaming with Suspense
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataComponent />
    </Suspense>
  );
}

// 4. Optimized imports
import { debounce } from 'lodash-es';  // ✅ Tree-shakeable
import _ from 'lodash';                // ❌ Imports entire library
```

---

## 🎯 CORE PRINCIPLES

1. **Server-first** - Minimize client JS
2. **Type safety** - TypeScript + Zod everywhere
3. **Security by default** - Never trust input
4. **Test-driven** - Write tests first
5. **Clean architecture** - Separation of concerns
6. **One solution per problem** - No duplicates
7. **Production mindset** - Every line matters

---

## 📋 MODULE PATTERN

```typescript
// lib/modules/crm/index.ts (Public API)
export { createCustomer, getCustomers } from './actions';
export { CustomerSchema } from './schemas';
export type { Customer } from '@prisma/client';

// NO cross-imports between modules!
```

---

## ❌ NEVER DO THIS

```typescript
// Anti-patterns to AVOID
❌ Create files without checking if they already exist (use Glob/Grep first!)
❌ Create scripts or tests without checking for existing similar ones
❌ Creating files in root directory (logs, .md files, images, configs)
❌ Commit AI tool configs (.claude/, .serena/)
❌ Create parallel route conflicts (both (platform)/page.tsx and (web)/page.tsx)
❌ import from '../modules/other-module' (cross-module imports)

// Database & ORM
❌ Use multiple ORMs (Prisma ONLY connects to Supabase - no Drizzle!)
❌ Try to replace Supabase with Prisma (they work TOGETHER)
❌ prisma.$queryRaw with string interpolation
❌ Direct database access bypassing Prisma ORM
❌ Multiple database clients or connection strategies

// Code Quality
❌ "use client" without a valid reason (hooks, events, browser APIs only)
❌ <img> instead of Next.js Image
❌ API routes for internal data fetching (use Server Actions)
❌ Files over 400 lines (500 absolute max - will block PR)
❌ Skipping Zod validation on any input
❌ Committing without: lint + typecheck + tests + 80% coverage
❌ Exposing credentials in code or git history
❌ Import entire libraries (import _ from 'lodash') instead of tree-shakeable imports
```

---

## 🔗 QUICK REFS

- **Tiers:** 5 subscription levels - Starter | Growth | Elite | Custom | Enterprise (pricing & features TBD)
- **Modules vs Tools:**
  - **Modules** = Core dashboards/pages (CRM Dashboard, Projects, AI, etc.) in `lib/modules/`
  - **Tools** = Add-on utilities in `lib/tools/` that integrate into modules or work standalone
- **Models:** User, Organization, Customer, Project, Task, AIConversation (13 total)
- **Docs:** `CLAUDE.md` (full), `DASHBOARD_BUILD_PLAN.md`, `feature-&-tool-marketplace.md`

---

## 🎯 DECISION TREE

**Before you start:**
1. **Check if it exists** → Use Glob/Grep to search for similar files/functions
2. **Read existing code** → Use Read tool on any file you'll modify
3. **Write tests first** → TDD approach for new features
4. **Check for conflicts** → Avoid route group conflicts, cross-module imports

**During implementation:**
- **Need to fetch data?** → Server Component (default)
- **Need to mutate data?** → Server Action with Zod validation
- **Need interactivity?** → "use client" Component (minimize usage)
- **External webhook?** → API Route (internal data = Server Action)
- **File too big?** → Split it before it hits 400 lines
- **Cross-module data?** → Use @prisma/client types only
- **Heavy component?** → dynamic() import with ssr: false
- **Slow operation?** → Wrap in Suspense boundary

**Before committing:**
1. **Run quality checks** → `npm run lint && npx tsc --noEmit && npm test`
2. **Verify coverage** → Must be 80%+ or commit BLOCKS
3. **Check file sizes** → No files over 500 lines
4. **Security review** → All inputs validated, no exposed secrets
5. **Performance check** → Bundle impact acceptable

---

**Remember:** This is PRODUCTION. Secure > Fast > Pretty. No shortcuts.