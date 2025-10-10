# Build Fix Execution Plan - Phased Strategy

**Generated:** 2025-10-10
**Project:** Strive Tech SaaS Platform (platform)
**Objective:** Fix all 1,676 build issues and achieve production-ready state

**Reference Documents:**
- Issue inventory: `BUILD-BLOCKERS-REPORT.md`
- Project standards: `CLAUDE.md`
- Agent patterns: `../.claude/agents/single-agent-usage-guide.md`

---

## 📊 CURRENT STATE

| Category | Count | Status |
|----------|-------|--------|
| Build-Blocking Errors | 1 | 🔴 CRITICAL |
| TypeScript Errors | 835 | 🔴 CRITICAL |
| ESLint Warnings | 840 | ⚠️ WARNING |
| **Total Issues** | **1,676** | **🔴 FAILING** |

---

## 🎯 SUCCESS CRITERIA

**Phase Completion Requirements:**
- ✅ All verification commands pass with zero errors
- ✅ Evidence provided (command outputs, not just "passed")
- ✅ No new errors introduced
- ✅ Agent provides EXECUTION REPORT with proof

**Final Success:**
```bash
npm run build     # ✅ SUCCESS
npx tsc --noEmit  # ✅ 0 errors
npm run lint      # ✅ 0 warnings
npm test          # ✅ 80%+ coverage
```

---

# PHASE 1: CRITICAL BUILD BLOCKERS

**Duration:** 30 minutes - 1 hour
**Goal:** Enable `npm run build` to succeed
**Blockers Fixed:** 1 build error + 15+ missing exports

## 1.1 Fix TemplateFilters Export (IMMEDIATE)

**Error:**
```
app/api/v1/ai-garage/templates/route.ts:7
Module '"@/lib/modules/ai-garage/templates"' has no exported member 'TemplateFilters'
```

**Files to Modify:**
- `lib/modules/ai-garage/templates/index.ts`

**Required Change:**
```typescript
// Add this export:
export type { TemplateFilters } from './queries';
```

**Verification:**
```bash
cd "(platform)"
npx tsc --noEmit | grep "TemplateFilters"  # Should return nothing
```

**Estimated Time:** 2 minutes

---

## 1.2 Fix Missing Module Exports

**Systematic fix for all missing exports identified in BUILD-BLOCKERS-REPORT.md**

### Issue 1: REID Reports - Missing generateMarketAnalysis

**Error:**
```
__tests__/lib/modules/reid/reports.test.ts:18
Module '@/lib/modules/reid/reports/generator' has no exported member 'generateMarketAnalysis'
```

**Investigation Required:**
1. Read `lib/modules/reid/reports/generator.ts` - Does function exist?
2. If exists: Add to exports
3. If not: Check if function was renamed or moved
4. Update test imports accordingly

**Files to Check:**
- `lib/modules/reid/reports/generator.ts`
- `lib/modules/reid/reports/index.ts`
- `__tests__/lib/modules/reid/reports.test.ts`

---

### Issue 2: Appointments Module - Missing schemas

**Error:**
```
__tests__/modules/appointments/schemas.test.ts:8
Cannot find module: '@/lib/modules/appointments/schemas'
```

**Investigation Required:**
1. Check if `lib/modules/appointments/` directory exists
2. Check if `schemas.ts` file exists in that directory
3. If missing: Create schemas file OR update test to use correct path

**Options:**
- **Option A:** Create `lib/modules/appointments/schemas.ts` with proper Zod schemas
- **Option B:** Update test path if schemas exist elsewhere
- **Option C:** Remove test if appointments module not implemented

**Files to Check:**
- `lib/modules/appointments/` (does directory exist?)
- `lib/modules/appointments/schemas.ts` (does file exist?)
- `__tests__/modules/appointments/schemas.test.ts`

---

### Issue 3: CRM Contact Schemas - Missing exports

**Error:**
```
__tests__/modules/contacts/schemas.test.ts:17
Cannot find module: '@/lib/modules/crm/contacts/schemas'
```

**Investigation Required:**
1. Check actual path: `lib/modules/crm/contacts/schemas.ts`
2. If exists: Verify exports
3. Update test import path if needed

**Files to Check:**
- `lib/modules/crm/contacts/schemas.ts`
- `lib/modules/crm/contacts/index.ts`
- `__tests__/modules/contacts/schemas.test.ts`

---

### Issue 4: CRM Lead Schemas - Missing exports

**Error:**
```
__tests__/modules/leads/schemas.test.ts:17
Cannot find module: '@/lib/modules/crm/leads/schemas'
```

**Investigation Required:**
1. Check actual path: `lib/modules/crm/leads/schemas.ts`
2. If exists: Verify exports
3. Update test import path if needed

**Files to Check:**
- `lib/modules/crm/leads/schemas.ts`
- `lib/modules/crm/leads/index.ts`
- `__tests__/modules/leads/schemas.test.ts`

---

### Issue 5: Expense Tax Component - Missing ExpenseKPIs

**Error:**
```
__tests__/components/real-estate/expense-tax/ExpenseKPIs.test.tsx:9
Cannot find module: '@/components/real-estate/expense-tax/expense-tax-dashboard/ExpenseKPIs'
```

**Investigation Required:**
1. Find actual location of ExpenseKPIs component
2. Check if component exists at: `components/real-estate/expense-tax/expense-tax-dashboard/ExpenseKPIs.tsx`
3. Update test import or create component

**Files to Check:**
- `components/real-estate/expense-tax/` (directory structure)
- Component file location
- `__tests__/components/real-estate/expense-tax/ExpenseKPIs.test.tsx`

---

### Issue 6: API Routes - Missing POST Exports

**Error:**
```
__tests__/api/v1/reid/alerts.test.ts:6
Module '@/app/api/v1/reid/alerts/route' has no exported member 'POST'
```

**Investigation Required:**
1. Check if `app/api/v1/reid/alerts/route.ts` exists
2. Verify POST handler is defined and exported
3. Export pattern should be: `export async function POST(...) { }`

**Files to Check:**
- `app/api/v1/reid/alerts/route.ts`
- `__tests__/api/v1/reid/alerts.test.ts`

---

## 1.3 Agent Task Prompt - Phase 1

```bash
Task strive-agent-universal "
PHASE 1: Fix Critical Build Blockers in (platform)

DO NOT PROCEED to other phases. Focus ONLY on these specific issues.

Objective: Enable npm run build to succeed

Tasks (in order):

1. Fix TemplateFilters Export (IMMEDIATE)
   - File: lib/modules/ai-garage/templates/index.ts
   - Add: export type { TemplateFilters } from './queries';
   - Verify: npx tsc --noEmit | grep 'TemplateFilters' (should return nothing)

2. Fix Missing Module Exports (Systematic Investigation)

   For EACH issue below:
   a) Investigate actual file location and structure
   b) Determine root cause (missing export vs wrong path vs missing file)
   c) Apply appropriate fix
   d) Verify fix with TypeScript check

   Issues to fix:
   - REID Reports: generateMarketAnalysis export
   - Appointments: schemas module
   - CRM Contacts: schemas module
   - CRM Leads: schemas module
   - Expense Tax: ExpenseKPIs component path
   - API Routes: POST handler exports for reid/alerts

3. Verification (REQUIRED - DO NOT REPORT SUCCESS WITHOUT THIS)

   Run these commands and include FULL OUTPUT in your report:

   cd \"(platform)\"

   # Check for remaining module errors
   npx tsc --noEmit 2>&1 | grep -E \"Cannot find module|has no exported member\"
   # Expected: Should show FEWER errors than before (track progress)

   # Try build (may still fail on other TypeScript errors, that's okay)
   npm run build 2>&1 | head -50
   # Expected: Should NOT fail on TemplateFilters or missing exports

   # Count remaining TypeScript errors
   npx tsc --noEmit 2>&1 | grep \"error TS\" | wc -l
   # Expected: Should be less than 835 (starting count)

Blocking Requirements:
- DO NOT report success unless ALL 6 missing export issues are investigated
- DO NOT skip verification commands
- DO NOT proceed to Phase 2 (this is explicitly out of scope)
- DO provide evidence: Command outputs, not 'passed'

Success Criteria:
- TemplateFilters error: GONE ✅
- Missing export errors: All investigated and fixed/documented ✅
- Build progresses further (even if other TS errors remain) ✅
- EXECUTION REPORT with full command outputs provided ✅

Return Format:
## ✅ EXECUTION REPORT - PHASE 1

**Files Modified:** [list with line counts]

**Issues Fixed:**
1. TemplateFilters: ✅ FIXED
2. REID Reports: ✅ FIXED / ❌ BLOCKED (explain)
3. Appointments: ✅ FIXED / ❌ BLOCKED (explain)
4. CRM Contacts: ✅ FIXED / ❌ BLOCKED (explain)
5. CRM Leads: ✅ FIXED / ❌ BLOCKED (explain)
6. Expense Tax: ✅ FIXED / ❌ BLOCKED (explain)
7. API Routes: ✅ FIXED / ❌ BLOCKED (explain)

**Verification Results:**
[Paste FULL command outputs here]

**Issues Remaining:** [number] TypeScript errors (down from 835)
**Next Phase Ready:** YES / NO (explain blockers if NO)
"
```

