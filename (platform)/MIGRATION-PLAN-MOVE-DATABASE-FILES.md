# Move Database Files - Migration Plan

**Session Start Prompt for Claude:**

```
Read this migration plan slowly: /Users/grant/Documents/GitHub/Strive-SaaS/(platform)/MIGRATION-PLAN-MOVE-DATABASE-FILES.md

This document contains a complete step-by-step plan to move database files by:
1. Reverting incorrect import path changes
2. Moving shared/prisma/ files into (platform)/prisma/
3. Moving shared/supabase/ docs into (platform)/lib/database/docs/
4. Updating all references across the codebase

NOTE: This does NOT change the database itself - there's still one Supabase database
shared by all projects. This only reorganizes where schema and documentation files live.

Follow each step exactly. Use the checklist at the bottom to track progress.
```

---

## 🎯 Migration Goals

**Important:** This migration moves FILES only. The Supabase database itself is NOT changing.
All three projects (platform, chatbot, website) will continue to use the SAME database.

### Current State (Incorrect)
```
Strive-SaaS/
├── shared/
│   ├── prisma/                    # Shared schema (used by 3 projects)
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── SCHEMA-QUICK-REF.md
│   │   ├── SCHEMA-MODELS.md
│   │   └── SCHEMA-ENUMS.md
│   └── supabase/                  # Shared Supabase docs
│       ├── SUPABASE-SETUP.md
│       ├── RLS-POLICIES.md
│       └── STORAGE-BUCKETS.md
│
└── (platform)/
    ├── lib/
    │   ├── prisma.ts              # ❌ SIMPLE version (no security)
    │   ├── prisma-middleware.ts   # ✅ Copied from database/
    │   └── database/              # ✅ SECURE implementation
    │       ├── prisma.ts          # Has tenant isolation
    │       ├── prisma-middleware.ts
    │       ├── prisma-extension.ts
    │       ├── errors.ts
    │       ├── monitoring.ts
    │       └── utils.ts
    └── prisma/                    # ❌ Empty or minimal
```

**Problems with current state:**
- ❌ Import paths were changed from `@/lib/database/prisma` → `@/lib/prisma` (WRONG!)
- ❌ Simple `lib/prisma.ts` lacks security features
- ❌ Shared folder structure means platform-specific changes affect all projects
- ❌ Documentation spread across shared/ and (platform)/

### Desired State (Correct)
```
Strive-SaaS/
└── (platform)/
    ├── lib/
    │   └── database/              # ✅ All database code here
    │       ├── prisma.ts          # Secure singleton with tenant isolation
    │       ├── prisma-middleware.ts  # Tenant isolation extension
    │       ├── prisma-extension.ts   # RLS context setter
    │       ├── errors.ts          # Error handling utilities
    │       ├── monitoring.ts      # Health checks & monitoring
    │       ├── utils.ts           # Database utilities
    │       └── docs/              # Database documentation
    │           ├── SUPABASE-SETUP.md
    │           ├── RLS-POLICIES.md
    │           ├── STORAGE-BUCKETS.md
    │           ├── PRISMA-SUPABASE-DECISION-TREE.md
    │           ├── HYBRID-PATTERNS.md
    │           └── TESTING-RLS.md
    │
    └── prisma/                    # Prisma schema & migrations
        ├── schema.prisma          # Moved from shared/
        ├── migrations/            # Moved from shared/
        ├── SCHEMA-QUICK-REF.md   # Moved from shared/
        ├── SCHEMA-MODELS.md      # Moved from shared/
        └── SCHEMA-ENUMS.md       # Moved from shared/
```

**Benefits of desired state:**
- ✅ Platform has its own dedicated schema (not shared)
- ✅ All database code in one location: `lib/database/`
- ✅ All database docs in one location: `lib/database/docs/`
- ✅ Consistent import path: `@/lib/database/prisma`
- ✅ Security features preserved
- ✅ Clear organization

---

## 📋 Phase 1: Revert Incorrect Changes

