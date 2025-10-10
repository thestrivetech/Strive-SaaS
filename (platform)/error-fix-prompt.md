# Platform Build Fix - Agent Execution Prompt

**Version:** 1.0
**Strategy:** Batched execution (3-5 tasks per batch)
**Total Issues:** 1,676 → Target: 0

---

## 🔴 CRITICAL: READ THESE FILES FIRST

**Before starting ANY batch, you MUST read:**

1. **Project Standards & Context:**
   ```
   (platform)/CLAUDE.md
   ```
   - Platform architecture (3-level hierarchy: Industry > Module > Page)
   - Security requirements (RBAC, multi-tenancy, RLS)
   - Database workflow (use local docs, NOT MCP tools - 99% token savings!)
   - File size limits (500 lines max)
   - ESLint rules and targets

2. **Batched Execution Plan:**
   ```
   (platform)/BUILD-FIX-PHASES-BATCHED.md
   ```
   - Complete batch breakdown (15 batches)
   - Exact tasks for each batch
   - Verification commands
   - Expected outcomes

**Reading these files is MANDATORY. Do NOT proceed without reading all three.**

---

## 📋 CURRENT BATCH IDENTIFICATION

**You are executing:** BATCH [3.2] - [Batch Name]

**Location in BUILD-FIX-PHASES-BATCHED.md:**
- Navigate to section: "BATCH [3.2]"
- Read complete batch instructions
- Note all tasks (typically 3-5 tasks)
- Review verification requirements

**Current Phase Context:**
- Phase 1: Critical Build Blockers (Batches 1.1-1.2)
- Phase 2: Test Infrastructure (Batches 2.1-2.3)
- Phase 3: Type System Cleanup (Batches 3.1-3.3)
- Phase 4: Code Quality (Batches 4.1-4.5)
- Phase 5: Production Security (Batches 5.1-5.2)

---

## ⚡ EXECUTION PROTOCOL

### Step 1: Batch Preparation

**Navigate to platform directory:**
```bash
cd "(platform)"
```

**Read batch section in BUILD-FIX-PHASES-BATCHED.md:**
- Locate "BATCH [X.Y]" section
- Read task descriptions (Tasks X.Y.1 through X.Y.N)
- Note dependencies
- Review expected outcomes

**Verify prerequisites:**
- Check previous batch completion status
- Verify current state matches expectations
- Run initial verification commands if specified

---

### Step 2: Task Execution

**For EACH task in the batch:**

1. **Read Before Acting**
   - Read affected files completely
   - Understand current implementation
   - Verify file locations exist
   - Check dependencies

2. **Make Targeted Changes**
   - Apply ONLY the specific fix described
   - Follow patterns from BUILD-FIX-PHASES-BATCHED.md
   - Respect file size limits (<500 lines)
   - Maintain existing code style

3. **Verify Immediately**
   - Run task-specific verification command
   - Check for new errors introduced
   - Validate expected outcome achieved

4. **Document Progress**
   - Track files modified
   - Note any blockers encountered
   - Record verification results

---

### Step 3: Database Operations (CRITICAL)

**Token Efficiency - 99% Savings:**

```bash
# ❌ NEVER DO THIS (wastes 18-21k tokens):
# - Use MCP list_tables tool
# - Query database for schema info

# ✅ ALWAYS DO THIS (500 tokens):
# Read local schema documentation:
cat prisma/SCHEMA-QUICK-REF.md      # Model & enum names
cat prisma/SCHEMA-MODELS.md         # Field details
cat prisma/SCHEMA-ENUMS.md          # Enum values

# For schema changes:
npm run db:migrate                  # Create migration
npm run db:docs                     # Update docs
```

**Schema Path:**
- Always use: `--schema=../shared/prisma/schema.prisma`
- Schema is in shared/ directory (tri-fold architecture)

**Migration Workflow:**
1. Read schema docs (NOT MCP tools)
2. Modify schema if needed
3. Create migration with helper script
4. Update docs
5. Verify with TypeScript check

---

### Step 4: Security Requirements (Platform)

**EVERY change must maintain:**

1. **Multi-Tenancy (CRITICAL)**
   - ALL queries MUST filter by `organizationId`
   - No cross-organization data access
   - RLS policies must remain intact