---

## 1.4 Expected Outcomes - Phase 1

**Success Indicators:**
- ✅ TemplateFilters export error eliminated
- ✅ 7-15 TypeScript errors resolved
- ✅ Build progresses past import resolution stage
- ✅ Clear documentation of any blockers found

**Remaining After Phase 1:**
- ~820-828 TypeScript errors (mostly test mocking)
- 840 ESLint warnings (untouched)
- Build may still fail on type errors (expected)

**Ready for Phase 2 When:**
- All missing exports are either fixed or documented as blockers
- No "Cannot find module" errors in verification output
- Agent provides complete EXECUTION REPORT with proof

---

# PHASE 2: TEST INFRASTRUCTURE

**Duration:** 2-3 hours
**Goal:** Fix Jest mocking type errors systematically
**Blockers Fixed:** 600+ test mocking errors

## 2.1 Problem Analysis

**Root Cause:**
Jest mock functions not properly typed, causing:
```typescript
// Error: Property 'mockResolvedValue' does not exist
(getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
```

**Affected Test Files (20+):**
- `__tests__/modules/contacts/actions.test.ts` (80+ errors)
- `__tests__/modules/leads/actions.test.ts` (60+ errors)
- `__tests__/modules/marketplace/*.test.ts` (100+ errors)
- `__tests__/lib/modules/reid/*.test.ts` (150+ errors)
- `__tests__/modules/deals/actions.test.ts`
- `__tests__/modules/customers/actions.test.ts`
- All CRM module tests
- All REID module tests
- All marketplace tests

**Pattern to Fix:**
```typescript
// ❌ Current (fails):
(getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

// ✅ Option 1 - Proper typing:
import { mocked } from 'jest-mock';
const mockedGetCurrentUser = mocked(getCurrentUser);
mockedGetCurrentUser.mockResolvedValue(mockUser);

// ✅ Option 2 - Type assertion:
(getCurrentUser as jest.MockedFunction<typeof getCurrentUser>).mockResolvedValue(mockUser);

// ✅ Option 3 - Setup in beforeEach:
jest.mock('@/lib/auth/auth-helpers');
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
```

---

## 2.2 Fix Strategy

**Approach: Systematic Pattern Replacement**

### Step 1: Verify Jest Configuration

**Check Files:**
- `jest.config.js` or `jest.config.ts`
- `package.json` (jest section)
- `__tests__/setup.ts` or `jest.setup.ts`

**Required Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // ... other config
};
```

**Required Dependencies:**
```json
{
  "@types/jest": "^29.x.x",
  "jest": "^29.x.x",
  "ts-jest": "^29.x.x"
}
```

---

### Step 2: Create Mock Helper Utilities

**Create: `__tests__/helpers/mock-helpers.ts`**

```typescript
import { mocked } from 'jest-mock';

/**
 * Type-safe mock helper for async functions
 */
export function mockAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

/**
 * Type-safe mock helper for sync functions
 */
export function mockFunction<T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

/**
 * Setup common auth mocks
 */
export function setupAuthMocks() {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    organizationId: 'test-org-id',
    globalRole: 'USER',
    organizationRole: 'ADMIN',
  };

  const { getCurrentUser, requireAuth } = require('@/lib/auth/auth-helpers');

  mockAsyncFunction(getCurrentUser).mockResolvedValue(mockUser);
  mockAsyncFunction(requireAuth).mockResolvedValue({ user: mockUser });

  return { mockUser };
}
```

**Benefits:**
- Type-safe mocking utilities
- Reusable across all test files
- Reduces duplication
- Easier to maintain

---

### Step 3: Fix Test Files by Category

**Category A: CRM Module Tests (High Priority)**

Files to fix:
1. `__tests__/modules/contacts/actions.test.ts` (80+ errors)
2. `__tests__/modules/leads/actions.test.ts` (60+ errors)
3. `__tests__/modules/deals/actions.test.ts`
4. `__tests__/modules/customers/actions.test.ts`

Pattern to apply:
```typescript
// At top of file
import { mockAsyncFunction, setupAuthMocks } from '../helpers/mock-helpers';

// Mock declarations
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma');

