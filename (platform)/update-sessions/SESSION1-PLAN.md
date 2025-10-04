# Session 1: Critical Structure Fixes - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~1.5-2 hours
**Dependencies:** None
**Parallel Safe:** No (must run first, blocks all other sessions)

---

## 🎯 Session Objectives

Fix critical Next.js structure issues that prevent the platform from building and running correctly. This is **URGENT** and must be completed before any other work.

**What's Broken:**
- ❌ `app/styling/` folder containing root layout/page (breaks Next.js)
- ❌ Missing root files at `app/` level
- ❌ `.env` committed instead of `.env.local`
- ❌ Missing `.env.example` for team
- ❌ Legacy `components/(web)/` in platform project
- ❌ Shared Prisma connection not configured

**What's Needed:**
- ✅ Root files at `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- ✅ `app/favicon.ico` for browser icon
- ✅ `.env.local` (gitignored) and `.env.example` (committed)
- ✅ Shared Prisma schema connection
- ✅ Clean component structure
- ✅ Verified working build

---

## 📋 Task Breakdown

### Phase 1: Fix Next.js Root Structure (30 minutes) ⚠️ URGENT

#### Step 1.1: Move Files from app/styling/ to app/
- [ ] Verify current structure: `ls app/styling/`
- [ ] Move layout.tsx: `mv app/styling/layout.tsx app/layout.tsx`
- [ ] Move globals.css: `mv app/styling/globals.css app/globals.css`
- [ ] Move page.tsx: `mv app/styling/page.tsx app/page.tsx`
- [ ] Delete empty styling folder: `rm -rf app/styling/`
- [ ] Verify files exist at root: `ls app/ | grep -E "(layout|page|globals)"`

**Expected Result:**
```
app/
├── layout.tsx      ✅ Moved from styling/
├── page.tsx        ✅ Moved from styling/
└── globals.css     ✅ Moved from styling/
```

**Why This Is Critical:**
- Next.js requires root `layout.tsx` at `app/layout.tsx`
- Root page must be at `app/page.tsx`
- Having them in subdirectory causes routing failures
- **App won't build/run without this fix!**

**Success Criteria:**
- [ ] `app/layout.tsx` exists
- [ ] `app/page.tsx` exists
- [ ] `app/globals.css` exists
- [ ] `app/styling/` directory deleted

---

#### Step 1.2: Add Missing favicon.ico
- [ ] Check if favicon exists: `ls app/favicon.ico`
- [ ] If missing, copy or create 32x32 or 64x64 .ico file
- [ ] Place at: `app/favicon.ico`
- [ ] Next.js will automatically serve from `/favicon.ico`

**Recommended:**
- Use Strive Tech brand colors/logo
- 32x32 or 64x64 pixel .ico format
- Transparent background

**Success Criteria:**
- [ ] `app/favicon.ico` exists
- [ ] File is valid .ico format
- [ ] Size is 32x32 or 64x64 pixels

---

### Phase 2: Environment Variables Setup (20 minutes)

#### Step 2.1: Fix Environment Files
- [ ] Rename `.env` to `.env.local`: `mv .env .env.local`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Create `.env.example` with dummy values (see template below)
- [ ] Commit `.env.example` to git

**Create `.env.example`:**
```bash
# Database (Supabase PostgreSQL via shared schema)
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..." # Server-only, NEVER expose

# AI Providers
OPENROUTER_API_KEY="sk-or-..."
GROQ_API_KEY="gsk_..."

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe (Future)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Success Criteria:**
- [ ] `.env.local` exists and is gitignored
- [ ] `.env.example` exists with dummy values
- [ ] No secrets in `.env.example`
- [ ] `.env.example` committed to git

---

### Phase 3: Shared Database Connection (30 minutes)

#### Step 3.1: Update package.json Scripts
- [ ] Read current `package.json` scripts
- [ ] Add Prisma scripts pointing to shared schema:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate --schema=../shared/prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev --schema=../shared/prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=../shared/prisma/schema.prisma",
    "prisma:push": "prisma db push --schema=../shared/prisma/schema.prisma"
  }
}
```

- [ ] Run: `npm run prisma:generate`

**Success Criteria:**
- [ ] Prisma scripts added to package.json
- [ ] `npm run prisma:generate` succeeds
- [ ] Prisma client generated from shared schema

---

#### Step 3.2: Create Prisma Client Singleton
- [ ] Create directory: `mkdir -p lib/database`
- [ ] Create file: `lib/database/prisma.ts`
- [ ] Add content (see below)
- [ ] Test import: `import { prisma } from '@/lib/database/prisma'`

**Create `lib/database/prisma.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why Singleton Pattern:**
- Prevents multiple Prisma clients in development
- Avoids connection pool exhaustion
- Next.js hot reload safe