### Step 1.1: Revert Import Paths

**What happened:** Imports were changed from `@/lib/database/prisma` → `@/lib/prisma`
**What we need:** Revert back to `@/lib/database/prisma`

**Commands:**
```bash
# Navigate to platform directory
cd "(platform)"

# Revert all imports in lib/
find lib -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' 's|@/lib/prisma|@/lib/database/prisma|g'

# Revert all imports in app/
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' 's|@/lib/prisma|@/lib/database/prisma|g'

# Verify changes
grep -r "from '@/lib/prisma'" lib app --include="*.ts" --include="*.tsx"
# Should return NO results (except prisma-middleware.ts which imports ./prisma)
```

**Expected:** All imports now use `@/lib/database/prisma` again

### Step 1.2: Delete Simple Prisma File

**Files to delete:**
```bash
# Delete the simple version (no security)
rm lib/prisma.ts

# Delete duplicate middleware (already in database/)
rm lib/prisma-middleware.ts

# Verify deletion
ls -la lib/prisma*
# Should show: "No such file or directory"
```

### Step 1.3: Verify lib/database/ Integrity

**Check that all files are present:**
```bash
ls -1 lib/database/
```

**Expected output:**
```
errors.ts
monitoring.ts
prisma-extension.ts
prisma-middleware.ts
prisma.ts
utils.ts
```

**Verify no broken imports in database/ files:**
```bash
cd lib/database
grep -r "from '\.\./prisma'" *.ts
grep -r "from '@/lib/prisma[^-]'" *.ts
```

**Expected:** monitoring.ts and utils.ts should import from `./prisma`, NOT `../prisma` or `@/lib/prisma`

---

## 📋 Phase 2: Move Shared Schema to Platform

### Step 2.1: Copy Schema Files

**Context:** The platform should own its schema, not share it (even if chatbot/website use same DB)

**Commands:**
```bash
# From repository root
cd /Users/grant/Documents/GitHub/Strive-SaaS

# Create platform prisma directory if it doesn't exist
mkdir -p "(platform)/prisma"

# Copy schema file
cp shared/prisma/schema.prisma "(platform)/prisma/schema.prisma"

# Copy migrations
cp -r shared/prisma/migrations "(platform)/prisma/"

# Copy documentation
cp shared/prisma/SCHEMA-QUICK-REF.md "(platform)/prisma/"
cp shared/prisma/SCHEMA-MODELS.md "(platform)/prisma/"
cp shared/prisma/SCHEMA-ENUMS.md "(platform)/prisma/"
cp shared/prisma/README.md "(platform)/prisma/"

# Verify copy
ls -la "(platform)/prisma/"
```

**Expected files in (platform)/prisma/:**
- schema.prisma
- migrations/ (directory)
- SCHEMA-QUICK-REF.md
- SCHEMA-MODELS.md
- SCHEMA-ENUMS.md
- README.md

### Step 2.2: Update package.json Scripts

**File:** `(platform)/package.json`

**Find and update these scripts:**
```json
// BEFORE (references ../shared/prisma/)
{
  "db:generate": "prisma generate --schema=../shared/prisma/schema.prisma",
  "db:migrate": "node ../scripts/database/create-migration.js",
  "db:status": "node ../scripts/database/migration-status.js",
  "db:docs": "node ../scripts/database/generate-schema-docs.js",
  "db:sync": "node ../scripts/database/check-schema-sync.js",
  "db:check-rls": "node ../scripts/database/check-rls-policies.js",
  "prisma:studio": "prisma studio --schema=../shared/prisma/schema.prisma"
}

// AFTER (references ./prisma/)
{
  "db:generate": "prisma generate --schema=./prisma/schema.prisma",
  "db:migrate": "node ../scripts/database/create-migration.js",
  "db:status": "node ../scripts/database/migration-status.js",
  "db:docs": "node ../scripts/database/generate-schema-docs.js",
  "db:sync": "node ../scripts/database/check-schema-sync.js",
  "db:check-rls": "node ../scripts/database/check-rls-policies.js",
  "prisma:studio": "prisma studio --schema=./prisma/schema.prisma"
}
```