describe('Contacts Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(); // Use helper
  });

  it('should create contact', async () => {
    const { prisma } = require('@/lib/database/prisma');

    mockAsyncFunction(prisma.contact.create).mockResolvedValue(mockContact);

    const result = await createContact(contactData);
    expect(result).toEqual(mockContact);
  });
});
```

---

**Category B: REID Module Tests (High Priority)**

Files to fix:
1. `__tests__/lib/modules/reid/alerts.test.ts` (150+ errors)
2. `__tests__/lib/modules/reid/reports.test.ts`
3. `__tests__/lib/modules/reid/*.test.ts` (all files)

Special considerations:
- REID module may have complex data structures
- May need additional type imports from module
- Verify module structure matches test expectations

---

**Category C: Marketplace Tests (Medium Priority)**

Files to fix:
1. `__tests__/modules/marketplace/*.test.ts` (100+ errors)

Pattern considerations:
- Marketplace uses enums (BundleType, ToolTier) - verify enum imports
- Check for type assignment errors in mock data
- Validate enum values match schema

---

**Category D: Other Module Tests (Medium Priority)**

Files to fix:
1. Integration tests
2. Component tests with async operations
3. API route tests

---

### Step 4: Verification Pattern

**After fixing each category:**

```bash
# Check specific test file
npx tsc --noEmit __tests__/modules/contacts/actions.test.ts

# Run specific test to verify mocks work
npm test -- __tests__/modules/contacts/actions.test.ts

# Check remaining errors in category
npx tsc --noEmit 2>&1 | grep "__tests__/modules/contacts" | wc -l
```

---

## 2.3 Agent Task Prompt - Phase 2

```bash
Task strive-agent-universal "
PHASE 2: Fix Test Infrastructure and Mocking in (platform)

Prerequisites:
- Phase 1 must be complete (build blockers resolved)
- Verify Phase 1 completion before starting

Objective: Fix 600+ Jest mocking type errors systematically

Tasks (in order):

1. Verify Jest Configuration
   - Read jest.config.js or jest.config.ts
   - Verify @types/jest, jest, ts-jest are in package.json
   - Check jest.setup.ts exists and is configured
   - Document any configuration issues

2. Create Mock Helper Utilities
   - Create: __tests__/helpers/mock-helpers.ts
   - Include: mockAsyncFunction, mockFunction, setupAuthMocks
   - Add proper TypeScript types
   - Test helper with one simple test file

3. Fix Test Files by Category (DO EACH CATEGORY IN ORDER)

   Category A: CRM Module Tests (DO FIRST)
   Files:
   - __tests__/modules/contacts/actions.test.ts
   - __tests__/modules/leads/actions.test.ts
   - __tests__/modules/deals/actions.test.ts
   - __tests__/modules/customers/actions.test.ts

   For each file:
   a) Read file to understand current mocking patterns
   b) Replace all mock assertions with proper types
   c) Use mock-helpers where applicable
   d) Verify: npx tsc --noEmit [filename]
   e) Verify: npm test -- [filename]

   Category B: REID Module Tests (DO SECOND)
   Files:
   - __tests__/lib/modules/reid/alerts.test.ts
   - __tests__/lib/modules/reid/reports.test.ts
   - All other REID test files

   Apply same pattern as Category A.

   Category C: Marketplace Tests (DO THIRD)
   Files:
   - __tests__/modules/marketplace/*.test.ts (all files)

   Apply same pattern, verify enum imports.

   Category D: Remaining Tests (DO FOURTH)
   - Any other test files with mocking errors
   - Integration tests
   - API route tests

4. Verification (REQUIRED - DO NOT REPORT SUCCESS WITHOUT THIS)

   After fixing ALL categories:

   cd \"(platform)\"

   # Count remaining mocking errors
   npx tsc --noEmit 2>&1 | grep \"mockResolvedValue\\|mockReturnValue\" | wc -l
   # Expected: 0 (all mocking errors resolved)

   # Count total TypeScript errors remaining
   npx tsc --noEmit 2>&1 | grep \"error TS\" | wc -l
   # Expected: ~200-235 (down from ~820, mocking errors eliminated)

   # Try running all tests
   npm test 2>&1 | tail -20
   # Expected: Tests may fail on logic, but NOT on type errors

Blocking Requirements:
- DO NOT skip categories - fix in order (A, B, C, D)
- DO NOT report category complete without running verification for that category
- DO NOT proceed if helper utilities don't work
- DO provide per-category progress updates
- DO include full command outputs in report

Success Criteria:
- Mock helper utilities created and working ✅
- Category A (CRM tests): All mocking errors fixed ✅
- Category B (REID tests): All mocking errors fixed ✅
- Category C (Marketplace tests): All mocking errors fixed ✅
- Category D (Other tests): All mocking errors fixed ✅
- TypeScript errors reduced from ~820 to ~235 ✅
- EXECUTION REPORT with evidence provided ✅

Return Format:
## ✅ EXECUTION REPORT - PHASE 2

**Files Created:**
- __tests__/helpers/mock-helpers.ts (lines)

**Files Modified:**
[List all test files modified with before/after error counts]

**Category Results:**
- Category A (CRM): ✅ [X] files fixed, [Y] errors eliminated
- Category B (REID): ✅ [X] files fixed, [Y] errors eliminated
- Category C (Marketplace): ✅ [X] files fixed, [Y] errors eliminated
- Category D (Other): ✅ [X] files fixed, [Y] errors eliminated

**Verification Results:**
[Paste FULL command outputs here]

**TypeScript Errors:**
- Before Phase 2: 820-828 errors
- After Phase 2: [X] errors (~235 expected)
- Reduction: [Y] errors eliminated (~585 expected)

**Issues Remaining:** [number] non-mocking TypeScript errors
**Next Phase Ready:** YES / NO (explain blockers if NO)
"
```

---

## 2.4 Expected Outcomes - Phase 2

**Success Indicators:**
- ✅ All mocking errors eliminated (600+ errors resolved)
- ✅ Mock helper utilities created and reusable
- ✅ Tests compile without type errors
- ✅ TypeScript error count reduced to ~235

**Remaining After Phase 2:**
- ~235 TypeScript errors (type assignments, implicit any, signatures)
- 840 ESLint warnings (untouched)
- Tests may fail on logic but NOT on types

**Ready for Phase 3 When:**
- Zero "mockResolvedValue" or "mockReturnValue" type errors
- All test files compile with TypeScript
- Agent provides category-by-category verification
- Clear path to fix remaining ~235 errors

---

# PHASE 3: TYPE SYSTEM CLEANUP

**Duration:** 4-6 hours
**Goal:** Fix remaining TypeScript errors (~235 expected)
**Blockers Fixed:** Type assignments, implicit any, function signatures

## 3.1 Problem Analysis

**Remaining Error Categories (after Phase 2):**

### Category 1: Type Assignment Errors (~50 errors)
**Pattern:** `Type 'X' is not assignable to type 'Y'`

Examples:
- Missing required fields in object creation
- Enum value mismatches
- Incorrect argument types

### Category 2: Implicit 'any' Types (~50 errors)
**Pattern:** `Parameter implicitly has an 'any' type`

Examples:
- Function parameters without type annotations
- Callback parameters in array methods
- Event handler parameters

### Category 3: Function Signature Mismatches (~30 errors)
**Pattern:** `Expected N arguments, but got M`

Examples:
- Extra arguments passed to functions
- Missing required arguments
- Optional parameter confusion

### Category 4: Miscellaneous (~100+ errors)
**Pattern:** Various TypeScript errors

Examples:
- Property access on potentially undefined
- Type narrowing issues
- Generic type inference failures

---

## 3.2 Fix Strategy - Categorized Approach

### 3.2.1 Fix Type Assignment Errors

**High-Priority Files:**

#### File 1: `__tests__/integration/crm-workflow.test.ts:319`
**Error:** Missing required field 'name' in customer creation

```typescript
// ❌ Current:
const customer = await createCustomer({
  email: 'test@example.com',
  organizationId: 'test-org',
  // Missing: name (required)
});

// ✅ Fix:
const customer = await createCustomer({
  name: 'Test Customer',  // Add required field
  email: 'test@example.com',
  organizationId: 'test-org',
});
```

**Verification:**
```bash
npx tsc --noEmit __tests__/integration/crm-workflow.test.ts
npm test -- __tests__/integration/crm-workflow.test.ts
```

---

#### File 2: `__tests__/lib/modules/reid/alerts.test.ts:42`
**Error:** Argument type mismatch for user parameter

```typescript
// Investigation needed:
// 1. Read function signature for alert creation
// 2. Read test to understand what's being passed
// 3. Align test data with function signature
```

**Files to read:**
- `lib/modules/reid/alerts/actions.ts` (function signature)
- `__tests__/lib/modules/reid/alerts.test.ts` (test data)

---

#### File 3: `__tests__/modules/marketplace/bundles.test.ts:110-122`
**Error:** Invalid enum values

```typescript
// ❌ Current:
const bundle = {
  type: BundleType.CRM,       // Doesn't exist
  tier: ToolTier.STARTER,     // Doesn't exist
};

// ✅ Fix: First check actual enum values
// Read: lib/types/ or prisma/schema.prisma for correct enums
```

**Investigation Steps:**
1. Search for enum definitions: `BundleType`, `ToolTier`
2. Use local schema docs (99% token savings!):
   ```bash
   # DON'T use MCP list_tables (18k tokens)
   # DO read local docs (500 tokens):
   cat prisma/SCHEMA-ENUMS.md | grep -A 10 "BundleType\\|ToolTier"
   ```
3. Update test with correct enum values
4. Verify with TypeScript check

---

### 3.2.2 Fix Implicit 'any' Types

**Pattern: Add explicit type annotations**

#### File 1: `__tests__/database/tenant-isolation.test.ts:46`
**Error:** Parameter 'customer' implicitly has an 'any' type

```typescript
// ❌ Current:
customers.forEach(customer => {
  expect(customer.organizationId).toBe(orgId);
});

// ✅ Fix:
import type { Customer } from '@prisma/client';

customers.forEach((customer: Customer) => {
  expect(customer.organizationId).toBe(orgId);
});
```

---

#### File 2: `__tests__/lib/modules/content/analytics.test.ts:139`
**Error:** Parameter 'item' implicitly has an 'any' type

```typescript
// ❌ Current:
const total = items.reduce((sum, item) => sum + item.count, 0);

// ✅ Fix:
type ContentItem = { count: number; [key: string]: any };
const total = items.reduce((sum: number, item: ContentItem) => sum + item.count, 0);
```

---

#### File 3: `__tests__/lib/modules/reid/alerts.test.ts:398`
**Error:** Parameter 'args' implicitly has an 'any' type

```typescript
// Investigation needed:
// 1. Understand context of 'args' usage
// 2. Determine appropriate type
// 3. Add type annotation

// Common patterns:
// - Rest parameters: (...args: unknown[])
// - Function arguments: (args: { [key: string]: unknown })
// - Specific type: (args: AlertArgs) - define AlertArgs interface
```

---

### 3.2.3 Fix Function Signature Mismatches

**Pattern: Align function calls with signatures**

#### File 1: `__tests__/lib/modules/reid/alerts.test.ts:342`
**Error:** Expected 0 arguments, but got 1

```typescript
// Investigation needed:
// 1. Read function definition to see signature
// 2. Check if function was refactored
// 3. Update test to match current signature
```

**Files to read:**
- Function definition file
- Test file with error
- Check git history if signature recently changed

---

### 3.2.4 Systematic File-by-File Approach

**Create a checklist of all remaining error files:**

```typescript
interface ErrorFile {
  path: string;
  errorCount: number;
  category: 'assignment' | 'implicit-any' | 'signature' | 'misc';
  priority: 'high' | 'medium' | 'low';
}

// Agent should:
// 1. Generate complete list from tsc output
// 2. Categorize each file
// 3. Prioritize high-error-count files first
// 4. Fix systematically (one category at a time)
// 5. Verify after each file
```

---

## 3.3 Agent Task Prompt - Phase 3

```bash
Task strive-agent-universal "
PHASE 3: Type System Cleanup in (platform)

Prerequisites:
- Phase 2 must be complete (mocking errors resolved)
- Verify current TypeScript error count is ~235 before starting

Objective: Fix all remaining TypeScript errors (~235 expected)

Tasks (in order):

1. Generate Error Inventory

   cd \"(platform)\"

   # Generate complete TypeScript error list
   npx tsc --noEmit 2>&1 > /tmp/ts-errors.txt

   # Analyze and categorize
   # - Count errors by file
   # - Identify error patterns
   # - Prioritize by impact (high error count = high priority)

   Create systematic fix plan based on actual errors found.

2. Fix Type Assignment Errors (Category 1)

   High-priority files identified in BUILD-FIX-PHASES.md:
   - __tests__/integration/crm-workflow.test.ts:319 (missing 'name' field)
   - __tests__/lib/modules/reid/alerts.test.ts:42 (user parameter type)
   - __tests__/modules/marketplace/bundles.test.ts:110-122 (enum values)

   For marketplace enum issue:
   - ❌ DO NOT use MCP list_tables (18k token waste!)
   - ✅ DO read: prisma/SCHEMA-ENUMS.md (500 tokens)
   - Find correct BundleType and ToolTier enum values
   - Update test with correct values

   For each file:
   a) Read file and understand context
   b) Identify root cause
   c) Apply fix with minimal changes
   d) Verify: npx tsc --noEmit [filename]
   e) Document fix in report

3. Fix Implicit 'any' Types (Category 2)

   High-priority files:
   - __tests__/database/tenant-isolation.test.ts:46 (customer parameter)
   - __tests__/lib/modules/content/analytics.test.ts:139 (item parameter)
   - __tests__/lib/modules/reid/alerts.test.ts:398 (args parameter)

   Pattern to apply:
   - Import necessary types from '@prisma/client' or define inline
   - Add explicit type annotations
   - Prefer specific types over 'unknown' or 'any'

   For each file:
   a) Read file and identify implicit any locations
   b) Determine appropriate type
   c) Add type annotation
   d) Verify: npx tsc --noEmit [filename]

4. Fix Function Signature Mismatches (Category 3)

   High-priority files:
   - __tests__/lib/modules/reid/alerts.test.ts:342 (argument count mismatch)
   - Any document version tests with incorrect indexing

   Investigation pattern:
   a) Read function definition to confirm signature
   b) Read test to see what's being passed
   c) Align test with actual function signature
   d) Check if function was recently refactored (git blame if needed)
   e) Verify: npx tsc --noEmit [filename]

5. Fix Remaining Errors (Category 4)

   - Work through error inventory systematically
   - Prioritize files with highest error counts
   - Group similar errors together
   - Apply consistent patterns

   For each file:
   a) Read and understand error context
   b) Apply minimal, targeted fix
   c) Verify immediately
   d) Track progress

6. Verification (REQUIRED - DO NOT REPORT SUCCESS WITHOUT THIS)

   After fixing ALL categories:

   cd \"(platform)\"

   # Final TypeScript check
   npx tsc --noEmit
   # Expected: 0 errors ✅

   # If errors remain, count and categorize
   npx tsc --noEmit 2>&1 | grep \"error TS\" | wc -l
   # Expected: 0

   # Verify tests still pass
   npm test 2>&1 | tail -30
   # Expected: Tests pass (or fail on logic, not types)

   # Try build
   npm run build
   # Expected: May fail on ESLint warnings, but NOT on TypeScript

Blocking Requirements:
- DO NOT skip error investigation - understand root cause before fixing
- DO NOT use 'any' types as quick fix - find proper types
- DO NOT use MCP list_tables - use prisma/SCHEMA-*.md files (99% token savings!)
- DO provide per-category progress in report
- DO include verification output for each category
- DO NOT report success if TypeScript errors remain

Success Criteria:
- All type assignment errors fixed ✅
- All implicit any parameters typed ✅
- All function signature mismatches resolved ✅
- TypeScript compiles with 0 errors ✅
- Tests compile successfully ✅
- EXECUTION REPORT with full verification provided ✅

Return Format:
## ✅ EXECUTION REPORT - PHASE 3

**Error Inventory:**
- Starting TypeScript errors: [X] (expected ~235)
- Ending TypeScript errors: 0 ✅

**Category 1: Type Assignment Errors**
Files fixed:
- [filename]: [error description] → ✅ FIXED
- [filename]: [error description] → ✅ FIXED
Total: [X] files, [Y] errors eliminated

**Category 2: Implicit 'any' Types**
Files fixed:
- [filename]: [parameter] typed as [Type] → ✅ FIXED
- [filename]: [parameter] typed as [Type] → ✅ FIXED
Total: [X] files, [Y] errors eliminated

**Category 3: Function Signature Mismatches**
Files fixed:
- [filename]: [description] → ✅ FIXED
Total: [X] files, [Y] errors eliminated

**Category 4: Miscellaneous Errors**
Files fixed:
- [filename]: [error type] → ✅ FIXED
Total: [X] files, [Y] errors eliminated

**Verification Results:**
[Paste FULL command outputs here]

**Build Status:**
- TypeScript: ✅ 0 errors
- Tests: ✅ Compile successfully
- npm run build: [status] (may fail on ESLint, that's Phase 4)

**Next Phase Ready:** YES / NO (explain blockers if NO)
"
```

---

## 3.4 Expected Outcomes - Phase 3

**Success Indicators:**
- ✅ TypeScript compiles with 0 errors
- ✅ All ~235 remaining errors resolved
- ✅ Tests compile and can be run
- ✅ No 'any' types introduced as quick fixes

**Remaining After Phase 3:**
- 840 ESLint warnings (next phase)
- Build may fail on ESLint warnings (expected)
- Production blockers still present (Phase 5)

**Ready for Phase 4 When:**
- `npx tsc --noEmit` returns 0 errors
- All test files compile successfully
- Agent provides complete error-by-error report
- No type-related build failures

---

# PHASE 4: CODE QUALITY (ESLint Cleanup)

**Duration:** 6-8 hours
**Goal:** Eliminate all 840 ESLint warnings
**Blockers Fixed:** 291 explicit any, 200+ unused vars, 1 img element

## 4.1 Problem Analysis

**ESLint Warning Categories:**

### Category 1: Explicit 'any' Types (291 warnings)
**Rule:** `@typescript-eslint/no-explicit-any`
**Status:** Changed from ERROR to WARN on 2025-10-07
**Note:** MUST be fixed before production deployment

**Major Offenders:**
- `app/api/webhooks/stripe/route.ts` (11 instances)
- `app/real-estate/crm/leads/[id]/page.tsx` (8 instances)
- `lib/services/rag-service.ts` (5 instances)
- `lib/performance/dynamic-imports.tsx` (4 instances)
- `app/api/v1/**/*.ts` (100+ instances across API routes)

**Fix Strategies:**
1. **Stripe webhooks:** Use `Stripe.Event` type
2. **API routes:** Use Next.js `NextRequest`, `NextResponse` types
3. **RAG service:** Define proper types for AI responses
4. **Dynamic imports:** Use `React.ComponentType<Props>` pattern

---

### Category 2: Unused Variables (200+ warnings)
**Rule:** `@typescript-eslint/no-unused-vars`

**Patterns:**
- Unused imports
- Unused destructured parameters
- Variables assigned but never read
- Underscore prefix convention ignored

**Examples:**
- `app/(auth)/login/page.tsx:104` - `_confirmPassword`
- `app/real-estate/crm/leads/page.tsx:5` - `getLeadsCount`
- `lib/pdf-generator.ts:9-10` - `setPDFOpacity`, `resetPDFOpacity`

**Fix Strategies:**
1. Remove genuinely unused code
2. Use underscore prefix: `_variableName` (ESLint convention)
3. Check if "unused" code is actually needed

---

### Category 3: Next.js Image Optimization (1 warning)
**Rule:** `@next/next/no-img-element`

**Issue:** Using `<img>` instead of Next.js `<Image />` component

**Fix:**
```typescript
// ❌ Current:
<img src="/logo.png" alt="Logo" />

