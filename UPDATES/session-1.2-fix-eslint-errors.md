# Session 1.2: Fix ESLint Errors

**Phase:** 1 - Critical Blockers
**Priority:** 🔴 CRITICAL
**Estimated Time:** 2-3 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Fix all 40 ESLint errors blocking the build pipeline.

**Error Types:**
- `react/no-unescaped-entities`: ~35 errors (apostrophes/quotes in JSX)
- `@typescript-eslint/no-require-imports`: ~5 errors (require() in ES6 modules)

**Impact:** Vercel deployment will be rejected with these errors.

---

## 📋 TASK FOR AGENT

```markdown
FIX ALL ESLINT ERRORS in (platform) project

**Problem:**
40 ESLint errors are blocking production build:
1. react/no-unescaped-entities: Unescaped characters in JSX (~35 errors)
2. @typescript-eslint/no-require-imports: Using require() in ES6 modules (~5 errors)

**Requirements:**

1. **Identify All Errors:**
   ```bash
   cd (platform)
   npm run lint > lint-errors.txt
   cat lint-errors.txt | grep "error" | head -50
   ```
   - Create complete list of files with errors
   - Categorize by error type
   - Prioritize by file (fix all errors per file)

2. **Fix react/no-unescaped-entities (~35 errors):**

   **Pattern:** Apostrophes and quotes in JSX text

   **Solution:**
   ```tsx
   // ❌ WRONG:
   <p>Don't use this pattern</p>
   <p>"Quoted text" here</p>

   // ✅ CORRECT (Option 1 - HTML entities):
   <p>Don&apos;t use this pattern</p>
   <p>&#34;Quoted text&#34; here</p>

   // ✅ CORRECT (Option 2 - Template literals):
   <p>{`Don't use this pattern`}</p>
   <p>{`"Quoted text" here`}</p>
   ```

   **Files to fix:**
   - Error boundaries
   - Landing pages
   - Marketing pages
   - Component text content

   **Process:**
   - Fix ALL instances in each file
   - Use consistent approach (prefer HTML entities for readability)
   - Preserve exact text content
   - Maintain formatting and spacing

3. **Fix @typescript-eslint/no-require-imports (~5 errors):**

   **Pattern:** Using require() in ES6 modules

   **Solution:**
   ```typescript
   // ❌ WRONG:
   const foo = require('./foo');

   // ✅ CORRECT:
   import foo from './foo';
   // OR for dynamic imports:
   const foo = await import('./foo');
   ```

   **Process:**
   - Convert require() to import statements
   - Use dynamic import() for conditional loads
   - Update type declarations if needed
   - Test imports work correctly

4. **Verification (REQUIRED):**
   ```bash
   cd (platform)
   npm run lint                   # MUST show ZERO errors
   npx tsc --noEmit              # Verify no type errors introduced
   npm run build                  # MUST complete successfully
   ```

**DO NOT report success unless:**
- ALL 40 errors are fixed
- `npm run lint` shows ZERO errors (warnings OK)
- No new TypeScript errors introduced
- Build completes successfully
- All fixes tested and verified

**Return Format:**
## ✅ EXECUTION REPORT

**Files Modified:** [count]
- path/to/file1.tsx - Fixed 5 react/no-unescaped-entities
- path/to/file2.ts - Fixed 2 no-require-imports
- [complete list]

**Errors Fixed:**
- react/no-unescaped-entities: [count] instances
- @typescript-eslint/no-require-imports: [count] instances
- Total: [count] errors

**Verification Results:**
```
[Paste ACTUAL command outputs - not summaries]

npm run lint output:
[full output showing ZERO errors]

npx tsc --noEmit output:
[confirmation of no type errors]

npm run build output:
[successful build confirmation]
```

**Issues Found:** NONE / [list any remaining issues]

**Note:** Warnings are acceptable for now (Phase 4 will address)
```

---

## 🔒 SECURITY REQUIREMENTS

**No Security Impact Expected**
- These are syntax/style fixes only
- Preserve all existing logic
- No changes to data handling or validation

---

## 🧪 VERIFICATION CHECKLIST

Agent must provide proof of:
- [ ] ESLint shows ZERO errors: `npm run lint`
- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] All files properly formatted
- [ ] No functionality changes

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Zero ESLint errors remain
- Build pipeline passes
- TypeScript validation succeeds
- Agent provides complete verification outputs
- All fixes use consistent patterns

---

## 🚨 COMMON PITFALLS

**Avoid:**
- ❌ Removing text content instead of fixing encoding
- ❌ Breaking template literals or string interpolation
- ❌ Converting working dynamic imports to static imports incorrectly
- ❌ Fixing some files but missing others

**Best Practices:**
- ✅ Fix all errors in one file before moving to next
- ✅ Use HTML entities for consistency (&apos; &quot;)
- ✅ Test each file after fixing
- ✅ Run lint after each file to track progress

---

## 🚨 FAILURE RECOVERY

**If agent reports issues:**
1. Provide exact files still showing errors
2. Show specific error messages from ESLint
3. Review fixes for pattern consistency
4. Check for edge cases (nested quotes, special characters)

**Max attempts:** 2 (if not resolved, escalate for manual review)

---

**Created:** 2025-10-10
**Dependencies:** Session 1.1 complete (build must work)
**Next Phase:** Phase 2 - MVP Deployment