**Success Criteria:**
- [ ] `lib/database/prisma.ts` created
- [ ] File exports `prisma` singleton
- [ ] Imports work from other files
- [ ] No TypeScript errors

---

### Phase 4: Clean Up Legacy Code (20 minutes)

#### Step 4.1: Handle components/(web)/ Folder
- [ ] Check if `components/(web)/` exists
- [ ] List contents: `ls components/(web)/`
- [ ] **Decision needed:** Move to (website) project OR delete if unused

**Option 1: Move to Website Project**
```bash
# If these components belong in website
mv components/(web) ../(website)/components/
```

**Option 2: Delete if Unused**
```bash
# If components are not used anywhere
# Verify with search first: grep -r "components/(web)" .
rm -rf components/(web)
```

- [ ] Update any imports if components were moved
- [ ] Verify no broken imports: `npm run type-check`

**Success Criteria:**
- [ ] `components/(web)/` removed from platform project
- [ ] All imports updated (if moved)
- [ ] No TypeScript errors from broken imports

---

### Phase 5: Verification & Build (20 minutes)

#### Step 5.1: Clean Install
- [ ] Remove old artifacts: `rm -rf node_modules .next`
- [ ] Fresh install: `npm install`
- [ ] Verify dependencies: `npm list --depth=0`

**Success Criteria:**
- [ ] Clean install completes without errors
- [ ] All peer dependencies satisfied

---

#### Step 5.2: Type Check
- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] Fix any errors found
- [ ] Re-run until 0 errors

**Expected Errors to Fix:**
- Missing imports after structure changes
- Path alias issues (@/ imports)
- Type mismatches from Prisma

**Success Criteria:**
- [ ] TypeScript compiles with 0 errors
- [ ] No type warnings

---

#### Step 5.3: Lint Check
- [ ] Run linter: `npm run lint`
- [ ] Auto-fix issues: `npm run lint -- --fix`
- [ ] Manually fix remaining issues

**Success Criteria:**
- [ ] Linter passes with 0 warnings
- [ ] No style violations

---

#### Step 5.4: Build Verification
- [ ] Build for production: `npm run build`
- [ ] Check build output for errors
- [ ] Verify route generation
- [ ] Check bundle size

**Expected Build Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    X kB
├ ○ /dashboard                           X kB
├ ○ /login                               X kB
...
```

**Success Criteria:**
- [ ] Build completes successfully
- [ ] 0 errors, 0 warnings
- [ ] All routes generated
- [ ] Bundle size reasonable (< 500kb initial)

---

#### Step 5.5: Dev Server Test
- [ ] Start dev server: `npm run dev`
- [ ] Visit `http://localhost:3000`
- [ ] Check root page loads
- [ ] Check favicon appears in browser tab
- [ ] Check console for errors
- [ ] Test navigation to other routes

**Success Criteria:**
- [ ] Dev server starts without errors
- [ ] Root page renders
- [ ] Favicon displays
- [ ] No console errors
- [ ] Navigation works

---

## 📊 Files to Create/Update

### Files to Move (3 files)
```
app/styling/layout.tsx    → app/layout.tsx      # 🔄 Move
app/styling/page.tsx      → app/page.tsx        # 🔄 Move
app/styling/globals.css   → app/globals.css     # 🔄 Move
```

### Files to Create (4 files)
```
app/favicon.ico                    # ✅ Create (32x32 or 64x64)
.env.example                       # ✅ Create (template with dummy values)
lib/database/
└── prisma.ts                      # ✅ Create (Prisma singleton)
```

### Files to Update (2 files)
```
.env                               # 🔄 Rename to .env.local
package.json                       # 🔄 Add Prisma scripts
```

### Files/Directories to Delete (2 items)
```
app/styling/                       # ❌ Delete (empty after moves)
components/(web)/                  # ❌ Delete or move to (website)
```

**Total:** 11 file operations (3 moves, 4 creates, 2 updates, 2 deletes)

---

## 🎯 Success Criteria