// ✅ Fix:
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={100} />
```

---

## 4.2 Fix Strategy - Systematic Approach

### 4.2.1 Fix Explicit 'any' Types (High Priority)

**Approach: File-by-File Replacement**

#### Sub-Phase 4.2.1a: API Routes (100+ warnings)

**Pattern for API routes:**
```typescript
// ❌ Current:
export async function POST(request: any) {
  const body: any = await request.json();
  // ...
}

// ✅ Fix:
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define expected fields
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = RequestSchema.parse(body);
  // ...
  return NextResponse.json({ success: true });
}
```

**Files to fix (systematic approach):**
- `app/api/v1/ai-garage/**/*.ts` (all route files)
- `app/api/v1/leads/route.ts`
- `app/api/v1/onboarding/payment-intent/route.ts`
- All other API routes with 'any' types

**Verification per file:**
```bash
# Check specific file
npm run lint -- app/api/v1/leads/route.ts

# Count remaining 'any' in API routes
npm run lint 2>&1 | grep "app/api/v1" | grep "no-explicit-any" | wc -l
```

---

#### Sub-Phase 4.2.1b: Stripe Webhooks (11 warnings)

**File:** `app/api/webhooks/stripe/route.ts`

**Pattern:**
```typescript
// ❌ Current:
function handleEvent(event: any) {
  // ...
}