**Tool to use:** Edit tool on package.json

### Step 2.3: Update Helper Scripts

**Scripts to update:** (all in `scripts/database/`)
- `create-migration.js`
- `generate-schema-docs.js`
- `migration-status.js`
- `check-schema-sync.js`
- `apply-migration.js`

**Change needed in each:**
```javascript
// BEFORE
const schemaPath = path.join(__dirname, '../../shared/prisma/schema.prisma');

// AFTER
const schemaPath = path.join(__dirname, '../(platform)/prisma/schema.prisma');
```

**Tool to use:** Edit tool on each file

**Verification:**
```bash
cd "(platform)"
npm run db:generate
# Should generate client successfully
```

---

## 📋 Phase 3: Move Supabase Docs to Platform

### Step 3.1: Create Documentation Directory

```bash
cd "(platform)/lib/database"
mkdir -p docs

# Verify
ls -ld docs
```

### Step 3.2: Move Documentation Files

```bash
# From repository root
cd /Users/grant/Documents/GitHub/Strive-SaaS

# Copy Supabase documentation
cp shared/supabase/SUPABASE-SETUP.md "(platform)/lib/database/docs/"
cp shared/supabase/RLS-POLICIES.md "(platform)/lib/database/docs/"
cp shared/supabase/STORAGE-BUCKETS.md "(platform)/lib/database/docs/"

# Verify
ls -la "(platform)/lib/database/docs/"
```

**Expected files:**
- SUPABASE-SETUP.md
- RLS-POLICIES.md
- STORAGE-BUCKETS.md

### Step 3.3: Create New Documentation Files

**Create these new files in `(platform)/lib/database/docs/`:**

1. **PRISMA-SUPABASE-DECISION-TREE.md**
   - Decision tree for when to use Prisma vs Supabase
   - Comparison table
   - ASCII flowchart

2. **HYBRID-PATTERNS.md**
   - Real examples from platform
   - AI Chatbot pattern
   - Transaction Management pattern
   - Activity Feed pattern
   - File Upload pattern

3. **TESTING-RLS.md**
   - How to test RLS policies
   - SQL commands for verification
   - Test scenarios
   - Automated test examples

**Tool to use:** Write tool for each file

---

## 📋 Phase 4: Update CLAUDE.md Files

### Step 4.1: Update Root CLAUDE.md

**File:** `/Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md`

**Changes needed:**

1. **Update Database Operations Workflow section:**
```markdown
// BEFORE
**ALWAYS follow this workflow:**

1. **Schema Inspection** - Use local documentation (500 tokens vs 18k!)
   ```bash
   # Quick reference (model & enum names only)
   cat shared/prisma/SCHEMA-QUICK-REF.md

   # Detailed model fields
   cat shared/prisma/SCHEMA-MODELS.md

   # Enum values
   cat shared/prisma/SCHEMA-ENUMS.md
   ```

// AFTER
**ALWAYS follow this workflow:**

1. **Schema Inspection** - Use local documentation (500 tokens vs 18k!)
   ```bash
   # From platform directory
   cd (platform)

   # Quick reference (model & enum names only)
   cat prisma/SCHEMA-QUICK-REF.md

   # Detailed model fields
   cat prisma/SCHEMA-MODELS.md

   # Enum values
   cat prisma/SCHEMA-ENUMS.md
   ```
```

2. **Update Scripts Location section:**
```markdown
// BEFORE
**Scripts Location:** `scripts/database/`

// AFTER
**Scripts Location:** `scripts/database/` (repository root)
**Documentation:** `(platform)/lib/database/docs/`
```