2. **RBAC (Dual-Role System)**
   - Check BOTH `globalRole` AND `organizationRole`
   - Verify permissions in Server Actions
   - Maintain tier-based feature gates

3. **Input Validation**
   - Use Zod schemas for ALL user input
   - Validate in Server Actions before processing
   - Never trust client data

4. **Secrets Protection**
   - NO hardcoded secrets in code
   - Server-only imports for sensitive files
   - .env.local NEVER committed

---

### Step 5: Batch Verification

**After completing ALL tasks in batch:**

```bash
cd "(platform)"

# Run batch-specific verification commands
# (Listed in BUILD-FIX-PHASES-BATCHED.md for this batch)

# Common verifications:
npx tsc --noEmit                    # TypeScript errors
npm run lint                        # ESLint warnings
npm test -- [specific-test]         # Test verification

# Record FULL command outputs (not just "passed")
```

**Success Criteria:**
- All tasks completed as specified
- Verification commands pass (or show expected progress)
- No new errors introduced
- Progress metrics match expectations

---

## 🛑 STOP CONDITIONS

**You MUST STOP after completing this batch when:**

1. ✅ All tasks in current batch completed
2. ✅ All verification commands run
3. ✅ EXECUTION REPORT prepared
4. ✅ Blockers documented (if any)

**DO NOT:**
- ❌ Proceed to next batch
- ❌ Expand scope beyond batch tasks
- ❌ Fix errors outside batch scope
- ❌ Continue without verification

**Batch completion signals:**
- All tasks marked complete or blocked
- Verification results documented
- Ready to report back

---

## 📊 EXECUTION REPORT FORMAT

**Provide this exact format:**

```markdown
## ✅ BATCH [X.Y] EXECUTION REPORT

**Batch:** [X.Y] - [Batch Name]
**Phase:** [Phase Number] - [Phase Name]
**Duration:** [Actual time taken]
**Status:** ✅ COMPLETE / ⚠️ PARTIAL / ❌ BLOCKED

---

### Tasks Completed

**Task [X.Y.1]: [Task Name]**
- Status: ✅ COMPLETE / ⚠️ BLOCKED
- Files modified: [list with line counts]
- Changes: [brief description]
- Verification: [command output or result]

**Task [X.Y.2]: [Task Name]**
- Status: ✅ COMPLETE / ⚠️ BLOCKED
- Files modified: [list]
- Changes: [description]
- Verification: [result]

[Repeat for all tasks in batch]

---

### Verification Results

**Batch-Specific Verifications:**
[Paste FULL command outputs from batch verification section]

**Progress Metrics:**
- [Metric 1]: [Before] → [After] (e.g., TypeScript errors: 835 → 829)
- [Metric 2]: [Before] → [After]
- [Metric 3]: [Before] → [After]

---

### Issues & Blockers

**Blockers Found:** [Number] / NONE

[If blockers present, list each:]
**Blocker 1:**
- Location: [file:line]
- Issue: [description]
- Root cause: [analysis]
- Recommendation: [action needed]

---

### Summary

**Batch Objectives:**
- [Objective 1]: ✅ Achieved / ⚠️ Partial / ❌ Not achieved
- [Objective 2]: ✅ Achieved / ⚠️ Partial / ❌ Not achieved

**Files Modified:** [Total count]
**Errors Fixed:** [Count]
**Errors Remaining:** [Count]

**Next Batch Ready:** ✅ YES / ⚠️ WITH CAVEATS / ❌ NO

[If NO or WITH CAVEATS, explain what needs to happen before next batch]

---

### Command Outputs

[Paste COMPLETE outputs of all verification commands - NOT summaries]

---

**Batch Status:** ✅ COMPLETE AND VERIFIED
**Agent Status:** 🛑 STOPPED - Awaiting next batch deployment
```

---

## 🎯 BATCH-SPECIFIC GUIDELINES

### Phase 1: Critical Build Blockers

**Focus:** Enable build to progress
**Key Risk:** Missing files or incorrect paths
**Verification:** Build progresses further (may still fail, but on different errors)

---

### Phase 2: Test Infrastructure

**Focus:** Fix Jest mocking type errors
**Key Pattern:** Use mock helpers from Batch 2.1
**Verification:** Tests compile (may fail on logic, but NOT on types)