// ✅ Fix:
import Stripe from 'stripe';

function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  // ...
}

function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  // ...
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event);
      break;
    // ...
  }

  return NextResponse.json({ received: true });
}
```

---

#### Sub-Phase 4.2.1c: CRM Pages (8 warnings)

**File:** `app/real-estate/crm/leads/[id]/page.tsx`

**Common patterns:**
- Props with 'any'
- Event handlers with 'any'
- State with 'any'

**Fix pattern:**
```typescript
// ❌ Current:
function handleSubmit(data: any) {
  // ...
}

// ✅ Fix:
import type { Lead } from '@prisma/client';

type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;

function handleSubmit(data: LeadFormData) {
  // ...
}
```

---

#### Sub-Phase 4.2.1d: RAG Service (5 warnings)

**File:** `lib/services/rag-service.ts`

**Pattern:**
```typescript
// ❌ Current:
async function processResponse(response: any): Promise<any> {
  // ...
}

// ✅ Fix:
interface AIResponse {
  content: string;
  role: 'assistant' | 'user' | 'system';
  metadata?: {
    model: string;
    tokens: number;
  };
}

interface ProcessedResponse {
  text: string;
  sources: string[];
  confidence: number;
}

async function processResponse(response: AIResponse): Promise<ProcessedResponse> {
  // ...
}
```

---

#### Sub-Phase 4.2.1e: Dynamic Imports (4 warnings)

**File:** `lib/performance/dynamic-imports.tsx`

**Pattern:**
```typescript
// ❌ Current:
const Component: any = dynamic(() => import('./Component'));

// ✅ Fix:
import dynamic from 'next/dynamic';
import type { ComponentProps } from './Component';

const Component = dynamic<ComponentProps>(() => import('./Component'));
```

---

### 4.2.2 Fix Unused Variables (Medium Priority)

**Approach: Categorize and Fix**

#### Sub-Phase 4.2.2a: Unused Imports

**Pattern:**
```typescript
// ❌ Current:
import { Button, Card, Modal } from '@/components/ui';
// Only Button is used

// ✅ Fix:
import { Button } from '@/components/ui';
```

**Automated detection:**
```bash
# Find all unused import warnings
npm run lint 2>&1 | grep "is defined but never used" | grep "import"
```

---

#### Sub-Phase 4.2.2b: Unused Parameters

**Pattern:**
```typescript
// ❌ Current:
function handler(request: Request, response: Response) {
  // response is never used
  return request.json();
}

// ✅ Option 1 - Remove if truly unused:
function handler(request: Request) {
  return request.json();
}

// ✅ Option 2 - Prefix with underscore if needed for signature:
function handler(request: Request, _response: Response) {
  return request.json();
}
```

---

#### Sub-Phase 4.2.2c: Unused Variables

**Pattern:**
```typescript
// ❌ Current:
const user = await getCurrentUser();
const orgId = user.organizationId;
// orgId is assigned but never used

// ✅ Fix - Remove if not needed:
const user = await getCurrentUser();
// Use user directly where needed
```

---

### 4.2.3 Fix Next.js Image Warning (Quick Win)

**Find the offending img element:**
```bash
# Search for <img> tags
grep -r "<img" app/ components/ --include="*.tsx" --include="*.jsx"
```

**Apply fix:**
```typescript
// ❌ Before:
<img src="/logo.png" alt="Logo" className="w-32 h-32" />

// ✅ After:
import Image from 'next/image';
<Image
  src="/logo.png"
  alt="Logo"
  width={128}
  height={128}
  className="w-32 h-32"
/>
```

---

## 4.3 Agent Task Prompt - Phase 4

```bash
Task strive-agent-universal "
PHASE 4: ESLint Code Quality Cleanup in (platform)

Prerequisites:
- Phase 3 must be complete (TypeScript 0 errors)
- Verify: npx tsc --noEmit (should pass) before starting

Objective: Eliminate all 840 ESLint warnings

Tasks (in order):

1. Generate ESLint Warning Inventory

   cd \"(platform)\"

   # Generate complete warning list
   npm run lint 2>&1 > /tmp/eslint-warnings.txt

   # Categorize warnings:
   # - Count @typescript-eslint/no-explicit-any (expected ~291)
   # - Count @typescript-eslint/no-unused-vars (expected ~200)
   # - Count @next/next/no-img-element (expected ~1)
   # - Other warnings (expected ~348)

   Create systematic fix plan based on actual warnings.

2. Fix Explicit 'any' Types (Category 1 - HIGH PRIORITY)

   Sub-category order (fix in this order):

   A. API Routes (~100 warnings)
      - Use NextRequest, NextResponse types
      - Define Zod schemas for request bodies
      - Type all route handlers properly

      Files pattern: app/api/v1/**/*.ts

      For each file:
      a) Read file
      b) Identify all 'any' usages
      c) Replace with proper types (NextRequest, validated schemas, etc.)
      d) Verify: npm run lint -- [filename]

   B. Stripe Webhooks (11 warnings)
      - File: app/api/webhooks/stripe/route.ts
      - Use: Stripe.Event, Stripe.Subscription, Stripe.Invoice types
      - Pattern: Type event handlers individually
      - Verify: npm run lint -- app/api/webhooks/stripe/route.ts

   C. CRM Pages (8 warnings)
      - File: app/real-estate/crm/leads/[id]/page.tsx
      - Use: Types from @prisma/client
      - Define form data types
      - Verify: npm run lint -- [filename]

   D. RAG Service (5 warnings)
      - File: lib/services/rag-service.ts
      - Define: AIResponse, ProcessedResponse interfaces
      - Type all AI-related functions
      - Verify: npm run lint -- lib/services/rag-service.ts

   E. Dynamic Imports (4 warnings)
      - File: lib/performance/dynamic-imports.tsx
      - Use: React.ComponentType<Props> pattern
      - Verify: npm run lint -- lib/performance/dynamic-imports.tsx

   F. Remaining 'any' types (~163 warnings)
      - Work through files systematically
      - Prioritize by warning count per file
      - Apply appropriate types based on context