3. **Add RLS Warning Section (NEW):**
```markdown
## ⚠️ CRITICAL: Prisma Bypasses RLS

**Important Security Context:**

Prisma connects to PostgreSQL using `DATABASE_URL` which contains the service role credentials. This means:

❌ **Prisma BYPASSES Row Level Security (RLS) policies**
✅ **Application-level filtering is REQUIRED**

**You MUST use one of these approaches:**

1. **Recommended: Tenant Isolation Middleware**
   ```typescript
   import { prisma } from '@/lib/database/prisma';
   import { setTenantContext } from '@/lib/database/prisma-middleware';

   // Set context BEFORE queries
   setTenantContext({
     organizationId: user.orgId,
     userId: user.id
   });

   // Queries automatically filtered
   const customers = await prisma.customers.findMany();
   ```

2. **Alternative: Manual Filtering**
   ```typescript
   const customers = await prisma.customers.findMany({
     where: { organization_id: user.orgId }
   });
   ```

**RLS is still important for:**
- Defense-in-depth security
- Protecting raw SQL queries
- Database-level audit logs
- External tool access

**See:** `(platform)/lib/database/docs/RLS-POLICIES.md` for complete guide
```

### Step 4.2: Update (platform)/CLAUDE.md

**File:** `/Users/grant/Documents/GitHub/Strive-SaaS/(platform)/CLAUDE.md`

**Changes needed:**

1. **Update COMMANDS section:**
```markdown
// BEFORE
# Database (⚠️ USE HELPER SCRIPTS - See below)
npm run db:docs         # Generate schema documentation (ALWAYS after schema changes)
npm run db:status       # Check migration status
npm run db:migrate      # Create migration (interactive)
npm run db:sync         # Check for schema drift

# Database - Schema Inspection (99% token savings!)
# ❌ NEVER: Use MCP list_tables tool (18k tokens!)
# ✅ ALWAYS: Read local documentation first (500 tokens)
cat ../shared/prisma/SCHEMA-QUICK-REF.md    # Quick reference
cat ../shared/prisma/SCHEMA-MODELS.md       # Model details
cat ../shared/prisma/SCHEMA-ENUMS.md        # Enum values

// AFTER
# Database (⚠️ USE HELPER SCRIPTS - See below)
npm run db:docs         # Generate schema documentation (ALWAYS after schema changes)
npm run db:status       # Check migration status
npm run db:migrate      # Create migration (interactive)
npm run db:sync         # Check for schema drift

# Database - Schema Inspection (99% token savings!)
# ❌ NEVER: Use MCP list_tables tool (18k tokens!)
# ✅ ALWAYS: Read local documentation first (500 tokens)
cat prisma/SCHEMA-QUICK-REF.md    # Quick reference
cat prisma/SCHEMA-MODELS.md       # Model details
cat prisma/SCHEMA-ENUMS.md        # Enum values

# Database - Documentation
cat lib/database/docs/SUPABASE-SETUP.md              # Supabase integration
cat lib/database/docs/RLS-POLICIES.md                # Row Level Security
cat lib/database/docs/PRISMA-SUPABASE-DECISION-TREE.md  # When to use what
cat lib/database/docs/HYBRID-PATTERNS.md             # Real-world patterns
cat lib/database/docs/TESTING-RLS.md                 # Testing guide
```

2. **Update SECURITY MANDATES section:**
```markdown
// Add after existing security rules

// 9. Tenant Isolation (CRITICAL)
import { setTenantContext } from '@/lib/database/prisma-middleware';

// ALWAYS set tenant context before queries
await setTenantContext({
  organizationId: session.user.organizationId,
  userId: session.user.id
});

// Now queries are automatically filtered
const data = await prisma.customers.findMany();
```