**MANDATORY - All must pass:**
- [ ] `app/layout.tsx` exists at root level
- [ ] `app/page.tsx` exists at root level
- [ ] `app/globals.css` exists at root level
- [ ] `app/favicon.ico` exists
- [ ] `app/styling/` directory deleted
- [ ] `.env.local` exists and is gitignored
- [ ] `.env.example` exists and is committed
- [ ] Prisma scripts added to package.json
- [ ] `lib/database/prisma.ts` created
- [ ] Prisma client generates successfully
- [ ] `components/(web)/` removed from platform
- [ ] TypeScript compiles: 0 errors
- [ ] Linter passes: 0 warnings
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Root page accessible at `localhost:3000`

**Quality Checks:**
- [ ] All imports updated correctly
- [ ] No broken paths or aliases
- [ ] Favicon displays in browser
- [ ] No console errors in dev mode
- [ ] Bundle size under 500kb

---

## 🔗 Integration Points

### With Root Project
```typescript
// Uses shared Prisma schema
import { prisma } from '@/lib/database/prisma';
// Connects to: ../shared/prisma/schema.prisma
```

### With Environment Variables
```typescript
// Validates at startup
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
});
```

### With Next.js App Router
```
app/
├── layout.tsx          # Root layout (required by Next.js)
├── page.tsx           # Root page at /
├── globals.css        # Global styles
├── favicon.ico        # Browser icon
├── (platform)/        # Protected routes
├── (auth)/           # Auth routes
└── api/              # API routes
```

---

## 📝 Implementation Notes

### Next.js File Requirements
```
REQUIRED at app/ root:
- layout.tsx      → Wraps all pages, required for App Router
- page.tsx        → Root route (/) content
- globals.css     → Global styles (imported in layout)

OPTIONAL but recommended:
- favicon.ico     → Browser tab icon
- not-found.tsx   → Custom 404 page
- error.tsx       → Custom error page
```

### Environment Variable Best Practices
```bash
# .env.local (gitignored, never commit)
DATABASE_URL="postgresql://real_credentials_here"
SUPABASE_SERVICE_ROLE_KEY="actual_secret_key"

# .env.example (committed, team reference)
DATABASE_URL="postgresql://user:password@host:5432/db"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

### Prisma Connection Pattern
```typescript
// WRONG - Creates new client each time
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// RIGHT - Singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 🚀 Quick Start Commands

```bash
# Phase 1: Fix Structure
mv app/styling/layout.tsx app/layout.tsx
mv app/styling/globals.css app/globals.css
mv app/styling/page.tsx app/page.tsx
rm -rf app/styling/

# Phase 2: Environment
mv .env .env.local
# Create .env.example (see template above)

# Phase 3: Database
npm run prisma:generate

# Phase 4: Verify
rm -rf node_modules .next
npm install
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

---

## 🔄 Dependencies

**Requires (from setup):**
- Node.js installed
- npm packages installed
- Shared Prisma schema exists at `../shared/prisma/schema.prisma`

**Blocks (must complete before):**
- **SESSION2** (Auth & RBAC) - Needs working app structure
- **SESSION3** (UI/UX) - Needs root layout
- **SESSION4** (Security) - Needs database connection
- **SESSION5** (Testing) - Needs working build
- **SESSION6** (Deployment) - Needs all fixes applied

**Enables:**
- Working Next.js app structure
- Database queries via Prisma
- Proper environment variable management
- Clean build and development workflow

---

## 📖 Reference Files

**Must read before starting:**
- `app/styling/layout.tsx` - Current (wrong) location
- `app/styling/page.tsx` - Current (wrong) location
- `../shared/prisma/schema.prisma` - Shared database schema
- `.gitignore` - Verify .env.local is listed
- `package.json` - Current scripts

**Next.js Documentation:**
- [App Router File Conventions](https://nextjs.org/docs/app/building-your-application/routing#file-conventions)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

**Prisma Documentation:**
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

## ⚠️ Critical Warnings

**DO NOT:**
- ❌ Skip the app/styling/ fix - app won't work without it
- ❌ Commit `.env` or `.env.local` - contains secrets
- ❌ Delete Prisma client before fixing imports
- ❌ Move components without updating imports
- ❌ Skip verification steps - may break later sessions

**MUST:**
- ✅ Complete this session before ANY other work
- ✅ Verify build succeeds before proceeding
- ✅ Test dev server runs without errors
- ✅ Ensure all TypeScript/lint checks pass

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Must complete first!