3. Fix Unused Variables (Category 2 - MEDIUM PRIORITY)

   Sub-categories:

   A. Unused Imports
      - Find: npm run lint 2>&1 | grep \"is defined but never used\" | grep \"import\"
      - Remove unused imports entirely
      - Verify after each file

   B. Unused Parameters
      - Pattern: Prefix with underscore if needed for signature
      - Or remove if truly unnecessary
      - Examples: _confirmPassword, _response, etc.

   C. Unused Variables
      - Review each case: Is it really unused or needed later?
      - Remove dead code
      - Clean up after refactoring

   Files to prioritize:
   - app/(auth)/login/page.tsx (line 104)
   - app/real-estate/crm/leads/page.tsx (line 5)
   - lib/pdf-generator.ts (lines 9-10)
   - All others from warning list

4. Fix Next.js Image Warning (Category 3 - QUICK WIN)

   # Find img elements
   grep -r \"<img\" app/ components/ --include=\"*.tsx\" --include=\"*.jsx\"

   # Replace with Next.js Image:
   - Import: import Image from 'next/image';
   - Replace: <img> → <Image>
   - Add: width and height props
   - Maintain: alt, className, other props

   Verify: npm run lint 2>&1 | grep \"no-img-element\"
   Expected: No results

5. Verification (REQUIRED - DO NOT REPORT SUCCESS WITHOUT THIS)

   After fixing ALL categories:

   cd \"(platform)\"

   # Final ESLint check
   npm run lint
   # Expected: 0 warnings, 0 errors ✅

   # Count remaining warnings (should be 0)
   npm run lint 2>&1 | grep -E \"warning|error\" | wc -l
   # Expected: 0

   # Verify TypeScript still clean
   npx tsc --noEmit
   # Expected: 0 errors (don't break what Phase 3 fixed!)

   # Try full build
   npm run build
   # Expected: SUCCESS ✅ (first time build succeeds!)

