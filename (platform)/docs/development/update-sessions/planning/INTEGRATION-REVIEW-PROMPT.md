# Integration Review Prompt - Single Agent Approach

**Comprehensive quality review for completed integration sessions**

Use this prompt to review any module's previous work for quality issues, bugs, and standards compliance.

---

## 📋 REVIEW PROMPT TEMPLATE

```
I need to conduct a comprehensive quality review of the {C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\completed\transaction-workspace-&-modules} integration work.

## STEP 1: READ ESSENTIAL DOCUMENTATION

Read these files to understand current standards:

1. **Agent Orchestration Guide**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.claude\agents\single-agent-usage-guide.md

   Focus on: Security requirements, database workflow, platform standards

2. **Root Development Standards**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md

   Focus on: Read-before-edit mandate, database workflow, tri-fold architecture

3. **Platform Standards**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md

   Focus on: Multi-industry architecture, RBAC, security mandates, anti-patterns

4. **Module Session Summaries** (if exist):
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\{MODULE_DIR}\session-*-summary.md

---

## STEP 2: LAUNCH REVIEW AGENT

Task strive-agent-universal "
QUALITY REVIEW: {MODULE_NAME} Integration

## Review Context
You are conducting a comprehensive quality review of previously completed integration work.
Your goal is to identify bugs, security issues, standards violations, and quality problems.

## Module Details
- Module: {MODULE_NAME}
- Location: (platform)/app/real-estate/{module-path}/
- Backend: (platform)/lib/modules/{module-path}/
- Components: (platform)/components/real-estate/{module-path}/
- Sessions to review: {SESSION_RANGE} (e.g., sessions 1-4)

## Review Checklist

### 1. SECURITY AUDIT (CRITICAL)

**Multi-Tenancy Violations:**
- [ ] Check ALL database queries for organizationId filtering
  Command: grep -r 'prisma\\.' app/real-estate/{module-path}/ lib/modules/{module-path}/ --include='*.ts' --include='*.tsx'
  Look for: findMany, findFirst, findUnique, update, delete WITHOUT organizationId in where clause

- [ ] Verify RLS context is set before queries (if applicable)
  Look for: Missing organizationId filters in Server Actions

**RBAC Violations:**
- [ ] Check for dual-role RBAC (GlobalRole AND OrganizationRole)
  Command: grep -r 'requireAuth\|canAccess\|globalRole\|organizationRole' app/real-estate/{module-path}/ lib/modules/{module-path}/
  Look for: Single-role checks (only GlobalRole OR only OrganizationRole)

- [ ] Verify Server Actions have permission checks
  Check: Every 'use server' function has requireAuth() and permission validation

**Input Validation:**
- [ ] Check for Zod schema validation on ALL user input
  Command: grep -r 'parse\|safeParse' lib/modules/{module-path}/ --include='*.ts'
  Look for: Server Actions without .parse() or .safeParse() calls

- [ ] Verify form data is validated before processing
  Check: FormData → Zod validation → Database mutation

**Subscription Tier Enforcement:**
- [ ] Check if module validates subscription tier access
  Look for: canAccessFeature() or tier checks before rendering/executing
  Module tier requirement: {TIER_REQUIREMENT}

**Secret Exposure:**
- [ ] Scan for exposed secrets or .env.local references
  Command: grep -rE '(SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET|DOCUMENT_ENCRYPTION_KEY|process\\.env)' app/real-estate/{module-path}/ components/
  Look for: process.env in client components, hardcoded keys

**XSS Prevention (if content/rich text):**
- [ ] Check for dangerouslySetInnerHTML usage
  Command: grep -r 'dangerouslySetInnerHTML' app/real-estate/{module-path}/ components/real-estate/{module-path}/
  Look for: Unsanitized user content

### 2. ARCHITECTURE COMPLIANCE

**File Size Limits:**
- [ ] Verify no files exceed 500 lines (ESLint hard limit)
  Command: find app/real-estate/{module-path}/ lib/modules/{module-path}/ components/real-estate/{module-path}/ -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -20
  Flag: Any file >500 lines

**Route Structure:**
- [ ] Verify correct route hierarchy (Industry > Module > Page)
  Check: Routes in app/real-estate/{module-path}/ (not app/(platform)/)
  Check: No duplicate routes, proper nesting

**Module Organization:**
- [ ] Verify backend logic in lib/modules/{module-path}/
  Check: actions.ts, queries.ts, schemas.ts, index.ts structure

- [ ] Verify no cross-module imports
  Command: grep -r '@/lib/modules/' lib/modules/{module-path}/ --include='*.ts'
  Look for: Imports from other modules (forbidden)

**Component Organization:**
- [ ] Verify components in correct directories
  Check: Real Estate components in components/real-estate/{module-path}/
  Check: Shared components in components/shared/
  Check: UI primitives in components/ui/

### 3. CODE QUALITY

**TypeScript Errors:**
- [ ] Run TypeScript check
  Command: cd (platform) && npx tsc --noEmit
  Report: ALL errors found (if any)

**Linting Issues:**
- [ ] Run ESLint check
  Command: cd (platform) && npm run lint
  Report: ALL warnings and errors (if any)

**Testing Coverage:**
- [ ] Check if tests exist for module
  Command: find __tests__/ -path "*{module-path}*" -name "*.test.ts*"
  Check: Module has corresponding tests

- [ ] Run tests for module
  Command: cd (platform) && npm test -- {module-path}
  Report: Pass/fail status and coverage percentage

**Build Verification:**
- [ ] Verify build succeeds
  Command: cd (platform) && npm run build 2>&1 | tail -30
  Report: Build success or failure with errors

### 4. DATABASE USAGE REVIEW

**Schema Documentation Usage:**
- [ ] Check if code references correct models
  Read: shared/prisma/SCHEMA-QUICK-REF.md for module's models
  Verify: Code uses documented models and fields correctly

- [ ] Check for deprecated or incorrect model usage
  Look for: Models that don't exist in current schema

**Query Optimization:**
- [ ] Check for N+1 query patterns
  Look for: Loops with await prisma.* inside
  Look for: Missing 'include' for related data

- [ ] Check for missing pagination
  Look for: findMany() without take/skip on large datasets

**Migration Consistency:**
- [ ] Verify schema changes have migrations
  Command: ls -la shared/prisma/migrations/
  Check: Recent migrations correspond to module's schema needs

### 5. UI/UX QUALITY

**Responsive Design:**
- [ ] Check for mobile-responsive patterns
  Look for: Tailwind breakpoints (sm:, md:, lg:)
  Look for: Mobile-first approach

**Loading States:**
- [ ] Verify loading.tsx exists for async routes
  Check: Each async page has loading.tsx or Suspense wrapper

- [ ] Check for skeleton loaders
  Look for: Loading placeholders during data fetch

**Error Handling:**
- [ ] Verify error.tsx exists for error boundaries
  Check: Each route segment has error.tsx

- [ ] Check for try/catch in Server Actions
  Look for: Proper error handling and user-friendly messages

**Dark Mode Support:**
- [ ] Check for dark mode compatibility
  Look for: Hardcoded colors vs CSS variables
  Look for: var(--elevate-1), var(--elevate-2) usage

### 6. PERFORMANCE ISSUES

**Server Component Usage:**
- [ ] Verify Server Components by default
  Look for: Unnecessary 'use client' directives
  Check: Client components only when needed (interactivity)

**Bundle Size:**
- [ ] Check for large client-side imports
  Look for: Heavy libraries imported in client components
  Look for: Unnecessary dynamic imports

**Database Performance:**
- [ ] Check for expensive queries
  Look for: Complex aggregations without indexes
  Look for: Large data fetches without limits

### 7. COMMON BUG PATTERNS

**Missing Dependencies:**
- [ ] Check useEffect/useCallback dependencies
  Look for: ESLint exhaustive-deps warnings

**Race Conditions:**
- [ ] Check for proper async/await usage
  Look for: Missing await keywords
  Look for: Unhandled promise rejections

**Type Safety:**
- [ ] Check for 'any' types
  Command: grep -r ': any' app/real-estate/{module-path}/ lib/modules/{module-path}/ --include='*.ts' --include='*.tsx'
  Look for: Excessive use of 'any' (should use proper types)

**Memory Leaks:**
- [ ] Check for cleanup in useEffect
  Look for: Event listeners without cleanup
  Look for: Subscriptions without unsubscribe

---

## Review Report Format

Provide comprehensive review report:

## 🔍 INTEGRATION REVIEW REPORT

**Module:** {MODULE_NAME}
**Sessions Reviewed:** {SESSION_RANGE}
**Review Date:** {DATE}

### Executive Summary
- **Overall Quality:** [EXCELLENT | GOOD | FAIR | POOR]
- **Critical Issues:** {COUNT}
- **High Priority Issues:** {COUNT}
- **Medium Priority Issues:** {COUNT}
- **Low Priority Issues:** {COUNT}

---

### 🔴 CRITICAL ISSUES (Fix Immediately)

#### Issue #1: [Title]
- **Severity:** CRITICAL
- **Category:** [Security | Data Leak | Architecture Violation]
- **Location:** [Exact file path:line number]
- **Description:** [What's wrong]
- **Impact:** [Potential consequences]
- **Fix Required:**
  ```typescript
  // Current (WRONG):
  [problematic code]

  // Fix to:
  [corrected code]
  ```
- **Verification:** [How to verify fix]

[Repeat for each critical issue]

---

### 🟠 HIGH PRIORITY ISSUES (Fix Soon)

[Same format as critical, for high priority issues]

---

### 🟡 MEDIUM PRIORITY ISSUES (Should Fix)

[Same format, for medium priority issues]

---

### 🟢 LOW PRIORITY ISSUES (Nice to Have)

[Same format, for low priority issues]

---

### ✅ COMPLIANCE STATUS

#### Security Checklist
- [✅/❌] Multi-tenancy enforcement (organizationId filtering)
- [✅/❌] Dual-role RBAC checks
- [✅/❌] Input validation with Zod
- [✅/❌] Subscription tier enforcement
- [✅/❌] No exposed secrets
- [✅/❌] XSS prevention (if applicable)

#### Architecture Checklist
- [✅/❌] All files under 500 lines
- [✅/❌] Correct route structure (Industry > Module > Page)
- [✅/❌] Proper module organization
- [✅/❌] No cross-module imports
- [✅/❌] Components in correct directories

#### Code Quality Checklist
- [✅/❌] TypeScript: 0 errors
- [✅/❌] ESLint: 0 warnings
- [✅/❌] Tests: All passing
- [✅/❌] Build: Successful
- [✅/❌] Test coverage: ≥80%

#### Database Checklist
- [✅/❌] Uses local schema docs (not MCP list_tables)
- [✅/❌] All queries have organizationId filter
- [✅/❌] No N+1 query patterns
- [✅/❌] Pagination implemented for large datasets

#### UI/UX Checklist
- [✅/❌] Mobile responsive
- [✅/❌] Loading states implemented
- [✅/❌] Error boundaries in place
- [✅/❌] Dark mode support

---

### 📊 CODE QUALITY METRICS

**TypeScript Errors:** {COUNT}
**ESLint Warnings:** {COUNT}
**Test Coverage:** {PERCENTAGE}%
**Files >500 lines:** {COUNT}
**Security Violations:** {COUNT}
**RBAC Violations:** {COUNT}
**Missing organizationId filters:** {COUNT}

---

### 🎯 RECOMMENDED ACTION PLAN

#### Immediate Actions (Critical Issues)
1. [Specific fix for critical issue #1]
2. [Specific fix for critical issue #2]
...

#### Short-term Actions (High Priority)
1. [Specific fix for high priority issue #1]
2. [Specific fix for high priority issue #2]
...

#### Long-term Improvements (Medium/Low Priority)
1. [Improvement suggestion #1]
2. [Improvement suggestion #2]
...

---

### 📝 VERIFICATION COMMANDS

To verify fixes, run:
```bash
cd (platform)

# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Tests
npm test -- {module-path}

# Build
npm run build

# Security scan (organizationId filters)
grep -r 'prisma\\.' app/real-estate/{module-path}/ lib/modules/{module-path}/ | grep -v 'organizationId'
```

---

### 🔗 RELATED FILES

**Session Summaries:** [List paths if reviewed]
**Modified Files:** [List all files with issues found]
**Test Files:** [List test files that need updates]

---

**Review Completed By:** strive-agent-universal
**Next Review Recommended:** [After fixes applied / Before production deployment]
"

---

## STEP 3: REVIEW THE FINDINGS

After agent completes review:

1. **Prioritize Critical Issues**
   - Address all CRITICAL issues before continuing development
   - These are security/data leak vulnerabilities

2. **Plan Fix Sessions**
   - Create fix plan for high/medium priority issues
   - Estimate time needed for fixes

3. **Create Fix Task** (if issues found):

Task strive-agent-universal "
FIX ISSUES: {MODULE_NAME} Integration

Based on review report findings, fix the following issues:

## Critical Issues to Fix
1. [Issue from review report]
2. [Issue from review report]
...

## High Priority Issues to Fix
1. [Issue from review report]
2. [Issue from review report]
...

Requirements:
- Fix issues in order of severity (Critical → High → Medium)
- Verify each fix with relevant tests
- Ensure no regressions introduced
- Update tests if needed

Database:
- Read shared/prisma/SCHEMA-QUICK-REF.md for model reference

Security:
- Dual-role RBAC: Check BOTH GlobalRole AND OrganizationRole
- Multi-tenancy: Add organizationId filters to ALL queries
- Input validation: Add Zod schemas where missing

Verification (Include outputs):
- cd (platform)
- TypeScript: npx tsc --noEmit
- Linting: npm run lint
- Tests: npm test -- {module-path}
- Build: npm run build

Report Format:
## ✅ FIX REPORT

**Issues Fixed:** [Count]
**Files Modified:** [List with line counts]
**Verification Results:** [Command outputs]
**Remaining Issues:** [If any couldn't be fixed]
"
```

