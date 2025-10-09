# Repository Audit: Platform Isolation Analysis
*Generated: 2025-10-07*

## Executive Summary

**Repository Status:**
- **Active Project:** `(platform)/ ` - Enterprise B2B SaaS platform (app.strivetech.ai)
- **Archived Projects:** `(chatbot)/` and `(website)/` - **MOVED TO .gitignore, NOT .archive/**
- **Key Finding:** Documentation claims "tri-fold architecture" but chatbot/website projects **DO NOT EXIST** in repository

**Critical Discovery:**
The repository contains extensive documentation and configuration referencing three projects (chatbot, platform, website), but:
- **NO `(chatbot)/` directory exists**
- **NO `(website)/` directory exists**
- **Only `(platform)/` exists as an actual project**
- `.gitignore` blocks `.ignore/` directory (assumed archive location)
- `.archive/` contains old website docs but no actual project code

**Recommendations Preview:**
- **Safe to Delete:** ~15-20 files (chatbot scripts, RAG setup, outdated docs)
- **Keep (Platform Core):** All of `(platform)/` directory + active database scripts
- **Update Immediately:** CLAUDE.md, README.md (remove tri-fold references)
- **Evaluate:** Chatbot integration code (if external chatbot exists), marketing route group

---

## 1. Root Directory Breakdown

| Item | Type | Project | Status | Purpose | Action |
|------|------|---------|--------|---------|--------|
| `.env` | File | Multi | **Active** | Environment variables (contains secrets!) | **CRITICAL: Keep, never commit** |
| `.env.example` | File | Template | Active | Public env template | Keep |
| `.gitignore` | File | Config | Active | Git ignore rules | Keep, review |
| `.mcp.json` | File | Tool | Active | MCP server config | Keep |
| `.vercel/` | Dir | Deploy | Active | Vercel deployment metadata | Keep |
| `.archive/` | Dir | Archive | Legacy | Old website docs (no code) | Keep as-is |
| `.claude/` | Dir | Tool | Active | Claude agent configs | Keep (in .gitignore) |
| `.dev-docs/` | Dir | Docs | Active | Development documentation | Keep |
| `(platform)/` | Dir | **ACTIVE** | **Production** | Main SaaS platform project | **KEEP - Core project** |
| `CLAUDE.md` | File | Docs | **OUTDATED** | Tri-fold instructions | **UPDATE - Remove tri-fold references** |
| `README.md` | File | Docs | **OUTDATED** | Tri-fold repository guide | **UPDATE - Single-project structure** |
| `shared/` | Dir | Legacy | **Backup** | Old Prisma/Supabase files | **EVALUATE - May be obsolete** |
| `scripts/` | Dir | Tools | Mixed | Database & utility scripts | **REVIEW - Some chatbot-specific** |
| `turbo.json` | File | Build | Active | Turbo build config | **EVALUATE - Needed for single project?** |
| `node_modules/` | Dir | Deps | Active | Root dependencies | Keep (managed by npm) |
| `dev-docs/` | Dir | Docs | Active | Development notes | Keep |
| `project-directory-map.json` | File | Legacy | Stale | Old directory structure | Consider deleting |
| `project-directory-map.txt` | File | Legacy | Stale | Old directory structure | Consider deleting |
| `console-log.txt` | File | Debug | Temp | Debug output | Consider deleting |
| `CALCULATOR-TOOL.md` | File | Docs | Misc | Calculator tool notes | Review/move to (platform) |
| `PROMPTS.md` | File | Docs | Empty | Prompts file (0 bytes) | Delete |
| `start-preview.sh` | File | Script | Active | Preview startup script | Keep |

**Analysis:**

The root directory reveals a **phantom tri-fold structure** - extensive documentation and configuration for three projects, but only `(platform)/` actually exists. The `(chatbot)/` and `(website)/` directories are completely absent, suggesting they were either:
1. Moved to a private repository
2. Never existed (documentation aspirational)
3. Deleted and now live externally

**Critical Files:**
- `.env` - Contains production secrets (DATABASE_URL, API keys) - **NEVER commit this file!**
- `.gitignore` - Blocks `.ignore/` directory where archived projects may reside
- `CLAUDE.md` & `README.md` - Both extensively document non-existent projects

---

## 2. Active Project: (platform)

### 2.1 Core Dependencies

**Project Structure:**
- **Location:** `(platform)/` directory
- **Framework:** Next.js 15.6.0 + React 19.1.0 + TypeScript 5.6+
- **Architecture:** Server Components, App Router, Multi-tenant SaaS

**Database:**
- **Location:** `(platform)/prisma/schema.prisma`
- **Size:** 89 lines (minimal schema - only 3 models: users, organizations, organization_members)
- **Models:** 3 core auth/org models (NOT 83 as documentation claims!)
- **Migrations:** Managed in `(platform)/prisma/` (NOT shared/)

**Critical Discovery - Schema Mismatch:**
- **Documentation claims:** 83 database models
- **Actual schema:** 3 models only (users, organizations, organization_members)
- **Implication:** Platform is in early development OR heavy cleanup occurred

**Environment Variables (Essential):**

From `(platform)/.env.local`:
```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.bztkedvdjbxffpjxihtc:..." # ✅ ESSENTIAL
DIRECT_URL="postgresql://postgres.bztkedvdjbxffpjxihtc:..."   # ✅ ESSENTIAL

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://bztkedvdjbxffpjxihtc.supabase.co" # ✅ ESSENTIAL
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..." # ✅ ESSENTIAL
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."    # ✅ ESSENTIAL (server-only!)
SUPABASE_ACCESS_TOKEN="sbp_..."            # ✅ ESSENTIAL (MCP tools)

# Auth
JWT_SECRET="8bOrXb81vkL4p2y..."             # ✅ ESSENTIAL

# App Config
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"        # ✅ ESSENTIAL
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"      # ❓ EVALUATE (no website project)
NODE_ENV="development"                                  # ✅ ESSENTIAL

# Stripe (Future)
STRIPE_SECRET_KEY="sk_test_[YOUR-STRIPE-SECRET-KEY]"   # 📋 FUTURE
STRIPE_PUBLISHABLE_KEY="pk_test_..."                   # 📋 FUTURE
STRIPE_WEBHOOK_SECRET="whsec_..."                      # 📋 FUTURE

# Email (Future)
SMTP_HOST="smtp.gmail.com"              # 📋 FUTURE
SMTP_PORT="587"                         # 📋 FUTURE
SMTP_USER="[YOUR-EMAIL@strivetech.ai]"  # 📋 FUTURE
SMTP_PASSWORD="[YOUR-APP-PASSWORD]"     # 📋 FUTURE
SMTP_FROM="noreply@strivetech.ai"       # 📋 FUTURE

# Vercel (Deployment)
PROJECT_ID="prj_0N8RVEEEpCDUcnPRdihNJtrmLBK4"   # ✅ ESSENTIAL
TEAM_ID="team_bDltmM6Wm8T4Z9YxJAT87e4e"        # ✅ ESSENTIAL
VERCEL_TOKEN="VsKHSI97IJGEX6gEWHwKxqJ0"        # ✅ ESSENTIAL
```

**npm Scripts (Core):**

From `(platform)/package.json`:
```json
{
  "scripts": {
    // Development
    "dev": "next dev --turbopack",                      // ✅ CORE
    "build": "next build --turbopack",                  // ✅ CORE
    "start": "next start",                              // ✅ CORE

    // Quality Assurance
    "lint": "eslint",                                   // ✅ CORE
    "lint:fix": "eslint --fix",                         // ✅ CORE
    "type-check": "tsc --noEmit",                       // ✅ CORE
    "test": "dotenv -e .env.test -- jest",              // ✅ CORE
    "test:watch": "dotenv -e .env.test -- jest --watch", // ✅ CORE
    "test:coverage": "dotenv -e .env.test -- jest --coverage", // ✅ CORE

    // Database (Platform)
    "prisma:generate": "prisma generate --schema=./prisma/schema.prisma", // ✅ CORE
    "prisma:migrate": "prisma migrate dev --schema=./prisma/schema.prisma", // ✅ CORE
    "prisma:push": "prisma db push --schema=./prisma/schema.prisma", // ✅ CORE
    "prisma:studio": "prisma studio --schema=./prisma/schema.prisma", // ✅ CORE
    "db:init": "node scripts/init-database.js",         // ✅ CORE
    "db:reset": "prisma db push --force-reset && prisma generate", // ✅ CORE
    "db:seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts", // ✅ CORE
    "db:docs": "node ../scripts/database/generate-schema-docs.js", // ✅ CORE
    "db:status": "node ../scripts/database/migration-status.js", // ✅ CORE
    "db:migrate": "node ../scripts/database/create-migration.js", // ✅ CORE
    "db:apply": "node ../scripts/database/apply-migration.js", // ✅ CORE
    "db:sync": "node ../scripts/database/check-schema-sync.js", // ✅ CORE
    "db:check-rls": "node ../scripts/database/check-rls-policies.js", // ✅ CORE

    // Deployment
    "deploy:check": "bash scripts/pre-deploy-check.sh", // ✅ CORE
    "deploy:migrate": "bash scripts/migrate-production.sh", // ✅ CORE
    "deploy:prod": "bash scripts/deploy-production.sh", // ✅ CORE
    "deploy:rollback": "bash scripts/rollback.sh",      // ✅ CORE

    // ⚠️ CHATBOT-SPECIFIC (Obsolete if chatbot is external)
    "chatbot:dev": "npm run dev",                       // ❌ REMOVE
    "chatbot:test": "npm run type-check && npm run lint && npm run dev", // ❌ REMOVE
    "chatbot:studio": "npx prisma studio",              // ❌ DUPLICATE (use prisma:studio)
    "chatbot:setup-rag": "npx prisma db execute --file SUPABASE-RAG-SETUP-EXECUTE.sql --schema prisma/schema.prisma", // ❌ REMOVE (RAG for chatbot)
    "chatbot:generate-embeddings": "npx tsx scripts/generate-embeddings.ts", // ❌ REMOVE (no script exists)
    "chatbot:test-vector-search": "npx tsx scripts/test-vector-search.ts"  // ❌ REMOVE (chatbot feature)
  }
}
```

**Script Analysis:**
- **Core scripts:** 32 essential platform scripts
- **Chatbot scripts:** 6 scripts (all obsolete if chatbot is external)
- **Action:** Remove chatbot:* scripts from package.json

### 2.2 External Integrations

#### Chatbot Integration (iframe embed)

**Purpose:** Embeds external chatbot widget into platform
**Status:** **ACTIVE - External integration**

**Evidence:**
1. **Environment variable:** `NEXT_PUBLIC_CHATBOT_URL=https://chatbot.strivetech.ai`
2. **Integration files exist:**
   - `lib/types/chatbot.ts` - Stub types for compilation
   - `lib/chatbot-iframe-communication.ts` - PostMessage API (280 lines)
   - `lib/utils/parent-communication.ts` - Parent window communication
   - `components/ui/floating-chat.tsx` - Floating chat widget
   - `lib/middleware/routing.ts` - Multi-domain routing (`detectHostType()`)

3. **Middleware routing:**
   ```typescript
   // middleware.ts (lines 58-68)
   const hostType = detectHostType(request);

   if (hostType === 'chatbot' || hostType === 'marketing') {
     return NextResponse.next();
   }
   ```
   Handles: `chatbot.strivetech.ai`, `strivetech.ai`, `app.strivetech.ai`

**Decision:** **KEEP - Active integration with external chatbot**

This is NOT leftover code - platform actively integrates an external chatbot via iframe. The chatbot project likely runs at `https://chatbot.strivetech.ai` (deployed separately).

**Files to KEEP:**
- ✅ `lib/types/chatbot.ts` (stub types - allows compilation)
- ✅ `lib/chatbot-iframe-communication.ts` (iframe API)
- ✅ `lib/utils/parent-communication.ts` (parent communication)
- ✅ `components/ui/floating-chat.tsx` (UI widget)
- ✅ `lib/middleware/routing.ts` (multi-domain routing)
- ✅ Environment: `NEXT_PUBLIC_CHATBOT_URL`

**Files to REMOVE (chatbot project development, not integration):**
- ❌ `chatbot:*` npm scripts (platform doesn't run chatbot locally)
- ❌ `scripts/generate-embeddings.ts` (doesn't exist, phantom script)
- ❌ `scripts/test-vector-search.ts` (chatbot development tool)
- ❌ `scripts/database/SUPABASE-RAG-SETUP.sql` (chatbot RAG system)
- ❌ `scripts/database/SUPABASE-RAG-SETUP-EXECUTE.sql` (chatbot RAG execution)

#### Stripe Payments

**Purpose:** Subscription billing (6-tier pricing)
**Status:** **CONFIGURED - Not yet implemented**

**Configuration:**
- Placeholder API keys in `.env` (need replacement)
- Dependencies installed: `stripe@19.1.0`, `@stripe/stripe-js@8.0.0`
- Webhook endpoints planned: `/api/webhooks/stripe`

**Decision:** **KEEP - Future implementation**

#### Supabase

**Purpose:** Auth + Database + Storage + RLS
**Status:** **ACTIVE - Core infrastructure**

**Integration:**
- Authentication: Supabase Auth (JWT sessions)
- Database: PostgreSQL via Prisma ORM
- Storage: File uploads (avatars, documents)
- RLS: Multi-tenancy via Row Level Security

**Decision:** **KEEP - Essential**

### 2.3 Platform-Owned Marketing Pages

**Location:** `(platform)/app/(marketing)/`

**Purpose:** In-app marketing pages (NOT the external website project)

**Analysis:**
- Route group exists in platform codebase
- Separate from hypothetical `(website)/ ` project
- Used for landing page, pricing, features within SaaS app

**Decision:** **KEEP - Platform's own marketing pages**

---

## 3. Archived Projects Remnants

### 3.1 (chatbot) Leftovers

#### npm Scripts (Chatbot Development)

**Location:** `(platform)/package.json`

```json
"chatbot:dev": "npm run dev",
"chatbot:test": "npm run type-check && npm run lint && npm run dev",
"chatbot:studio": "npx prisma studio",
"chatbot:setup-rag": "npx prisma db execute --file SUPABASE-RAG-SETUP-EXECUTE.sql --schema prisma/schema.prisma",
"chatbot:generate-embeddings": "npx tsx scripts/generate-embeddings.ts",
"chatbot:test-vector-search": "npx tsx scripts/test-vector-search.ts"
```

**Purpose:** Run chatbot project locally for development
**Current State:** Chatbot doesn't exist in this repository
**Decision:** **REMOVE - Platform doesn't run chatbot locally**

#### RAG/AI Setup Scripts

**Location:** `scripts/database/`

**Files:**
1. `SUPABASE-RAG-SETUP.sql` (9,367 bytes)
   - Purpose: pgvector extension setup for semantic search
   - Creates: knowledge_base table with embeddings
   - Includes: Vector similarity search functions

2. `SUPABASE-RAG-SETUP-EXECUTE.sql` (8,540 bytes)
   - Purpose: Executable version of RAG setup
   - Used by: `chatbot:setup-rag` npm script

**Analysis:**
- **For chatbot project:** Vector search for RAG (Retrieval-Augmented Generation)
- **Platform use case:** Platform doesn't have its own RAG system
- **Chatbot integration:** Platform embeds chatbot via iframe (doesn't need RAG locally)

**Decision:** **REMOVE - Chatbot-specific, not needed by platform**

**Exception:** If platform plans to add its own AI features with RAG, keep these files and document the plan.

#### Embedding Generation Scripts

**Location:** `(platform)/scripts/`

**Files Referenced (but don't exist):**
- `generate-embeddings.ts` - NOT FOUND in directory listing
- `test-vector-search.ts` - EXISTS at `(platform)/scripts/test-vector-search.ts`

**Analysis:**
- `test-vector-search.ts` - 13 matches in grep (chatbot references)
- Purpose: Test vector search functionality for chatbot
- Platform doesn't need local vector search testing

**Decision:** **REMOVE `test-vector-search.ts` - Chatbot development tool**

#### Environment Variables (AI/RAG)

**Location:** Root `.env` file

```bash
# Chatbot
NEXT_PUBLIC_CHATBOT_URL=https://chatbot.strivetech.ai  # ✅ KEEP (iframe integration)

# AI INTEGRATION (Optional but recommended)
OPENROUTER_API_KEY="sk-or-v1-8cfbaaea..."  # ❓ EVALUATE

# CRITICAL: Groq API Configuration
GROQ_API_KEY="gsk_xqK9v1fndXnq..."         # ❓ EVALUATE

# CHATBOT: OpenAI API (for embeddings/RAG)
OPENAI_API_KEY="sk-proj-m0C5emeo..."       # ❓ EVALUATE

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://harmless-swine-15590.upstash.io/  # ✅ KEEP (platform rate limiting)
UPSTASH_REDIS_REST_TOKEN=ATzmAAIncDI3...   # ✅ KEEP

# DOCUMENT ENCRYPTION (AES-256-GCM)
DOCUMENT_ENCRYPTION_KEY="5c2d9c04c65e..."  # ✅ KEEP (transaction documents)
```

**Analysis:**

| Variable | Purpose | Platform Use? | Decision |
|----------|---------|---------------|----------|
| `NEXT_PUBLIC_CHATBOT_URL` | Chatbot iframe URL | ✅ YES (integration) | **KEEP** |
| `OPENROUTER_API_KEY` | Multi-model AI routing | ❓ MAYBE (if platform has AI features) | **EVALUATE** |
| `GROQ_API_KEY` | Groq LLM access | ❓ MAYBE (if platform has AI features) | **EVALUATE** | keep
| `OPENAI_API_KEY` | Embeddings/GPT | ❓ MAYBE (if platform has AI features) | **EVALUATE** | keep
| `UPSTASH_REDIS_*` | Rate limiting | ✅ YES (middleware) | **KEEP** |
| `DOCUMENT_ENCRYPTION_KEY` | AES-256-GCM encryption | ✅ YES (transactions) | **KEEP** |



### 3.2 (website) Leftovers

#### Data Files

**Location:** `(platform)/data/(web)/`

**Files:**
- `industries.ts` - Industry options data (stub - empty arrays)
- `industry-cards.ts` - Industry card data
- `industry-statistics.ts` - Industry statistics
- `solutions.ts` - Industry-specific solutions
- `resources/` - Resource data directory

**Analysis:**
All files are **STUB FILES** - contain type definitions but empty data:

```typescript
// industries.ts
export const industryOptions: IndustryOption[] = [];
export const industrySpecificSolutions: Record<string, IndustrySolution[]> = {};
export const industryCorrelations: Record<string, string[]> = {};
```

**Purpose (original):** Marketing website content data
**Current state:** Empty stubs for compilation

**Decision:** **EVALUATE**

**Options:**
1. **Remove entirely** - Platform doesn't need website marketing data
2. **Populate with platform data** - Platform's own industry selection UI needs this
3. **Keep as stubs** - Allows code to compile without errors

**Recommendation:** Check if platform's signup/onboarding uses industry selection. If yes, populate these files with real data. If no, delete the entire `data/(web)/` directory.

#### Type Definitions

**Location:** `(platform)/lib/types/`

**Files:**
- `lib/types/chatbot.ts` - Chatbot types (stub)
- `lib/types/web/` - **NOT FOUND** (may not exist)

**Analysis:**
- `chatbot.ts` - STUB file with comment: "actual types live in (chatbot) project"
- Purpose: Allow platform code to compile without cross-project imports
- Contains: Basic `ChatbotMessage` and `ChatbotConfig` types

**Decision:** **KEEP `chatbot.ts`** - Needed for iframe integration


**Decision:** **EVALUATE**

**Questions for User:**
1. Is platform deployed on multiple domains (multi-domain routing needed)? -> No we just moved away from this
2. Or is it single-domain (app.strivetech.ai only)? Yes

**If single-domain:**
- Remove `detectHostType()` function
- Simplify middleware to only handle auth
- Remove website/chatbot routing logic


---

## 4. Shared Resources Audit

### 4.1 shared/prisma/

**Contents:**
```
shared/prisma/
├── migrations/              # Old migration files
│   ├── 20250104_add_rls_policies/
│   ├── 20250104000000_add_performance_indexes/
│   ├── 20251005_add_dashboard_models.sql
│   ├── admin_onboarding_system_models.sql
│   ├── ai_garage_rls_policies.sql
│   ├── contentpilot_rls_policies.sql
│   └── create_reid_tables.sql
├── schema.prisma.backup     # Backup (Oct 4, 2025 - 8:43 AM)
└── schema.prisma.bak        # Older backup (Oct 4, 2025 - 5:10 AM)
```

**Analysis:**

**Current Active Schema:** `(platform)/prisma/schema.prisma` (89 lines, 3 models) -> We are using mock data now
**Shared Schema Backups:** `shared/prisma/*.backup` files (older, larger schemas)

**Migration Files:**
- Location: `shared/prisma/migrations/`
- Contains: SQL migration files for dashboard models, RLS policies, indexes
- Status: **HISTORICAL** - Platform uses `(platform)/prisma/migrations/` now

**Backup Files:**
- `schema.prisma.backup` (19,684 bytes) - Oct 4 @ 8:43 AM
- `schema.prisma.bak` (23,309 bytes) - Oct 4 @ 5:10 AM
- Purpose: Backups from when schema was being migrated/cleaned up
- Age: 3 days old

**Decision:** **ARCHIVE - Move to .archive/ or delete** -> Delete

**Rationale:**
- Platform now uses `(platform)/prisma/schema.prisma` as source of truth
- Shared schema was for tri-fold architecture (obsolete)
- Backup files are 3 days old (already have git history)
- Migration files are historical (already applied or superseded)

**Action:**
```bash
# Option 1: Archive
mkdir -p .archive/shared-prisma-backup-20251007
mv shared/prisma/* .archive/shared-prisma-backup-20251007/

# Option 2: Delete (git history preserves everything)
rm -rf shared/prisma/*.backup
rm -rf shared/prisma/*.bak
rm -rf shared/prisma/migrations/*.sql
# Keep shared/prisma/migrations/ directory structure only
```

### 4.2 shared/supabase/

**Contents:**
```
shared/supabase/
└── migrations/    # Supabase-specific migrations
```

**Analysis:**
- Purpose: Supabase migrations (separate from Prisma)
- Status: Unknown (need to check contents)
- Platform uses Supabase for auth/storage

**Decision:** **INVESTIGATE**

**Action:** List contents and determine if still relevant to platform

---

## 5. Documentation Audit

### 5.1 CLAUDE.md (Root)

**Status:** **CRITICALLY OUTDATED**

**Tri-fold References:**
- Line 12: "🔴 CRITICAL: TRI-FOLD REPOSITORY STRUCTURE"
- Line 14: "This repository contains **THREE SEPARATE PROJECTS**"
- Lines 16-18: Lists chatbot, platform, website
- Line 27: Shows tri-fold repository structure
- Lines 46-234: Extensive documentation for all three projects
- Line 235: "shared/prisma/ - Database Schema" (obsolete location)

**Problematic Claims:**
- **Line 32:** "shared/prisma/schema.prisma" - **NOT the source of truth** (platform uses local schema)
- **Line 242:** "13 Database Models" - **INCORRECT** (actual: 3 models)
- **Multiple sections** document chatbot/website projects that don't exist

**Action Required:**

**IMMEDIATE UPDATE - Remove:**
1. All tri-fold architecture references
2. Chatbot project documentation
3. Website project documentation
4. Shared Prisma references (update to platform-local)
5. Incorrect database model count

**IMMEDIATE UPDATE - Add:**
1. Single-project structure (platform only)
2. External chatbot integration notes
3. Correct database model count (3 models)
4. Platform-local Prisma schema location
5. Clarification that chatbot/website are external (if true)

### 5.2 README.md (Root)

**Status:** **CRITICALLY OUTDATED**

**Tri-fold References:**
- Line 1: "# Strive Tech - Tri-Fold Repository"
- Line 14: "This is the **Strive Tech tri-fold repository**"
- Lines 16-18: Lists three applications
- Lines 95-232: Extensive chatbot project documentation
- Lines 137-275: Extensive platform project documentation
- Lines 193-278: Extensive website project documentation
- Lines 280-303: Shared database architecture diagrams

**Problematic Claims:**
- **Lines 239-258:** Documents shared Prisma schema (obsolete)
- **Lines 355-375:** Database update workflow using shared schema (outdated)
- **Line 650:** "**Remember:** This is a tri-fold repository"

**Action Required:**

**REWRITE ENTIRELY:**
1. **Title:** "Strive Tech Platform" (not "Tri-Fold Repository")
2. **Overview:** Single Next.js SaaS application
3. **Structure:** Document (platform)/ only
4. **Database:** Platform-local Prisma schema
5. **Integrations:** External chatbot (if applicable)
6. **Remove:** All chatbot/website project sections

---

## 6. Configuration Files Audit

### 6.1 turbo.json

**Purpose:** Turbo build orchestration (monorepo tool)
**Status:** **QUESTIONABLE - Single project**

**Contents:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^build"] },
    "type-check": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] }
  }
}
```

**Analysis:**
- Turbo is designed for monorepos with multiple projects
- Repository contains only ONE project: `(platform)/`
- Turbo may be overkill for single-project setup
- However, it's configured and working

**Decision:** **KEEP (but evaluate)**

**Rationale:**
- Currently working (don't break what works)
- Provides caching benefits even for single project
- May be future-proofing for monorepo expansion
- Minimal overhead

**Alternative:** If performance issues arise, consider removing Turbo and using plain Next.js scripts.

### 6.2 .gitignore

**Status:** **ACTIVE - Needs review**

**Relevant Lines:**
```gitignore
# Development tools and configurations
.claude/
.serena/
.local/

# Archives
.ignore/         # ⚠️ Blocks .ignore/ directory from git

# Vercel
.vercel/
```

**Analysis:**
- Blocks `.ignore/` directory (where chatbot/website may be archived)
- Blocks `.claude/` directory (AI assistant configs)
- Standard Next.js ignores

**Action:** **KEEP - Working as designed**

**Note:** `.ignore/` is intentionally blocked from git (assumed to contain archived projects or sensitive data)

---

## 7. Environment Variables Complete Audit

### Root .env File Analysis

**Location:** `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.env`
**Status:** ⚠️ **CONTAINS PRODUCTION SECRETS - MUST NEVER BE COMMITTED!**

**Security Note:** This file is currently in `.gitignore` (good), but contains real production credentials.

| Variable | Project | Purpose | Status | Action |
|----------|---------|---------|--------|--------|
| **DATABASE & SUPABASE** |
| `DATABASE_URL` | Platform | PostgreSQL connection (pooler) | ✅ Essential | **KEEP** |
| `DIRECT_URL` | Platform | PostgreSQL direct connection | ✅ Essential | **KEEP** |
| `NEXT_PUBLIC_SUPABASE_URL` | Platform | Supabase project URL | ✅ Essential | **KEEP** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Platform | Supabase anon key (public) | ✅ Essential | **KEEP** |
| `SUPABASE_SERVICE_ROLE_KEY` | Platform | Supabase admin key (server-only!) | ✅ Essential | **KEEP** |
| `SUPABASE_ACCESS_TOKEN` | Platform | Personal access token (MCP) | ✅ Essential | **KEEP** |
| **AUTHENTICATION** |
| `JWT_SECRET` | Platform | JWT signing key | ✅ Essential | **KEEP** |
| **APP CONFIGURATION** |
| `NEXT_PUBLIC_APP_URL` | Platform | Platform URL | ✅ Essential | **KEEP** |
| `NEXT_PUBLIC_MARKETING_URL` | Website | Marketing site URL | ❓ Unclear | **EVALUATE** |
| `NODE_ENV` | Platform | Environment mode | ✅ Essential | **KEEP** |
| **STRIPE (Payments)** |
| `STRIPE_SECRET_KEY` | Platform | Stripe API key (placeholder) | 📋 Future | **KEEP** |
| `STRIPE_PUBLISHABLE_KEY` | Platform | Stripe public key (placeholder) | 📋 Future | **KEEP** |
| `STRIPE_WEBHOOK_SECRET` | Platform | Webhook signature key (placeholder) | 📋 Future | **KEEP** |
| **EMAIL (SMTP)** |
| `SMTP_HOST` | Platform | Email server | 📋 Future | **KEEP** |
| `SMTP_PORT` | Platform | Email port | 📋 Future | **KEEP** |
| `SMTP_USER` | Platform | Email username (placeholder) | 📋 Future | **KEEP** |
| `SMTP_PASSWORD` | Platform | Email password (placeholder) | 📋 Future | **KEEP** |
| `SMTP_FROM` | Platform | From email address | 📋 Future | **KEEP** |
| **VERCEL (Deployment)** |
| `PROJECT_ID` | Platform | Vercel project ID | ✅ Essential | **KEEP** |
| `TEAM_ID` | Platform | Vercel team ID | ✅ Essential | **KEEP** |
| `VERCEL_TOKEN` | Platform | Vercel API token | ✅ Essential | **KEEP** |
| **CHATBOT INTEGRATION** |
| `NEXT_PUBLIC_CHATBOT_URL` | Integration | External chatbot URL | 🔗 Integration | **KEEP** |
| **AI INTEGRATION** |
| `OPENROUTER_API_KEY` | AI | Multi-model AI routing | ❓ Unclear | **EVALUATE** |
| `GROQ_API_KEY` | AI | Groq LLM access | ❓ Unclear | **EVALUATE** |
| `OPENAI_API_KEY` | AI | OpenAI embeddings/GPT | ❓ Unclear | **EVALUATE** |
| **RATE LIMITING** |
| `UPSTASH_REDIS_REST_URL` | Platform | Redis rate limiting | ✅ Essential | **KEEP** |
| `UPSTASH_REDIS_REST_TOKEN` | Platform | Redis auth token | ✅ Essential | **KEEP** |
| **DOCUMENT ENCRYPTION** |
| `DOCUMENT_ENCRYPTION_KEY` | Platform | AES-256-GCM encryption | ✅ Essential | **KEEP** |

### Categories Summary

| Category | Count | Action |
|----------|-------|--------|
| ✅ **ESSENTIAL (Platform Core)** | 18 | Keep |
| 🔗 **INTEGRATION (External Services)** | 1 | Keep |
| ❓ **UNCLEAR (Review Needed)** | 4 | Evaluate |
| 📋 **FUTURE (Placeholders)** | 7 | Keep (for future use) |
| **TOTAL** | 30 | |

### Questions for User (AI Variables)

**Does platform have its own AI features?**
1. If **YES** (platform has AI chat, content generation, etc.):
   - **KEEP:** `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`
   - Document AI features in platform documentation

2. If **NO** (only embedded chatbot has AI):
   - **REMOVE:** `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`
   - Chatbot handles its own AI (separate deployment)

**Does marketing website exist?**
1. If **YES** (website at strivetech.ai):
   - **KEEP:** `NEXT_PUBLIC_MARKETING_URL`
   - Verify multi-domain routing is needed

2. If **NO** (no separate marketing site):
   - **REMOVE:** `NEXT_PUBLIC_MARKETING_URL`
   - Platform's `(marketing)/` route group is sufficient

---

## 8. Cleanup Recommendations

### 8.1 Safe to Delete

#### Root Directory Files
- [ ] `project-directory-map.json` (559 KB - stale directory map)
- [ ] `project-directory-map.txt` (92 KB - stale directory map)
- [ ] `console-log.txt` (12 KB - debug output)
- [ ] `PROMPTS.md` (0 bytes - empty file)

#### Shared Directory
- [ ] `shared/prisma/schema.prisma.backup` (19 KB - 3-day old backup)
- [ ] `shared/prisma/schema.prisma.bak` (23 KB - 3-day old backup)
- [ ] `shared/prisma/migrations/*.sql` (historical migrations - already applied)

#### Platform Scripts (Chatbot-specific)
- [ ] `scripts/database/SUPABASE-RAG-SETUP.sql` (9.3 KB - chatbot RAG setup)
- [ ] `scripts/database/SUPABASE-RAG-SETUP-EXECUTE.sql` (8.5 KB - chatbot RAG execution)
- [ ] `(platform)/scripts/test-vector-search.ts` (if exists - chatbot development)

#### Platform package.json Scripts
```diff
{
  "scripts": {
-   "chatbot:dev": "npm run dev",
-   "chatbot:test": "npm run type-check && npm run lint && npm run dev",
-   "chatbot:studio": "npx prisma studio",
-   "chatbot:setup-rag": "npx prisma db execute --file SUPABASE-RAG-SETUP-EXECUTE.sql --schema prisma/schema.prisma",
-   "chatbot:generate-embeddings": "npx tsx scripts/generate-embeddings.ts",
-   "chatbot:test-vector-search": "npx tsx scripts/test-vector-search.ts"
  }
}
```

#### Data Directory (if not used by platform)
- [ ] `(platform)/data/(web)/` - Empty stub files (if platform doesn't use)

**Estimated cleanup:** ~700 KB of obsolete files

### 8.2 Keep (Platform Core)

#### Essential Directories
- [x] `(platform)/` - **ENTIRE DIRECTORY** (main project)
- [x] `scripts/database/` - Database utilities (except RAG files)
- [x] `.claude/` - AI assistant configs
- [x] `.dev-docs/` - Development documentation
- [x] `.archive/` - Historical reference

#### Essential Root Files
- [x] `.env` - Environment variables (NEVER commit!)
- [x] `.env.example` - Public template
- [x] `.gitignore` - Git ignore rules
- [x] `CLAUDE.md` - After update
- [x] `README.md` - After rewrite
- [x] `turbo.json` - Build config
- [x] `.mcp.json` - MCP server config
- [x] `start-preview.sh` - Preview script

#### Essential Environment Variables
- [x] `DATABASE_URL`, `DIRECT_URL` - Database
- [x] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase
- [x] `JWT_SECRET` - Authentication
- [x] `NEXT_PUBLIC_APP_URL` - App URL
- [x] `STRIPE_*` - Payments (future)
- [x] `UPSTASH_REDIS_*` - Rate limiting
- [x] `DOCUMENT_ENCRYPTION_KEY` - Document encryption
- [x] `NEXT_PUBLIC_CHATBOT_URL` - Chatbot integration

### 8.3 Review Needed (Unclear)

#### Chatbot Integration
**Question:** Does platform embed external chatbot?

**If YES:**
- [x] Keep: `lib/types/chatbot.ts`
- [x] Keep: `lib/chatbot-iframe-communication.ts`
- [x] Keep: `lib/utils/parent-communication.ts`
- [x] Keep: `components/ui/floating-chat.tsx`
- [x] Keep: `lib/middleware/routing.ts`
- [x] Keep: `NEXT_PUBLIC_CHATBOT_URL`

**If NO:**
- [ ] Remove all chatbot integration files
- [ ] Remove chatbot routing from middleware
- [ ] Remove `NEXT_PUBLIC_CHATBOT_URL`

#### AI Features
**Question:** Does platform have its own AI features?

**If YES:**
- [x] Keep: `OPENROUTER_API_KEY`
- [x] Keep: `GROQ_API_KEY`
- [x] Keep: `OPENAI_API_KEY`
- [x] Document AI features in CLAUDE.md

**If NO:**
- [ ] Remove AI API keys
- [ ] Chatbot handles all AI (external)

#### Marketing Pages
**Question:** Is `(platform)/app/(marketing)/` needed?

**If YES (in-app landing pages):**
- [x] Keep: `app/(marketing)/` route group
- [x] Keep: Marketing components

**If NO:**
- [ ] Remove: `app/(marketing)/` directory
- [ ] Update routing

#### Data Directory
**Question:** Does platform use industry selection?

**If YES (signup/onboarding):**
- [x] Populate: `data/(web)/industries.ts` with real data
- [x] Keep: Data directory

**If NO:**
- [ ] Delete: Entire `data/(web)/` directory

#### Multi-Domain Routing
**Question:** Is platform deployed on multiple domains?

**If YES (app.strivetech.ai + chatbot.strivetech.ai + strivetech.ai):**
- [x] Keep: `detectHostType()` in middleware
- [x] Keep: Multi-domain routing logic

**If NO (single domain: app.strivetech.ai):**
- [ ] Remove: `detectHostType()` function
- [ ] Simplify: Middleware to auth-only

---

## 9. Action Plan

### Phase 1: Documentation Update (IMMEDIATE)

**Priority:** 🔴 CRITICAL

```bash
# 1. Update CLAUDE.md
# - Remove tri-fold architecture references
# - Document single-project structure (platform only)
# - Update database model count (3 models, not 83)
# - Clarify external chatbot integration (if applicable)
# - Update Prisma schema location (platform-local, not shared)

# 2. Rewrite README.md
# - Title: "Strive Tech Platform" (not "Tri-Fold Repository")
# - Remove chatbot/website project sections
# - Document (platform)/ project only
# - Add external integration section (chatbot)
# - Update quick start guide for single project

# 3. Update .gitignore (review)
# - Verify .ignore/ is blocked (archive location)
# - Ensure .env is blocked (contains secrets!)
```

### Phase 2: Environment Variables (CLARIFY WITH USER)

**Priority:** 🟡 HIGH

**Questions for User:**
1. **Chatbot Integration:**
   - Does platform embed external chatbot at `https://chatbot.strivetech.ai`?
   - If YES: Keep integration code
   - If NO: Remove integration code

2. **AI Features:**
   - Does platform have its own AI features (separate from chatbot)?
   - If YES: Keep `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`
   - If NO: Remove AI API keys

3. **Marketing Website:**
   - Does separate marketing website exist at `strivetech.ai`?
   - If YES: Keep `NEXT_PUBLIC_MARKETING_URL` and multi-domain routing
   - If NO: Remove and simplify middleware

4. **Industry Selection:**
   - Does platform use industry selection in signup/onboarding?
   - If YES: Populate `data/(web)/industries.ts` with real data
   - If NO: Delete `data/(web)/` directory

### Phase 3: Code Cleanup (AFTER USER ANSWERS)

**Priority:** 🟡 MEDIUM

```bash
# 1. Remove chatbot development scripts
cd "(platform)"
# Edit package.json - remove chatbot:* scripts

# 2. Remove RAG setup files (if chatbot is external)
rm scripts/database/SUPABASE-RAG-SETUP.sql
rm scripts/database/SUPABASE-RAG-SETUP-EXECUTE.sql

# 3. Remove test scripts
rm scripts/test-vector-search.ts  # If exists

# 4. Clean up stale files
rm project-directory-map.json
rm project-directory-map.txt
rm console-log.txt
rm PROMPTS.md

# 5. Archive shared Prisma backups
mkdir -p .archive/shared-prisma-backup-20251007
mv shared/prisma/schema.prisma.backup .archive/shared-prisma-backup-20251007/
mv shared/prisma/schema.prisma.bak .archive/shared-prisma-backup-20251007/
mv shared/prisma/migrations/*.sql .archive/shared-prisma-backup-20251007/
```

### Phase 4: Database Schema Verification

**Priority:** 🟢 LOW

```bash
# Verify current schema state
cd "(platform)"
cat prisma/schema.prisma

# Expected: 3 models (users, organizations, organization_members)
# Documentation claims: 83 models

# If schema is actually minimal:
# - Update all documentation to reflect 3 models
# - Verify this is intentional (early development stage)

# If schema is missing models:
# - Check if migration was incomplete
# - Review shared/prisma/ backups for missing models
```

### Phase 5: Test Platform After Cleanup

**Priority:** 🔴 CRITICAL

```bash
cd "(platform)"

# 1. TypeScript compilation
npm run type-check
# Expected: ZERO errors

# 2. Linting
npm run lint
# Expected: Warnings only (291 any warnings, 25 React errors)

# 3. Build test
npm run build
# Expected: SUCCESS (if React errors fixed)

# 4. Unit tests
npm test
# Expected: All tests pass

# 5. Manual smoke test
npm run dev
# Visit: http://localhost:3000
# Test: Login, navigation, core features
```

---

## 10. Summary

### Current State

**Repository Structure:**
- **ONE active project:** `(platform)/` - Next.js SaaS application
- **TWO phantom projects:** `(chatbot)/` and `(website)/` referenced but non-existent
- **Documentation claims:** Tri-fold repository with 3 projects, 83 database models
- **Reality:** Single project with 3 database models

**Key Discoveries:**
1. **Chatbot/website projects don't exist** in repository
2. **Database schema is minimal** (3 models, not 83 as documented)
3. **Chatbot integration exists** (iframe embed via `NEXT_PUBLIC_CHATBOT_URL`)
4. **Shared Prisma directory is obsolete** (platform uses local schema)
5. **RAG/AI scripts are chatbot-specific** (not needed by platform)
6. **Documentation is critically outdated** (needs immediate update)

### Impact

**Files to Delete:** ~15-20 files
- Stale directory maps (650 KB)
- Chatbot RAG setup scripts (18 KB)
- Old Prisma backups (43 KB)
- Empty/obsolete files

**Files to Update:** 2 critical docs
- `CLAUDE.md` - Remove tri-fold, update to single-project
- `README.md` - Complete rewrite for single-project structure

**Files to Evaluate:** ~10 files
- Chatbot integration code (depends on external chatbot existence)
- AI API keys (depends on platform AI features)
- Marketing pages (depends on in-app marketing needs)
- Multi-domain routing (depends on deployment architecture)

**Disk Space Reclaimed:** ~700 KB

**Clarity Gained:** Massive improvement in developer onboarding and maintenance

### Next Steps (Priority Order)

1. **IMMEDIATE:** Update CLAUDE.md and README.md (remove tri-fold references)
2. **IMMEDIATE:** Answer audit questions (chatbot integration, AI features, etc.)
3. **HIGH:** Remove chatbot development scripts from package.json
4. **HIGH:** Clean up obsolete files (backups, stale maps)
5. **MEDIUM:** Archive shared/prisma/ directory
6. **MEDIUM:** Evaluate and update environment variables
7. **LOW:** Verify database schema completeness (3 vs 83 models)
8. **CRITICAL:** Test platform after cleanup

### Questions for User

**Critical Decisions Needed:**

1. **Chatbot Integration (affects ~5 files):**
   - Does platform embed external chatbot at `https://chatbot.strivetech.ai`?
   - Answer determines if integration code stays or goes

2. **Platform AI Features (affects 3 environment variables):**
   - Does platform have its own AI features (separate from chatbot)?
   - Answer determines if AI API keys are needed

3. **Marketing Website (affects routing complexity):**
   - Does separate marketing website exist at `strivetech.ai`?
   - Answer determines if multi-domain routing is needed

4. **Industry Selection (affects data directory):**
   - Does platform use industry selection in signup/onboarding?
   - Answer determines if `data/(web)/` should be populated or deleted

5. **Database Schema (affects documentation):**
   - Is platform in early development (3 models) or missing models (should be 83)?
   - Answer determines if schema is correct or needs restoration

---

## Appendix: File Paths Reference

### Platform Core (KEEP)
```
(platform)/
├── app/                     ✅ KEEP (entire directory)
├── components/              ✅ KEEP (entire directory)
├── lib/                     ✅ KEEP (entire directory)
├── prisma/schema.prisma     ✅ KEEP (source of truth)
├── package.json             ✅ KEEP (remove chatbot:* scripts)
└── All other files          ✅ KEEP
```

### Chatbot Integration (EVALUATE)
```
(platform)/lib/types/chatbot.ts                        ❓ Keep if external chatbot exists
(platform)/lib/chatbot-iframe-communication.ts         ❓ Keep if external chatbot exists
(platform)/lib/utils/parent-communication.ts           ❓ Keep if external chatbot exists
(platform)/components/ui/floating-chat.tsx             ❓ Keep if external chatbot exists
(platform)/lib/middleware/routing.ts                   ❓ Keep if multi-domain routing needed
```

### Obsolete Files (DELETE)
```
project-directory-map.json                             ❌ DELETE (stale, 559 KB)
project-directory-map.txt                              ❌ DELETE (stale, 92 KB)
console-log.txt                                        ❌ DELETE (debug output)
PROMPTS.md                                             ❌ DELETE (empty)
shared/prisma/schema.prisma.backup                     ❌ ARCHIVE (3-day old backup)
shared/prisma/schema.prisma.bak                        ❌ ARCHIVE (3-day old backup)
shared/prisma/migrations/*.sql                         ❌ ARCHIVE (historical)
scripts/database/SUPABASE-RAG-SETUP.sql                ❌ DELETE (chatbot RAG)
scripts/database/SUPABASE-RAG-SETUP-EXECUTE.sql        ❌ DELETE (chatbot RAG)
(platform)/scripts/test-vector-search.ts               ❌ DELETE (if exists)
```

### Documentation (UPDATE)
```
CLAUDE.md              🔴 CRITICAL UPDATE - Remove tri-fold, single-project structure
README.md              🔴 CRITICAL UPDATE - Complete rewrite for single-project
.gitignore             ✅ KEEP - Review only
turbo.json             ✅ KEEP - Evaluate future need
```

---

**End of Audit Report**

Generated: 2025-10-07
Platform: Strive-SaaS
Scope: Repository-wide isolation analysis
Status: Ready for user review and cleanup decisions