3. **Update Database Workflow Anti-patterns:**
```markdown
// BEFORE
# Database Workflow Anti-patterns (CRITICAL!)
❌ Use MCP list_tables for schema inspection // 18k tokens wasted!
❌ Query database to see what models exist // Read SCHEMA-QUICK-REF.md instead
❌ Create migration without updating docs // Always run npm run db:docs after
❌ Bypass helper scripts for migrations // Use npm run db:migrate
❌ Apply migrations without verification // Use npm run db:status first

// AFTER
# Database Workflow Anti-patterns (CRITICAL!)
❌ Use MCP list_tables for schema inspection // 18k tokens wasted!
❌ Query database to see what models exist // Read prisma/SCHEMA-QUICK-REF.md
❌ Create migration without updating docs // Always run npm run db:docs after
❌ Bypass helper scripts for migrations // Use npm run db:migrate
❌ Apply migrations without verification // Use npm run db:status first
❌ Skip setTenantContext before queries // SECURITY RISK - data leak!
❌ Import from @/lib/prisma // Use @/lib/database/prisma instead
```

### Step 4.3: Update Related Documentation

**Files to update:**
- `(platform)/README.md` - Update schema paths
- `(platform)/PLAN.md` - Update database workflow section
- `scripts/README.md` - Update script paths and examples

**Tool to use:** Edit tool on each file

---

## 📋 Phase 5: Clean Up Shared Directory

### Step 5.1: Decide on Shared Folder Fate

**Options:**

**Option A: Keep for chatbot/website (if they use same DB)**
- Keep `shared/prisma/` with a README pointing to platform
- Keep `shared/supabase/` with basic setup only
- Add note: "Platform has authoritative version"

**Option B: Delete entirely (if platform is only project using DB)**
- Delete `shared/prisma/`
- Delete `shared/supabase/`
- Update root CLAUDE.md to remove shared references

**Recommended:** Option A (safer, allows future sharing if needed)

### Step 5.2: If Keeping Shared (Option A)

**Create:** `shared/prisma/README.md`
```markdown
# Shared Prisma Schema - Deprecated

**⚠️ This directory is deprecated for new development.**

**Platform (app.strivetech.ai):**
- Schema location: `(platform)/prisma/schema.prisma`
- Documentation: `(platform)/lib/database/docs/`
- This is the authoritative source

**Chatbot (chat.strivetech.ai):**
- TBD: May use platform schema or have own schema

**Website (strivetech.ai):**
- TBD: Likely read-only access to platform DB

**For platform development, use:**
```bash
cd (platform)
npm run db:migrate   # Create migration
npm run db:docs      # Update documentation
```
```

**Create:** `shared/supabase/README.md`
```markdown
# Shared Supabase Configuration - Moved

**⚠️ Supabase documentation has moved to platform-specific location.**

**See:** `(platform)/lib/database/docs/`

**Files:**
- `SUPABASE-SETUP.md` - Complete setup guide
- `RLS-POLICIES.md` - Row Level Security patterns
- `STORAGE-BUCKETS.md` - File storage configuration
- `PRISMA-SUPABASE-DECISION-TREE.md` - Tool selection guide
- `HYBRID-PATTERNS.md` - Real-world examples
- `TESTING-RLS.md` - Testing guide
```

---

## 📋 Phase 6: Verification & Testing

### Step 6.1: TypeScript Compilation

```bash
cd "(platform)"
npx tsc --noEmit
```

**Expected:** Zero errors

**Common errors and fixes:**
- `Cannot find module '@/lib/prisma'` → Should be `@/lib/database/prisma`
- `Cannot find module './prisma'` in database/ → Check file exists
- `Type errors in prisma client` → Run `npm run db:generate`

### Step 6.2: Prisma Generation

```bash
cd "(platform)"
npm run db:generate
```

**Expected:**
```
✔ Generated Prisma Client (6.x.x) to ./node_modules/@prisma/client in XXXms
```

### Step 6.3: Schema Documentation

```bash
cd "(platform)"
npm run db:docs
```

**Expected:**
- `prisma/SCHEMA-QUICK-REF.md` updated
- `prisma/SCHEMA-MODELS.md` updated
- `prisma/SCHEMA-ENUMS.md` updated

**Verify:**
```bash
cat prisma/SCHEMA-QUICK-REF.md | head -20
# Should show model list
```

