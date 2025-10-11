# Session 1.1: Fix Server Action Build Errors

**Phase:** 1 - Critical Blockers
**Priority:** 🔴 CRITICAL
**Estimated Time:** 1 hour
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Fix build-blocking server action errors in the transactions milestones calculator.

**Issue:**
```
Server Actions must be async functions.
- getMilestonesForType() at line 327
- getCurrentMilestone() at line 338
- getNextMilestone() at line 366
```

**Location:** `(platform)/lib/modules/transactions/milestones/calculator.ts`

---

## 📋 TASK FOR AGENT

```markdown
FIX CRITICAL BUILD ERRORS in (platform)/lib/modules/transactions/milestones/calculator.ts

**Problem:**
The file has 'use server' directive but contains 3 synchronous functions:
- getMilestonesForType() at line ~327
- getCurrentMilestone() at line ~338
- getNextMilestone() at line ~366

Next.js requires ALL exports in 'use server' files to be async functions.

**Solution Options:**
1. Make all 3 functions async (if they need server context)
2. Remove 'use server' directive and move functions to separate utility file
3. Keep 'use server' but only export async functions (move sync to utils)

**Choose the best option based on:**
- Do these functions access database/server resources?
- Are they called from client components?
- Are they pure utility functions?

**Requirements:**

1. **Analyze Current Usage:**
   - Read lib/modules/transactions/milestones/calculator.ts
   - Check if functions access Prisma or server-only resources
   - Search for imports: grep -r "getMilestonesForType\|getCurrentMilestone\|getNextMilestone" (platform)/app (platform)/lib
   - Determine if functions need server context

2. **Implement Fix:**
   - Option A: Make async if server access needed
   - Option B: Remove 'use server' if pure utilities
   - Option C: Split file (async exports + sync utils)
   - Maintain all existing functionality
   - Preserve type safety

3. **Verification (REQUIRED):**
   ```bash
   cd (platform)
   npx tsc --noEmit              # MUST show ZERO errors
   npm run lint                   # Check for new issues
   npm run build                  # MUST complete successfully
   ```

**DO NOT report success unless:**
- All 3 functions are fixed
- Build completes with ZERO errors
- No new TypeScript errors introduced
- Existing functionality preserved

**Return Format:**
## ✅ EXECUTION REPORT

**Files Modified:**
- List each file changed with line count

**Solution Chosen:**
- Option A/B/C and why

**Verification Results:**
```
[Paste ACTUAL command outputs - not summaries]
npx tsc --noEmit output:
npm run lint output:
npm run build output:
```

**Issues Found:** NONE / [list any remaining issues]
```

---

## 🔒 SECURITY REQUIREMENTS

**Multi-Tenancy:**
- If functions query database, ensure organizationId filtering preserved
- Maintain RLS context if present

**RBAC:**
- Preserve any existing permission checks
- No changes to authorization logic

---

## 🧪 VERIFICATION CHECKLIST

Agent must provide proof of:
- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] All 3 functions fixed
- [ ] No functionality regression

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Build error messages no longer appear
- `npm run build` completes successfully
- No new errors introduced
- Agent provides complete verification outputs

---

## 🚨 FAILURE RECOVERY

**If agent reports issues:**
1. Provide exact error messages
2. Try alternative solution option
3. Consult existing server action patterns in lib/modules/crm/

**Max attempts:** 2 (if not resolved, escalate for manual review)

---

**Created:** 2025-10-10
**Dependencies:** None
**Next Session:** 1.2 - Fix ESLint Errors