Blocking Requirements:
- DO NOT use 'any' as replacement for 'any' - use proper types
- DO NOT introduce TypeScript errors while fixing ESLint warnings
- DO NOT skip sub-categories - fix in order
- DO provide progress updates per sub-category
- DO verify each file after fixing (don't batch without verification)
- DO NOT report success if ANY ESLint warnings remain

Success Criteria:
- All explicit 'any' types replaced (291 → 0) ✅
- All unused variables removed or prefixed (200+ → 0) ✅
- img element replaced with Image (1 → 0) ✅
- ESLint runs with 0 warnings ✅
- TypeScript still compiles (0 errors maintained) ✅
- npm run build SUCCEEDS ✅
- EXECUTION REPORT with full verification provided ✅

Return Format:
## ✅ EXECUTION REPORT - PHASE 4

**ESLint Warning Inventory:**
- Starting warnings: [X] (expected 840)
- Ending warnings: 0 ✅

**Category 1: Explicit 'any' Types (291 warnings)**
Sub-categories fixed:
- A. API Routes: [X] files, [Y] warnings eliminated
- B. Stripe Webhooks: 1 file, 11 warnings eliminated
- C. CRM Pages: [X] files, 8 warnings eliminated
- D. RAG Service: 1 file, 5 warnings eliminated
- E. Dynamic Imports: 1 file, 4 warnings eliminated
- F. Remaining: [X] files, [Y] warnings eliminated
Total: 291 warnings eliminated ✅

**Category 2: Unused Variables (200+ warnings)**
- Unused Imports: [X] files, [Y] warnings eliminated
- Unused Parameters: [X] files, [Y] warnings eliminated
- Unused Variables: [X] files, [Y] warnings eliminated
Total: [Z] warnings eliminated ✅

**Category 3: Next.js Image (1 warning)**
- File: [filename]
- img → Image conversion ✅

**Verification Results:**
[Paste FULL command outputs here]

**Build Status:**
- ESLint: ✅ 0 warnings, 0 errors
- TypeScript: ✅ 0 errors (maintained from Phase 3)
- npm run build: ✅ SUCCESS

**Files Modified Summary:**
[List all files with before/after warning counts]

**Next Phase Ready:** YES / NO (explain blockers if NO)
"
```

---

## 4.4 Expected Outcomes - Phase 4

**Success Indicators:**
- ✅ ESLint runs with 0 warnings
- ✅ All 291 'any' types replaced with proper types
- ✅ All 200+ unused variables cleaned up
- ✅ img element replaced with Image component
- ✅ Build succeeds for first time: `npm run build` ✅

**Remaining After Phase 4:**
- Production security blockers (Phase 5)
- Localhost auth bypass (CRITICAL)
- Server-only imports investigation

**Ready for Phase 5 When:**
- `npm run lint` shows 0 warnings
- `npm run build` succeeds completely
- No new TypeScript errors introduced
- Agent provides complete verification with evidence
- Build artifacts generated successfully

**MAJOR MILESTONE:**
After Phase 4, the platform will build successfully for the first time! All 1,676 code quality issues resolved.

---

# PHASE 5: PRODUCTION SECURITY

**Duration:** 2 hours
**Goal:** Remove security vulnerabilities and prepare for production
**Blockers Fixed:** Localhost auth bypass, server-only imports

## 5.1 Problem Analysis

**Production Blockers from CLAUDE.md:**

### Blocker 1: Localhost Authentication Bypass
**Status:** 🔴 ACTIVE - CRITICAL security vulnerability
**Risk:** If deployed to production, authentication is completely bypassed

**Files Affected:**
1. `lib/auth/auth-helpers.ts` - `requireAuth()` (line ~170)
2. `lib/auth/auth-helpers.ts` - `getCurrentUser()` (line ~79)
3. `lib/middleware/auth.ts` (if bypass still present)

**Code to Remove:**
```typescript
const isLocalhost = typeof window === 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

if (isLocalhost) {
  return enhanceUser({
    id: 'demo-user',
    email: 'demo@strivetech.ai',
    organizationId: 'demo-org',
    globalRole: 'SUPER_ADMIN',
    organizationRole: 'OWNER',
    subscriptionTier: 'ELITE',
    // ... rest of mock user
  });
}
```

---

### Blocker 2: Server-Only Imports Investigation
**Status:** 🟡 NEEDS INVESTIGATION
**Context:** Server-only imports were removed during showcase prep to make build work

**Investigation Required:**
1. Identify which files had server-only imports removed
2. Understand why they caused build issues
3. Determine if 'server-only' package is now installed
4. Re-add server-only imports where appropriate
5. Verify build still works

**Files to Check:**
- Search for: Files that should have `import 'server-only';`
- Sensitive files: Database queries, auth helpers, API utilities
- Verify: 'server-only' package in package.json

---

## 5.2 Fix Strategy

### 5.2.1 Remove Localhost Auth Bypass

**Step 1: Read and Understand Current Implementation**

Files to read:
- `lib/auth/auth-helpers.ts` (full file)
- `lib/middleware/auth.ts` (full file)

Document:
- Exact locations of isLocalhost checks
- What the functions return when localhost detected
- Any other security bypasses present

---

**Step 2: Remove Localhost Checks**

**File 1: `lib/auth/auth-helpers.ts` - `getCurrentUser()` function**

```typescript
// ❌ REMOVE THIS ENTIRE BLOCK (around line 79):
const isLocalhost = typeof window === 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

if (isLocalhost) {
  // Return mock demo user
  return enhanceUser({
    id: 'demo-user',
    // ... rest of mock data
  });
}

// ✅ KEEP: The real Supabase authentication logic
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
// ... rest of real auth logic
```

---

**File 2: `lib/auth/auth-helpers.ts` - `requireAuth()` function**

```typescript
// ❌ REMOVE THIS ENTIRE BLOCK (around line 170):
const isLocalhost = typeof window === 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

if (isLocalhost) {
  return {
    user: enhanceUser({
      id: 'demo-user',
      // ... rest of mock data
    })
  };
}

// ✅ KEEP: The real authentication requirement logic
const user = await getCurrentUser();
if (!user) {
  redirect('/login');
}
// ... rest of real auth logic
```

---

**File 3: `lib/middleware/auth.ts`**

```typescript
// Check if file contains similar isLocalhost bypass
// If found, remove entire block
// Keep: Real authentication middleware logic
```

---

**Step 3: Verify Authentication Works**

After removing localhost bypasses:

```bash
# Build should still succeed
cd "(platform)"
npm run build

# Authentication should now require real credentials
# (Can't test without setting up Supabase auth properly)

# Verify no localhost checks remain
grep -r "isLocalhost" lib/auth/ lib/middleware/
# Expected: No results
```

---

### 5.2.2 Investigate and Restore Server-Only Imports

**Step 1: Verify 'server-only' Package**

```bash
cd "(platform)"
cat package.json | grep "server-only"
# Should show: "server-only": "^0.0.x"

# If not present:
npm install server-only
```

---

**Step 2: Identify Files That Need Server-Only**

**Candidates for server-only imports:**
- Database utilities: `lib/database/prisma.ts`
- Auth helpers: `lib/auth/auth-helpers.ts`
- Server actions: `lib/modules/*/actions.ts`
- API utilities: `lib/api/*`
- Sensitive services: `lib/services/*` (that use secrets)

**Pattern to search:**
```bash
# Files that use environment secrets
grep -r "process.env.SUPABASE_SERVICE_ROLE_KEY" lib/ app/api/
grep -r "process.env.STRIPE_SECRET_KEY" lib/ app/api/
grep -r "process.env.DATABASE_URL" lib/

# Files that use Prisma directly
find lib/ -name "*.ts" -exec grep -l "import.*prisma" {} \;

# Server Actions (should NEVER run on client)
find lib/modules/ -name "actions.ts"
```

---

**Step 3: Re-add Server-Only Imports**

**Pattern:**
```typescript
// At the TOP of the file (before any other imports)
import 'server-only';

// Then other imports...
import { prisma } from '@/lib/database/prisma';
// ...
```

**Files to Update (minimum):**
1. `lib/database/prisma.ts`
2. `lib/auth/auth-helpers.ts`
3. All `lib/modules/*/actions.ts` files
4. `lib/api/*` utility files
5. `lib/services/*` files that use secrets

---

**Step 4: Verify Build Still Works**

```bash
cd "(platform)"

# Clean build
rm -rf .next/
npm run build

# If build fails:
# 1. Read error message carefully
# 2. Check if 'server-only' is being imported in client component
# 3. Verify file is actually server-side only
# 4. Check for 'use client' directive conflicts

# Build should succeed
# Expected: No 'server-only' related errors
```

---

## 5.3 Security Audit Checklist

After completing fixes, verify:

### Authentication & Authorization
- [ ] No localhost authentication bypass in code
- [ ] Supabase auth properly configured
- [ ] RBAC checks in place for protected routes
- [ ] Session validation working

### Secrets & Environment Variables
- [ ] No hardcoded secrets in codebase
- [ ] .env.local file NOT committed (.gitignore)
- [ ] SUPABASE_SERVICE_ROLE_KEY not exposed to client
- [ ] DOCUMENT_ENCRYPTION_KEY in .env.local only
- [ ] STRIPE_SECRET_KEY in .env.local only

### Server-Side Protection
- [ ] 'server-only' imports added to sensitive files
- [ ] Database utilities are server-only
- [ ] API keys never sent to client
- [ ] Server Actions properly protected

### Multi-Tenancy & RLS
- [ ] All database queries filter by organizationId
- [ ] RLS policies enabled on multi-tenant tables
- [ ] No cross-organization data leaks possible
- [ ] Tenant context set for all queries

### Input Validation
- [ ] All user input validated with Zod
- [ ] SQL injection prevention (using Prisma, not raw queries)
- [ ] XSS prevention (no dangerouslySetInnerHTML)
- [ ] File upload validation (if applicable)

### Dependencies
- [ ] All dependencies up to date (npm audit)
- [ ] No known vulnerabilities (npm audit fix)
- [ ] Unused dependencies removed

---

## 5.4 Agent Task Prompt - Phase 5

```bash
Task strive-agent-universal "
PHASE 5: Production Security - Remove Vulnerabilities in (platform)

Prerequisites:
- Phase 4 must be complete (build succeeds, 0 warnings)
- Verify: npm run build (should succeed) before starting

Objective: Remove security vulnerabilities and prepare for production deployment

Tasks (in order):

1. Remove Localhost Authentication Bypass (CRITICAL)

   Files to modify:
   - lib/auth/auth-helpers.ts (2 functions: getCurrentUser, requireAuth)
   - lib/middleware/auth.ts (if localhost bypass present)

   For each file:
   a) Read entire file to understand current implementation
   b) Locate isLocalhost checks (search for 'isLocalhost' string)
   c) Document the mock user data being returned
   d) Remove ENTIRE isLocalhost block (if statement + mock return)
   e) Verify real auth logic remains intact
   f) Verify: grep -r \"isLocalhost\" lib/auth/ lib/middleware/
      Expected: No results after fixes

   DO NOT PROCEED to task 2 until localhost bypasses are eliminated.

2. Investigate and Restore Server-Only Imports

   Sub-task A: Verify 'server-only' Package
   - Check: cat package.json | grep \"server-only\"
   - If missing: npm install server-only
   - Verify installation successful

   Sub-task B: Identify Files Needing Server-Only Protection

   Search for sensitive files:

   # Files using secrets
   grep -r \"process.env.SUPABASE_SERVICE_ROLE_KEY\" lib/ app/api/
   grep -r \"process.env.STRIPE_SECRET_KEY\" lib/ app/api/
   grep -r \"process.env.DATABASE_URL\" lib/
   grep -r \"process.env.DOCUMENT_ENCRYPTION_KEY\" lib/

   # Files using Prisma (database access)
   find lib/ -name \"*.ts\" -exec grep -l \"from '@/lib/database/prisma'\" {} \\;

   # All Server Actions
   find lib/modules/ -name \"actions.ts\"

   Create comprehensive list of files that MUST have server-only imports.

   Sub-task C: Re-add Server-Only Imports

   For EACH file identified:
   a) Read file to verify it's server-side only (no 'use client')
   b) Add at TOP: import 'server-only';
   c) Verify build: npm run build
   d) If build fails: Investigate why (may be client component)

   Minimum files to update:
   - lib/database/prisma.ts
   - lib/auth/auth-helpers.ts
   - All lib/modules/*/actions.ts files
   - lib/api/* utility files
   - lib/services/* files using secrets

   Sub-task D: Verify Build Still Works

   cd \"(platform)\"
   rm -rf .next/
   npm run build

   Expected: Build succeeds with server-only imports restored

   If build fails:
   - Read error message carefully
   - Check if file is actually client-side (shouldn't have server-only)
   - Document any blockers found

3. Security Audit (Verification)

   Run security checks:

   # Check for hardcoded secrets
   grep -r \"sk_live_\" . --exclude-dir=node_modules
   grep -r \"sk_test_\" . --exclude-dir=node_modules
   # Expected: None found (secrets should be in .env.local only)

   # Verify .env.local not committed
   git ls-files | grep \".env.local\"
   # Expected: No results (file should be in .gitignore)

   # Check for authentication bypasses
   grep -r \"bypass\\|skip.*auth\\|mock.*user\" lib/auth/ lib/middleware/
   # Expected: Only in test files or commented code

   # Check npm dependencies for vulnerabilities
   npm audit
   # Expected: 0 vulnerabilities (or document acceptable risks)

   # Verify server-only imports present
   grep -l \"import 'server-only'\" lib/database/*.ts lib/auth/*.ts lib/modules/*/actions.ts
   # Expected: All sensitive files listed

4. Final Verification (REQUIRED - DO NOT REPORT SUCCESS WITHOUT THIS)

   cd \"(platform)\"

   # Build must succeed
   rm -rf .next/
   npm run build
   # Expected: SUCCESS ✅

   # No TypeScript errors
   npx tsc --noEmit
   # Expected: 0 errors ✅

   # No ESLint warnings
   npm run lint
   # Expected: 0 warnings ✅

   # No localhost bypasses remain
   grep -r \"isLocalhost\" lib/ app/
   # Expected: No results (or only in test files)

   # Server-only imports present
   grep -r \"import 'server-only'\" lib/ | wc -l
   # Expected: 20+ files (comprehensive protection)

   # No secrets in codebase
   grep -r \"sk_live_\\|sk_test_\" . --exclude-dir=node_modules --exclude-dir=.next
   # Expected: No results

Blocking Requirements:
- DO NOT report success if localhost auth bypass remains
- DO NOT skip server-only investigation - must be thorough
- DO NOT introduce build failures when adding server-only imports
- DO provide evidence: Full command outputs, not just 'passed'
- DO NOT proceed if security audit finds vulnerabilities

Success Criteria:
- Localhost auth bypass removed from all files ✅
- Server-only imports restored to sensitive files ✅
- Build succeeds with security in place ✅
- No hardcoded secrets found ✅
- No localhost bypass remains ✅
- Security audit passes ✅
- EXECUTION REPORT with full verification provided ✅

Return Format:
## ✅ EXECUTION REPORT - PHASE 5

**Task 1: Localhost Authentication Bypass**
Files modified:
- lib/auth/auth-helpers.ts: getCurrentUser() → ✅ Bypass removed
- lib/auth/auth-helpers.ts: requireAuth() → ✅ Bypass removed
- lib/middleware/auth.ts: → ✅ Bypass removed / N/A (not present)

Verification:
[Paste grep results showing no isLocalhost references]

**Task 2: Server-Only Imports**

Sub-task A: Package verification
- server-only package: ✅ Installed (version X.X.X)

Sub-task B: Files identified
[List all files needing server-only imports]
Total: [X] files

Sub-task C: Server-only imports added
[List all files modified with import added]
Total: [X] files updated

Sub-task D: Build verification
[Paste build command output]
Result: ✅ SUCCESS

**Task 3: Security Audit**
- Hardcoded secrets: ✅ None found
- .env.local committed: ✅ Not committed
- Auth bypasses: ✅ None found (except test files)
- npm audit: ✅ 0 vulnerabilities / [X] vulnerabilities (acceptable)
- Server-only imports: ✅ [X] files protected

**Final Verification Results:**
[Paste FULL command outputs here]

**Production Readiness:**
- Build: ✅ SUCCESS
- TypeScript: ✅ 0 errors
- ESLint: ✅ 0 warnings
- Security: ✅ No vulnerabilities
- Authentication: ✅ Real auth only (no bypasses)
- Secrets: ✅ Protected (not in codebase)

**PRODUCTION READY:** ✅ YES / ❌ NO (explain blockers if NO)

**Deployment Checklist:**
- [ ] All environment variables set in Vercel
- [ ] DATABASE_URL configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] STRIPE_SECRET_KEY configured
- [ ] DOCUMENT_ENCRYPTION_KEY configured
- [ ] Domain configured (app.strivetech.ai)
- [ ] Build succeeds on Vercel
- [ ] Authentication tested in production
- [ ] Multi-tenancy verified (no data leaks)