### Step 6.4: Import Path Verification

```bash
cd "(platform)"

# Should find NO results (except middleware importing from ./prisma)
grep -r "from '@/lib/prisma'" lib app --include="*.ts" | grep -v "database/prisma"

# Should find many results (correct import path)
grep -r "from '@/lib/database/prisma'" lib app --include="*.ts" | wc -l
# Expected: 100+ results
```

### Step 6.5: File Structure Verification

```bash
cd "(platform)"

# Check database directory
ls -1 lib/database/
# Expected: errors.ts, monitoring.ts, prisma-extension.ts, prisma-middleware.ts, prisma.ts, utils.ts, docs/

# Check docs directory
ls -1 lib/database/docs/
# Expected: SUPABASE-SETUP.md, RLS-POLICIES.md, STORAGE-BUCKETS.md,
#           PRISMA-SUPABASE-DECISION-TREE.md, HYBRID-PATTERNS.md, TESTING-RLS.md

# Check prisma directory
ls -1 prisma/
# Expected: schema.prisma, migrations/, SCHEMA-*.md, README.md

# Check NO simple prisma.ts in lib root
ls lib/prisma.ts 2>&1
# Expected: "No such file or directory"
```

### Step 6.6: Build Test

```bash
cd "(platform)"
npm run build
```

**Expected:** Successful build with no errors

---

## 📋 Phase 7: Git Commit

### Step 7.1: Review Changes

```bash
cd /Users/grant/Documents/GitHub/Strive-SaaS
git status
git diff
```

**Expected changes:**
- Modified: `(platform)/package.json`
- Modified: `(platform)/CLAUDE.md`
- Modified: `CLAUDE.md` (root)
- Modified: All files in `scripts/database/`
- Modified: Import statements in `(platform)/lib/` and `(platform)/app/`
- Added: `(platform)/prisma/` (entire directory)
- Added: `(platform)/lib/database/docs/` (entire directory)
- Deleted: `(platform)/lib/prisma.ts`
- Deleted: `(platform)/lib/prisma-middleware.ts` (duplicate)
- Modified: `shared/prisma/README.md` (if keeping shared)
- Modified: `shared/supabase/README.md` (if keeping shared)

### Step 7.2: Commit Changes