**Mock Helper Usage:**
```typescript
import { mockAsyncFunction, setupAuthMocks } from '../helpers/mock-helpers';

jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma');

beforeEach(() => {
  jest.clearAllMocks();
  setupAuthMocks();
});
```

---

### Phase 3: Type System Cleanup

**Focus:** Achieve 0 TypeScript errors
**Key Pattern:** Minimal, targeted fixes

**Common Fixes:**
```typescript
// Missing fields
const obj = { name: 'required', ...otherFields };

// Implicit any
items.forEach((item: ItemType) => { ... });

// Function signatures
// Read function definition, align call
```

**CRITICAL:** Use local schema docs for enums/types
```bash
cat prisma/SCHEMA-ENUMS.md | grep "EnumName"
```

---

### Phase 4: Code Quality (ESLint)

**Focus:** Eliminate all warnings
**Key Patterns:**

**API Routes:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({ /* fields */ });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = Schema.parse(body);
  // ...
  return NextResponse.json({ success: true });
}
```

**Stripe Webhooks:**
```typescript
import Stripe from 'stripe';

function handleEvent(event: Stripe.Event) {
  const data = event.data.object as Stripe.Subscription;
  // Properly typed
}
```

**Unused Variables:**
- Remove if genuinely unused
- Prefix with `_` if needed for signature: `_unusedParam`

---

### Phase 5: Production Security

**Focus:** Remove vulnerabilities
**Critical Checks:**

1. **Auth Bypass Removal:**
   ```bash
   grep -r "isLocalhost" lib/auth/ lib/middleware/
   # Expected: NO RESULTS
   ```

2. **Server-Only Restoration:**
   ```typescript
   // First line of sensitive files:
   import 'server-only';
   ```

3. **No Secrets in Code:**
   ```bash
   grep -r "sk_live_\|sk_test_" . --exclude-dir=node_modules
   # Expected: NO RESULTS
   ```

---

## ✅ SUCCESS CHECKLIST

**Before reporting batch complete:**

- [ ] All batch tasks attempted (completed or blocked with reason)
- [ ] All verification commands run (outputs captured)
- [ ] No new errors introduced (verified with checks)
- [ ] Progress metrics documented (before/after counts)
- [ ] Blockers clearly documented (if any)
- [ ] EXECUTION REPORT complete (using exact format)
- [ ] STOPPED (not proceeding to next batch)

---

## 🚀 BATCH DEPLOYMENT COMMAND

**To execute this prompt for a specific batch:**

```
Execute BATCH [X.Y] using error-fix-prompt.md

Current Batch: [X.Y] - [Batch Name]

Instructions:
1. Read error-fix-prompt.md (this file)
2. Read the 3 required files listed in prompt
3. Navigate to BATCH [X.Y] in BUILD-FIX-PHASES-BATCHED.md
4. Execute batch tasks following the protocol
5. Run verifications
6. Provide EXECUTION REPORT
7. STOP

DO NOT proceed to other batches.
"
```

---

## 📌 QUICK REFERENCE

**Project:** Strive Tech SaaS Platform (platform)
**Total Phases:** 5
**Total Batches:** 15
**Current Issues:** 1,676
**Target:** 0 errors, 0 warnings, production ready

**Key Files:**
- Standards: `(platform)/CLAUDE.md`
- Batch Plan: `(platform)/BUILD-FIX-PHASES-BATCHED.md`
- This Prompt: `error-fix-prompt.md`

**Progress Tracking:**
**Phase 1:** ✅✅ (2 batches) - ✅ COMPLETE (2025-10-10)
**Phase 2:** ✅✅✅ (3 batches) - ✅ **COMPLETE!** (2025-10-10 - Verified)
**Phase 3:** ✅⚠️⬜ (3 batches) - IN PROGRESS (Batch 3.2 PARTIAL 58% - excellent progress!)
**Phase 4:** ⬜⬜⬜⬜⬜ (5 batches) - WAITING
**Phase 5:** ⬜⬜ (2 batches) - WAITING


<- Let's begin ->

Use the agent guide file -> C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.claude\agents\single-agent-usage-guide.md and optimally use the agent to complete each batch sequentially.