---

## 🎯 MODULES TO REVIEW

Use this prompt template for each integration module:

```bash
# Landing/Admin/Pricing/Onboarding
MODULE_NAME="Landing/Admin Integration"
MODULE_DIR="landing-onboard-price-admin"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="ADMIN role required"

# Main Dashboard
MODULE_NAME="Main Dashboard"
MODULE_DIR="main-dash"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="No tier restriction (all users)"

# AI Garage & Shop
MODULE_NAME="AI Garage & Shop"
MODULE_DIR="AI-Garage-&-shop"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="GROWTH tier minimum"

# CMS & Marketing
MODULE_NAME="CMS & Marketing Module"
MODULE_DIR="cms&marketing-module"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="STARTER tier minimum"

# Expenses & Taxes
MODULE_NAME="Expenses & Taxes Module"
MODULE_DIR="expenses-&-taxes-module"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="STARTER tier minimum"

# REI Dashboard
MODULE_NAME="REI Dashboard"
MODULE_DIR="REIDashboard"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="GROWTH tier minimum"

# Tool & Dashboard Marketplace
MODULE_NAME="Tool & Dashboard Marketplace"
MODULE_DIR="tool&dashboard-marketplace"
SESSION_RANGE="sessions 1-12"
TIER_REQUIREMENT="CUSTOM tier (pay-per-use)"
```

---

## 💡 REVIEW TIPS

**Focus Areas Based on Common Issues:**

1. **Multi-Tenancy** - Most common violation
   - Missing organizationId filters
   - Cross-organization data leaks

2. **RBAC** - Second most common
   - Only checking GlobalRole (missing OrganizationRole)
   - Missing permission checks in Server Actions

3. **File Sizes** - Frequent issue
   - Files exceeding 500 line limit
   - Need component extraction

4. **Input Validation** - Often missed
   - Server Actions without Zod validation
   - Direct FormData processing

5. **Subscription Tiers** - Sometimes forgotten
   - Missing tier checks for premium features

**Review Efficiency:**
- Start with security audit (most critical)
- Use grep commands to scan quickly
- Focus on Server Actions (highest risk)
- Check route files for RBAC patterns

**When to Review:**
- After completing multiple sessions
- Before merging to main branch
- Before production deployment
- When suspecting quality issues
- After team member handoff

---

**Version:** 1.0 - Integration Quality Review | Last Updated: 2025-10-06