```bash
git add .

git commit -m "$(cat <<'EOF'
refactor(database): Move database files into platform directory

BREAKING CHANGES:
- Moved shared/prisma/ → (platform)/prisma/
- Moved shared/supabase/ docs → (platform)/lib/database/docs/
- Import path: Use @/lib/database/prisma (NOT @/lib/prisma)
- Schema location: (platform)/prisma/schema.prisma

CHANGES:
- Removed simple lib/prisma.ts (security risk)
- Kept secure lib/database/prisma.ts with tenant isolation
- Centralized all database code in lib/database/
- Added new documentation:
  - PRISMA-SUPABASE-DECISION-TREE.md
  - HYBRID-PATTERNS.md
  - TESTING-RLS.md
- Updated package.json scripts to use ./prisma/
- Updated helper scripts to use (platform)/prisma/
- Updated CLAUDE.md with RLS warnings and correct paths

SECURITY:
- Preserved tenant isolation middleware
- All imports use secure client from lib/database/prisma
- Added prominent RLS bypass warnings in documentation

NOTE: Database itself unchanged - still one Supabase DB shared by all projects.
This only moves schema files and documentation to platform directory.

See: (platform)/MIGRATION-PLAN-MOVE-DATABASE-FILES.md for details

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## ✅ Final Checklist

Use this checklist to track progress:

### Phase 1: Revert
- [ ] Reverted imports from `@/lib/prisma` → `@/lib/database/prisma`
- [ ] Deleted `lib/prisma.ts`
- [ ] Deleted duplicate `lib/prisma-middleware.ts`
- [ ] Verified `lib/database/` has all 6 files

### Phase 2: Move Schema
- [ ] Copied schema to `(platform)/prisma/`
- [ ] Copied migrations to `(platform)/prisma/migrations/`
- [ ] Copied schema docs to `(platform)/prisma/`
- [ ] Updated `package.json` scripts
- [ ] Updated helper scripts in `scripts/database/`
- [ ] Verified `npm run db:generate` works

### Phase 3: Move Docs
- [ ] Created `lib/database/docs/` directory
- [ ] Copied SUPABASE-SETUP.md
- [ ] Copied RLS-POLICIES.md
- [ ] Copied STORAGE-BUCKETS.md
- [ ] Created PRISMA-SUPABASE-DECISION-TREE.md
- [ ] Created HYBRID-PATTERNS.md
- [ ] Created TESTING-RLS.md

### Phase 4: Update Docs
- [ ] Updated root CLAUDE.md
- [ ] Updated (platform)/CLAUDE.md
- [ ] Updated (platform)/README.md
- [ ] Updated (platform)/PLAN.md
- [ ] Updated scripts/README.md

### Phase 5: Clean Up
- [ ] Decided on shared/ fate (keep or delete)
- [ ] Created README files in shared/ (if keeping)
- [ ] OR deleted shared/prisma/ and shared/supabase/ (if removing)

### Phase 6: Verification
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Prisma generates: `npm run db:generate`
- [ ] Docs generate: `npm run db:docs`
- [ ] Import paths verified (no `@/lib/prisma` except in middleware)
- [ ] File structure correct
- [ ] Build succeeds: `npm run build`

### Phase 7: Commit
- [ ] Reviewed all changes with `git status` and `git diff`
- [ ] Committed with detailed message
- [ ] Verified git log shows commit

---

## 🚨 Rollback Plan (If Something Goes Wrong)

If migration fails:

```bash
# 1. Discard all changes
git reset --hard HEAD
git clean -fd

# 2. Restore from this commit
git log --oneline | head -1
# Note the commit hash

# 3. If already committed, revert
git revert HEAD
```

---

## 📚 Reference: File Locations After Migration

**Import Statements:**
```typescript
// ✅ CORRECT
import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { handleDatabaseError } from '@/lib/database/errors';
import { getDatabaseHealth } from '@/lib/database/monitoring';
import { withTenantContext } from '@/lib/database/utils';

// ❌ WRONG
import { prisma } from '@/lib/prisma';  // File doesn't exist!
```

**Schema & Migrations:**
```bash
# ✅ CORRECT
(platform)/prisma/schema.prisma
(platform)/prisma/migrations/
(platform)/prisma/SCHEMA-QUICK-REF.md

# ❌ OLD (deprecated)
shared/prisma/schema.prisma
```

**Documentation:**
```bash
# ✅ CORRECT
(platform)/lib/database/docs/SUPABASE-SETUP.md
(platform)/lib/database/docs/RLS-POLICIES.md
(platform)/lib/database/docs/PRISMA-SUPABASE-DECISION-TREE.md

# ❌ OLD (deprecated)
shared/supabase/SUPABASE-SETUP.md
```

**Helper Scripts:**
```bash
# Location (unchanged)
scripts/database/create-migration.js
scripts/database/generate-schema-docs.js

# Usage from platform
cd (platform)
npm run db:migrate   # Calls create-migration.js
npm run db:docs      # Calls generate-schema-docs.js
```

---

## 🎯 Expected Outcome

After completing this migration:

✅ **Single source of truth:** All platform database code in `(platform)/lib/database/`
✅ **Secure by default:** All imports use tenant isolation client
✅ **Well documented:** Complete docs in `lib/database/docs/`
✅ **Self-contained:** Platform owns its schema in `(platform)/prisma/`
✅ **Consistent imports:** `@/lib/database/prisma` everywhere
✅ **No security risks:** Simple prisma.ts deleted
✅ **Better organization:** Clear separation of concerns

---

**Last Updated:** 2025-10-06
**Estimated Time:** 2-3 hours
**Complexity:** Medium (requires careful verification)