**Next Steps:**
[Describe any remaining tasks or deployment preparation needed]
"
```

---

## 5.5 Expected Outcomes - Phase 5

**Success Indicators:**
- ✅ Localhost auth bypass completely removed
- ✅ Server-only imports restored (20+ files)
- ✅ Build succeeds with security in place
- ✅ No secrets in codebase
- ✅ Security audit passes

**Production Ready When:**
- All 5 phases complete
- `npm run build` succeeds ✅
- `npx tsc --noEmit` returns 0 errors ✅
- `npm run lint` returns 0 warnings ✅
- No security vulnerabilities found ✅
- Authentication requires real credentials ✅
- Ready to deploy to Vercel

**Final State:**
- 🟢 **BUILD PASSING** (first time!)
- 🟢 **0 TypeScript errors** (fixed 835)
- 🟢 **0 ESLint warnings** (fixed 840)
- 🟢 **0 Security vulnerabilities** (fixed 2 critical)
- 🟢 **PRODUCTION READY** ✅

---

# PHASE SUMMARY & TRACKING

## Phase Status Tracker

| Phase | Duration | Errors Fixed | Status | Progress |
|-------|----------|--------------|--------|----------|
| **Phase 1** | 0.5-1h | 1 + 15+ | 🔴 Not Started | 0% |
| **Phase 2** | 2-3h | ~600 | 🔴 Not Started | 0% |
| **Phase 3** | 4-6h | ~235 | 🔴 Not Started | 0% |
| **Phase 4** | 6-8h | 840 | 🔴 Not Started | 0% |
| **Phase 5** | 2h | 2 critical | 🔴 Not Started | 0% |
| **TOTAL** | **15-20h** | **1,693** | **🔴 FAILING** | **0%** |

---

## Quick Start Commands

```bash
# Navigate to platform
cd "(platform)"

# Phase 1: Check if build blockers are fixed
npx tsc --noEmit 2>&1 | grep -E "Cannot find module|has no exported member"
npm run build 2>&1 | head -50

# Phase 2: Check mocking errors
npx tsc --noEmit 2>&1 | grep "mockResolvedValue\|mockReturnValue" | wc -l

# Phase 3: Count remaining TypeScript errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Phase 4: Check ESLint warnings
npm run lint 2>&1 | grep -E "warning|error" | wc -l

# Phase 5: Check for security issues
grep -r "isLocalhost" lib/auth/ lib/middleware/
grep -r "import 'server-only'" lib/ | wc -l

# Final verification
npm run build && npx tsc --noEmit && npm run lint
```

---

## Agent Invocation Pattern

**For each phase:**

1. **Invoke agent with phase-specific task prompt** (from sections X.3 above)
2. **Wait for EXECUTION REPORT** with verification evidence
3. **Validate results independently:**
   ```bash
   # Don't just trust agent reports - verify
   cd "(platform)"
   [Run verification commands from phase]
   ```
4. **Review blockers** - If agent reports blockers, investigate before proceeding
5. **Proceed to next phase** only when current phase complete

**DO NOT:**
- ❌ Skip phases or combine them
- ❌ Trust reports without verification
- ❌ Proceed if blockers remain
- ❌ Batch multiple phases in one agent invocation

**DO:**
- ✅ Follow phase order (1 → 2 → 3 → 4 → 5)
- ✅ Verify with actual command outputs
- ✅ Review agent's EXECUTION REPORT thoroughly
- ✅ Celebrate incremental progress 🎉

---

## Success Metrics

**Phase 1 Success:**
- Build progresses past import resolution ✅
- TemplateFilters error gone ✅
- ~7-15 errors eliminated ✅

**Phase 2 Success:**
- All mocking errors eliminated ✅
- ~600 errors eliminated ✅
- Tests compile successfully ✅

**Phase 3 Success:**
- TypeScript compiles with 0 errors ✅
- ~235 errors eliminated ✅
- No 'any' types introduced ✅

**Phase 4 Success:**
- ESLint runs with 0 warnings ✅
- 840 warnings eliminated ✅
- Build succeeds for first time ✅

**Phase 5 Success:**
- Security vulnerabilities eliminated ✅
- Production ready ✅
- Ready to deploy to Vercel ✅

**FINAL SUCCESS:**
```bash
✅ npm run build      # SUCCESS
✅ npx tsc --noEmit   # 0 errors
✅ npm run lint       # 0 warnings
✅ npm audit          # 0 vulnerabilities
🚀 PRODUCTION READY
```

---

## Post-Phase 5: Deployment Preparation

**After all phases complete:**

### 1. Environment Variables Setup (Vercel)
```bash
# Required in Vercel environment:
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOCUMENT_ENCRYPTION_KEY=<64-char-hex>
```

### 2. Deployment Commands
```bash
# Build locally to verify
cd "(platform)"
npm run build

# Deploy to Vercel
vercel --prod

# Or configure auto-deployment from GitHub
# (Recommended - connects to main branch)
```

### 3. Post-Deployment Testing
- [ ] Sign up flow works
- [ ] Authentication works (no bypass!)
- [ ] Dashboard loads
- [ ] CRM features work
- [ ] Multi-tenancy verified (test with 2 orgs)
- [ ] Stripe webhooks configured
- [ ] File uploads work
- [ ] All subscription tiers tested

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Status:** Ready for Phase 1 execution
**Total Issues:** 1,676 → Target: 0
**Estimated Time:** 15-20 hours of agent work
