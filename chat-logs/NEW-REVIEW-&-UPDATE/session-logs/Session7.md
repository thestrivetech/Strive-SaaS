# Session 7: User Type Refactoring & Final Error Resolution

**Status**: 🔵 Ready to Start
**Prerequisites**: Session 6 completed ✅
**Goal**: Reduce errors from 87 → <30 (65%+ reduction)
**Estimated Time**: 2-3 hours

---

## 📊 Current State (Start of Session 7)

### Error Summary
- **Total TypeScript Errors**: 87
- **Target**: <30 errors (57+ errors to fix)
- **Previous Session**: Fixed 55 errors (38.7% reduction)
- **ESLint Status**: 608 problems (207 errors, 401 warnings)

### Session 6 Achievements Recap
✅ Fixed UI library types (Calendar, Chart) → -10 errors
✅ Resolved React Hook Form ambiguity → Type safety improved
✅ Fixed schema filter properties (Projects, CRM) → -36 errors
✅ Added SEO type completeness → -11 errors
✅ Corrected test fixture enums → -6 errors

### Root Cause of Remaining Errors
**Primary Issue** (30+ errors): User Type Structural Mismatch
- Code expects: `user.organizationId`
- Actual type: `user.organizationMembers[].organization.id`
- Impact: Affects 6+ files across modules

---

## 🎯 Session 7 Objectives

### Primary Goals
1. **Refactor User type access pattern** → -25 to -30 errors (major reduction)
2. **Fix Prisma schema mismatches** → -10 to -15 errors
3. **Resolve module resolution issues** → -9 errors
4. **Fix remaining type mismatches** → -10 to -15 errors
5. **ESLint critical fixes** → Reduce errors by 50%+

### Success Criteria
- ✅ TypeScript errors reduced to <30 total
- ✅ User.organizationId pattern resolved across entire codebase
- ✅ Schema consistency achieved (ActivityLog, Task fields)
- ✅ Module resolution errors eliminated
- ✅ Production build succeeds
- ✅ ESLint errors reduced to <100

---

## 📋 Implementation Plan

### Phase 1: User Type Refactoring (60 mins) 🎯

**Expected Impact**: -25 to -30 errors (largest reduction!)

#### Background: Understanding the User Type Issue

**Problem**: The Prisma User model has a many-to-many relationship with Organization through `OrganizationMember`:

```prisma
model User {
  id                   String   @id @default(uuid())
  email                String   @unique
  name                 String?
  organizationMembers  OrganizationMember[]  // ← Many-to-many relationship
  // NO direct organizationId field
}

model OrganizationMember {
  id             String       @id @default(uuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  role           UserRole
}
```

**Current Code Pattern** (Broken):
```typescript
const user = await getCurrentUser();
await prisma.task.create({
  data: {
    project: { organizationId: user.organizationId }  // ❌ Error: Property doesn't exist
  }
});
```

**What TypeScript Actually Sees**:
```typescript
type User = {
  id: string;
  email: string;
  name: string | null;
  organizationMembers: Array<{
    organization: {
      id: string;
      name: string;
      // ... other fields
    };
    // ... other fields
  }>;
  // organizationId does NOT exist here
}
```

#### Task 1.1: Create User Type Helper Functions

**File**: `app/lib/auth/user-helpers.ts` (NEW FILE)

**Create helper functions**:

```typescript
import type { User, OrganizationMember, Organization } from '@prisma/client';

/**
 * User type with loaded organization member relationship
 */
export type UserWithOrganization = User & {
  organizationMembers: Array<
    OrganizationMember & {
      organization: Organization;
    }
  >;
};

/**
 * Get the user's primary organization ID
 * Assumes user belongs to at least one organization
 *
 * @throws Error if user has no organization memberships
 */
export function getUserOrganizationId(user: UserWithOrganization): string {
  if (!user.organizationMembers || user.organizationMembers.length === 0) {
    throw new Error('User has no organization memberships');
  }

  // Return the first organization (primary)
  return user.organizationMembers[0].organization.id;
}

/**
 * Get the user's primary organization
 *
 * @throws Error if user has no organization memberships
 */
export function getUserOrganization(user: UserWithOrganization): Organization {
  if (!user.organizationMembers || user.organizationMembers.length === 0) {
    throw new Error('User has no organization memberships');
  }

  return user.organizationMembers[0].organization;
}

/**
 * Get all organizations the user belongs to
 */
export function getUserOrganizations(user: UserWithOrganization): Organization[] {
  return user.organizationMembers.map(member => member.organization);
}

/**
 * Check if user belongs to a specific organization
 */
export function userBelongsToOrganization(
  user: UserWithOrganization,
  organizationId: string
): boolean {
  return user.organizationMembers.some(
    member => member.organization.id === organizationId
  );
}
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "lib/auth/user-helpers"
# Expected: 0 errors
```

#### Task 1.2: Update getCurrentUser to Include Organization

**File**: `app/lib/auth/auth-helpers.ts` or similar

**Current Implementation** (probably):
```typescript
export async function getCurrentUser() {
  // ... auth logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
}
```

**Updated Implementation**:
```typescript
import type { UserWithOrganization } from './user-helpers';

export async function getCurrentUser(): Promise<UserWithOrganization | null> {
  // ... auth logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationMembers: {
        include: {
          organization: true,
        },
        take: 1, // Only need primary organization for most cases
      },
    },
  });

  return user as UserWithOrganization | null;
}
```

**Note**: Verify the actual location of `getCurrentUser` first - it might be in `lib/auth/utils.ts` or similar.

#### Task 1.3: Fix Tasks Bulk Actions (15 errors)

**File**: `app/lib/modules/tasks/bulk-actions.ts`

**Current Errors**:
- 8× `user.organizationId` property doesn't exist
- 6× `entityType` doesn't exist in ActivityLog
- 1× `assigneeId` vs `assignedToId` mismatch

**Step 1**: Add helper import
```typescript
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
```

**Step 2**: Replace all `user.organizationId` occurrences (8 places)

**Before** (example from line 43):
```typescript
const tasks = await prisma.task.findMany({
  where: {
    id: { in: validated.taskIds },
    project: { organizationId: user.organizationId },  // ❌ Error
  },
});
```

**After**:
```typescript
const organizationId = getUserOrganizationId(user);

const tasks = await prisma.task.findMany({
  where: {
    id: { in: validated.taskIds },
    project: { organizationId },  // ✅ Fixed
  },
});
```

**Pattern to Apply**:
1. At top of each function, add: `const organizationId = getUserOrganizationId(user);`
2. Replace all `user.organizationId` with just `organizationId`
3. Applies to lines: ~43, ~68, ~110, ~126, ~150, ~192, ~208, ~256 (verify exact lines)

**Step 3**: Fix `entityType` property (6 places)

Two options:

**Option A**: Remove `entityType` from ActivityLog creation (if not in schema)
```typescript
// Before
await prisma.activityLog.create({
  data: {
    userId: user.id,
    organizationId,
    action: 'BULK_UPDATE_STATUS',
    entityType: 'Task',  // ❌ Remove if not in schema
    entityId: validated.taskIds.join(','),
    details: { /* ... */ },
  },
});

// After
await prisma.activityLog.create({
  data: {
    userId: user.id,
    organizationId,
    action: 'BULK_UPDATE_STATUS',
    entityId: validated.taskIds.join(','),
    details: {
      entityType: 'Task',  // ✅ Move to details object
      /* ... */
    },
  },
});
```

**Option B**: Add `entityType` to Prisma schema (if it should exist)
```prisma
// In prisma/schema.prisma
model ActivityLog {
  id             String   @id @default(uuid())
  userId         String
  organizationId String
  action         String
  entityType     String?  // ✅ Add this field
  entityId       String?
  details        Json?
  createdAt      DateTime @default(now())
}
```

Then run: `npx prisma migrate dev --name add_entity_type_to_activity_log`

**Recommendation**: Use Option A (move to details) unless you plan to query by entityType.

**Step 4**: Fix `assigneeId` vs `assignedToId` (line ~141)

```typescript
// Before
await prisma.task.updateMany({
  where: { id: { in: validated.taskIds } },
  data: {
    assigneeId: validated.assigneeId,  // ❌ Wrong field name
  },
});

// After
await prisma.task.updateMany({
  where: { id: { in: validated.taskIds } },
  data: {
    assignedToId: validated.assigneeId,  // ✅ Correct field name (matches Prisma schema)
  },
});
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "bulk-actions" | wc -l
# Expected: 0 (was 15)
```

#### Task 1.4: Fix Attachments Actions (10 errors)

**File**: `app/lib/modules/attachments/actions.ts`

**Current Errors**: All 10 are `user.organizationId` property doesn't exist

**Steps**:

1. Add helper import:
```typescript
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
```

2. In each action function, add at the top:
```typescript
const organizationId = getUserOrganizationId(user);
```

3. Replace all `user.organizationId` with `organizationId`

**Functions to Update** (10 occurrences total):
- `uploadAttachment()` - lines ~42, ~60
- `deleteAttachment()` - line ~83, ~92
- `getAttachments()` - line ~125
- `getAttachment()` - line ~165
- `updateAttachment()` - line ~196
- `downloadAttachment()` - line ~256
- Plus 2 more occurrences

**Example Fix**:
```typescript
// Before
export async function uploadAttachment(input: unknown) {
  const user = await getCurrentUser();
  // ... validation

  const attachment = await prisma.attachment.create({
    data: {
      // ...
      organizationId: user.organizationId,  // ❌ Error
    },
  });
}

// After
export async function uploadAttachment(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const organizationId = getUserOrganizationId(user);  // ✅ Get org ID
  // ... validation

  const attachment = await prisma.attachment.create({
    data: {
      // ...
      organizationId,  // ✅ Fixed
    },
  });
}
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "attachments/actions" | wc -l
# Expected: 0 (was 10)
```

#### Task 1.5: Fix AI Actions (6 errors)

**File**: `app/lib/modules/ai/actions.ts`

**Current Errors**: All `user.organizationId` related

**Apply same pattern as Tasks 1.3 and 1.4**:
1. Import helper
2. Extract `organizationId` at function top
3. Replace all occurrences

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "ai/actions" | wc -l
# Expected: 0 (was 6)
```

#### Task 1.6: Fix Notifications Actions (4 errors)

**File**: `app/lib/modules/notifications/actions.ts`

**Apply same pattern**

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "notifications/actions" | wc -l
# Expected: 0 (was 4)
```

#### Task 1.7: Verify All User Type Fixes

```bash
# Check for any remaining user.organizationId references
npx tsc --noEmit 2>&1 | grep "organizationId.*does not exist"
# Expected: 0 results

# Count total errors after Phase 1
npx tsc --noEmit 2>&1 | grep -c "error TS"
# Target: ~57 (was 87, fixed ~30)
```

---

### Phase 2: Fix Priority Enum Mismatch (15 mins) 🔧

**Expected Impact**: -2 errors

#### Background: Priority Enum Values

**Prisma Schema** (check `prisma/schema.prisma`):
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL  // ← Not URGENT
}
```

**Current Code** (bulk-actions.ts line ~24):
```typescript
const BulkUpdatePrioritySchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),  // ❌ URGENT doesn't exist
});
```

#### Task 2.1: Investigate and Fix Priority Enum

**Step 1**: Check Prisma schema
```bash
grep -A 5 "enum Priority" app/prisma/schema.prisma
```

**Step 2**: Decide on fix approach

**Option A**: Update Zod schema to match Prisma
```typescript
const BulkUpdatePrioritySchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),  // ✅ Fixed
});

// Also update line ~208 where it's used
await prisma.task.updateMany({
  where: { id: { in: validated.taskIds } },
  data: {
    priority: validated.priority,  // Now accepts CRITICAL
  },
});
```

**Option B**: Update Prisma schema if URGENT is correct (then migrate)
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT  // Changed from CRITICAL
}
```

Then run: `npx prisma migrate dev --name change_priority_urgent`

**Recommendation**: Use Option A (update code to match schema) unless business requirement needs URGENT.

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "priority.*URGENT"
# Expected: 0 results
```

---

### Phase 3: Module Resolution Fixes (30 mins) 📦

**Expected Impact**: -9 errors

#### Task 3.1: Analyze Module Not Found Errors

```bash
npx tsc --noEmit 2>&1 | grep "error TS2307" | head -10
```

**Common Causes**:
1. Wrong import path
2. Missing module declaration file
3. Missing package in dependencies

#### Task 3.2: Fix Each Module Resolution Error

**Pattern for each error**:

1. **Check if file exists**:
   ```bash
   ls app/lib/database/prisma.ts  # If error is "Cannot find '@/lib/database/prisma'"
   ```

2. **If file doesn't exist**, find correct path:
   ```bash
   find app -name "prisma.ts" -type f
   ```

3. **If file exists**, check `tsconfig.json` paths configuration:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./app/*"]  // Verify this is correct
       }
     }
   }
   ```

4. **If module is external**, add to dependencies or create declaration file

**Example Fixes**:

**Error**: Cannot find module '@tailwindcss/vite'
```bash
# Check if installed
npm list @tailwindcss/vite

# If not, either install or remove import
npm install @tailwindcss/vite --save-dev
# OR
# Remove the import from tailwind.config.ts
```

**Error**: Cannot find module 'templateEngine'
```typescript
// scripts/generate-email-previews.ts line 138

// Before
const html = templateEngine.render(template);  // ❌ Module doesn't exist

// After - Use actual template engine
import { render } from '@/lib/email/templates';  // ✅ Or whatever is actually used
const html = render(template);
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "error TS2307" | wc -l
# Expected: 0 (was 9)
```

---

### Phase 4: Fix Remaining Type Mismatches (45 mins) 🔍

**Expected Impact**: -15 to -20 errors

#### Task 4.1: Fix TaskWithAssignee Type Issues (3 errors)

**Files**:
- `components/features/tasks/task-list.tsx` (3 errors)
- `app/(platform)/projects/[projectId]/page.tsx` (related)

**Error Pattern**: Property 'assignedTo' is missing in type

**Investigation**:
```bash
# Check TaskWithAssignee definition
grep -A 10 "TaskWithAssignee" app/lib/modules/tasks/queries.ts
```

**Expected Definition**:
```typescript
export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: {
    assignedTo: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
      };
    };
  };
}>;
```

**Fix**: Ensure data passed to component includes `assignedTo`

**Example**:
```typescript
// In page.tsx
const tasks = await prisma.task.findMany({
  where: { projectId },
  include: {
    assignedTo: {  // ✅ Must include this
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  },
});

// Pass to component
<TaskList tasks={tasks} />  // ✅ Now has assignedTo property
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "task-list\|TaskWithAssignee"
# Expected: 0 errors
```

#### Task 4.2: Fix Test Fixture Remaining Issues (5 errors)

**File**: `app/__tests__/fixtures/projects.ts`

**Likely Issues**:
- More enum value mismatches
- Missing properties in test data
- Type inconsistencies

**Steps**:
1. Read file to see errors:
   ```bash
   npx tsc --noEmit 2>&1 | grep "__tests__/fixtures/projects"
   ```

2. Fix each error based on Prisma schema

**Common Fixes**:
```typescript
// Ensure all required fields are present
export const testProjects = {
  activeProject: {
    name: 'Website Redesign',
    description: 'Complete redesign',
    status: ProjectStatus.ACTIVE,  // ✅ Correct enum
    priority: Priority.HIGH,  // ✅ Use Priority, not TaskPriority
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-06-30'),
    budget: 50000,
    organizationId: 'test-org-id',  // ✅ Add if required
    projectManagerId: 'test-user-id',  // ✅ Add if required
  },
};
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "__tests__/fixtures" | wc -l
# Expected: 0 (was 5)
```

#### Task 4.3: Fix ROI Calculator Types (3 errors)

**File**: `components/ui/roi-calculator.tsx`

**Steps**:
1. Read errors:
   ```bash
   npx tsc --noEmit 2>&1 | grep "roi-calculator"
   ```

2. Apply appropriate fixes based on error type:
   - Missing properties → Add to interface
   - Type mismatch → Add type annotation or cast
   - Undefined values → Add optional chaining

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep "roi-calculator" | wc -l
# Expected: 0 (was 3)
```

#### Task 4.4: Fix Remaining Scattered Errors (8 errors)

**Files**: chatbot-iframe-communication.ts, use-realtime.ts, scripts, etc.

**Strategy**: Address each file individually:

1. **Identify all remaining errors**:
   ```bash
   npx tsc --noEmit 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn
   ```

2. **Fix each file** using appropriate pattern:
   - Missing properties → Add to type/interface
   - Type mismatches → Add proper type annotations
   - Undefined access → Add optional chaining or null checks
   - Wrong types → Use correct type from Prisma/imports

**Example Fix Pattern**:
```typescript
// Before: Type mismatch error
const result = await someFunction();
result.property = value;  // ❌ Property doesn't exist

// After: Proper typing
const result = await someFunction() as ExpectedType;
result.property = value;  // ✅ Now type-safe

// Or add property to interface
interface ExpectedType {
  property: string;  // ✅ Define property
}
```

**Verification**:
```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"
# Target: <30 total
```

---

### Phase 5: ESLint Critical Fixes (30 mins) 🧹

**Expected Impact**: Reduce ESLint errors from 207 → <100

#### Task 5.1: Fix Supabase Types File (4 errors)

**File**: `app/types/supabase.ts`
**Lines**: 15-18

**Current Issue**:
```typescript
export type Json = string | number | boolean | null | { [key: string]: any } | any[];
//                                                                         ^^^      ^^^
// ❌ 4 instances of 'any'
```

**Fix**: Make Json type recursive
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }  // ✅ Recursive, not 'any'
  | Json[];  // ✅ Array of Json, not 'any[]'
```

**Verification**:
```bash
npx eslint types/supabase.ts
# Expected: 0 errors (was 4)
```

#### Task 5.2: Fix Scripts with 'any' Types (9 errors)

**Files**:
- `scripts/verify-database-config.ts` (8 errors)
- `scripts/generate-email-previews.ts` (1 error)

**Strategy**: Replace `any` with proper types

**Example from verify-database-config.ts**:
```typescript
// Before
const result: any = await prisma.$queryRaw`...`;  // ❌

// After
interface QueryResult {
  count: number;
  [key: string]: unknown;
}
const result = await prisma.$queryRaw<QueryResult[]>`...`;  // ✅
```

**Pattern to Apply**:
1. Define interface for expected result shape
2. Use generic type parameter: `prisma.$queryRaw<T>`
3. For truly unknown types, use `unknown` not `any`

**Verification**:
```bash
npx eslint scripts/
# Target: <5 errors (was 9)
```

#### Task 5.3: Fix Unused Variables (Select High-Impact)

**Strategy**: Focus on top 10 files with most warnings

```bash
# Find files with most warnings
npx eslint . --ext .ts,.tsx --format json | jq '.[] | select(.messages | length > 5) | .filePath' | head -10
```

**Fix Pattern**:
```typescript
// Option 1: Prefix with underscore if needed for later
const [_data, setData] = useState();

// Option 2: Remove if truly unused
// const data = someValue;  // ← Just delete the line

// Option 3: Actually use the variable
const data = someValue;
console.log('Data loaded:', data);  // ✅ Now used
```

**Verification**:
```bash
npx eslint . --ext .ts,.tsx 2>&1 | tail -3
# Target: <500 total problems (was 608)
```

---

### Phase 6: Final Verification & Production Build (20 mins) ✅

#### Task 6.1: Run Complete Type Check

```bash
# Full TypeScript check
npx tsc --noEmit

# Count errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Target: <30 (stretch: <20)
```

#### Task 6.2: Run ESLint Check

```bash
# ESLint check
npx eslint . --ext .ts,.tsx

# Count issues
npx eslint . --ext .ts,.tsx 2>&1 | grep "✖" | tail -1
# Target: <500 total problems (from 608)
```

#### Task 6.3: Test Production Build

```bash
# Navigate to app directory
cd app

# Clean build artifacts
rm -rf .next

# Production build
npm run build

# Target: Success (warnings acceptable, no errors)
```

**If Build Fails**:
1. Check error message
2. Common issues:
   - Missing environment variables → Add to `.env.local`
   - Import errors → Check module resolution
   - Type errors → Run `npx tsc --noEmit` first
3. Fix and retry

#### Task 6.4: Generate Final Error Analysis

```bash
# Create detailed error report
npx tsc --noEmit 2>&1 | grep "error TS" > /tmp/session7-errors.txt

# Group by file
cat /tmp/session7-errors.txt | cut -d'(' -f1 | sort | uniq -c | sort -rn > /tmp/session7-errors-by-file.txt

# Group by error type
cat /tmp/session7-errors.txt | grep -o "error TS[0-9]*" | sort | uniq -c | sort -rn > /tmp/session7-errors-by-type.txt

# Display results
echo "=== Errors by File ==="
head -20 /tmp/session7-errors-by-file.txt

echo ""
echo "=== Errors by Type ==="
head -10 /tmp/session7-errors-by-type.txt

echo ""
echo "=== Total Count ==="
wc -l /tmp/session7-errors.txt
```

**Document Results**:
- Total error count
- Top 5 files with errors
- Top 5 error types
- Comparison with Session 6 start (87 errors)
- Recommended next steps for remaining errors

---

## 🎯 Priority Order & Time Allocation

### High Priority (Must Complete) - 105 mins
1. **Phase 1**: User type refactoring (60 mins) → -30 errors
2. **Phase 2**: Priority enum fix (15 mins) → -2 errors
3. **Phase 3**: Module resolution (30 mins) → -9 errors

**After High Priority**: 87 → ~46 errors ✅ **Goal Nearly Achieved**

### Medium Priority (Should Complete) - 45 mins
4. **Phase 4**: Remaining type mismatches (45 mins) → -15 to -20 errors

**If Completed**: 87 → ~26-31 errors (70-64% reduction) 🎉

### Low Priority (Nice to Have) - 50 mins
5. **Phase 5**: ESLint fixes (30 mins) → Improve code quality
6. **Phase 6**: Verification & build (20 mins) → Ensure stability

---

## 📝 Critical Patterns & Best Practices

### 1. User Organization Access Pattern
```typescript
// ❌ NEVER DO THIS
const orgId = user.organizationId;

// ✅ ALWAYS DO THIS
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
const orgId = getUserOrganizationId(user);
```

### 2. getCurrentUser Must Include Organization
```typescript
// ✅ CORRECT getCurrentUser implementation
export async function getCurrentUser(): Promise<UserWithOrganization | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationMembers: {
        include: { organization: true },
        take: 1,
      },
    },
  });
  return user as UserWithOrganization | null;
}
```

### 3. Prisma Query Includes
```typescript
// ✅ Always include required relations
const tasks = await prisma.task.findMany({
  where: { projectId },
  include: {
    assignedTo: true,  // ✅ Required for TaskWithAssignee
  },
});
```

### 4. Type Safety for JSON Fields
```typescript
// ❌ Using 'any'
const data: any = JSON.parse(jsonString);

// ✅ Using proper types
interface ExpectedData {
  field: string;
}
const data = JSON.parse(jsonString) as ExpectedData;
```

### 5. Error-First Development
```typescript
// ✅ Handle errors at function boundaries
export async function someAction(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    // ... rest of logic

  } catch (error) {
    console.error('Action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

---

## 🔄 Fallback Strategies

### If User Type Refactoring Blocks Progress

**Fallback Plan A**: Type Assertions (Temporary)
```typescript
// Only if helper approach fails
const userWithOrg = user as any;
const orgId = userWithOrg.organizationId;
// ⚠️ Document why this is needed and plan to fix
```

**Fallback Plan B**: Create Intermediate Type
```typescript
// If Prisma type is too complex
export interface SimpleUser {
  id: string;
  email: string;
  organizationId: string;  // Computed property
}

export function toSimpleUser(user: UserWithOrganization): SimpleUser {
  return {
    id: user.id,
    email: user.email,
    organizationId: getUserOrganizationId(user),
  };
}
```

### If Module Resolution Fails

1. **Clear all caches**:
   ```bash
   rm -rf .next node_modules/.cache .tsbuildinfo
   npm install
   ```

2. **Verify tsconfig.json paths**:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. **Use relative imports** as last resort:
   ```typescript
   // If @/ paths fail
   import { prisma } from '../../lib/prisma';
   ```

### If Build Continues to Fail

1. **Identify specific failure point**:
   ```bash
   npm run build 2>&1 | tee build-log.txt
   grep -i "error" build-log.txt
   ```

2. **Try incremental fixes**:
   - Comment out problematic imports
   - Build successfully
   - Uncomment and fix one by one

3. **Check for circular dependencies**:
   ```bash
   npx madge --circular --extensions ts,tsx app/
   ```

---

## 📊 Success Metrics

### Must Achieve (Session Success)
- ✅ TypeScript errors <30 (from 87) → 65%+ reduction
- ✅ User.organizationId pattern resolved
- ✅ Schema consistency achieved
- ✅ Production build succeeds
- ✅ No regressions in working features

### Should Achieve (Bonus Goals)
- ✅ TypeScript errors <20
- ✅ ESLint errors <100
- ✅ All module resolution issues fixed
- ✅ Test fixtures fully typed

### Could Achieve (Stretch Goals)
- ✅ TypeScript errors <10
- ✅ ESLint errors <50
- ✅ 100% type coverage in auth/user modules
- ✅ Performance optimizations identified

---

## 📚 Reference Materials

### Session Context
- **Session 7 Plan**: This document
- **Session 6 Summary**: `/chat-logs/NEW-REVIEW-&-UPDATE/session-logs/Session6-Summary.md`
- **Session 5 Summary**: `/chat-logs/NEW-REVIEW-&-UPDATE/session-logs/Session5-Summary.md`

### Key Files to Reference
1. **Prisma Schema**: `app/prisma/schema.prisma`
   - Check User, Organization, OrganizationMember models
   - Verify enum values (Priority, ProjectStatus, etc.)

2. **Auth Helpers**: Find current location of `getCurrentUser`
   - Likely: `lib/auth/auth-helpers.ts` or `lib/auth/utils.ts`

3. **Type Definitions**:
   - `@prisma/client` - Generated types
   - `app/types/` - Custom type definitions

### Important Commands
```bash
# Type checking
npx tsc --noEmit

# Count errors
npx tsc --noEmit 2>&1 | grep -c "error TS"

# ESLint
npx eslint . --ext .ts,.tsx

# Build
npm run build

# Prisma
npx prisma generate
npx prisma migrate dev --name <description>
```

---

## 🚀 Getting Started Checklist

### Before Starting Session 7:

1. ✅ Read Session 6 Summary
2. ✅ Verify current error count: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
3. ✅ Expected: 87 errors
4. ✅ Check git status - ensure clean or committed Session 6 changes
5. ✅ Optional: Create new branch: `git checkout -b session-7-user-type-refactoring`
6. ✅ Have both Session 6 Summary and this Session 7 plan open

### During Session 7:

1. ✅ Follow phases in order (1 → 2 → 3 → 4 → 5 → 6)
2. ✅ Verify after each phase with `npx tsc --noEmit`
3. ✅ Commit after each major phase completion
4. ✅ Update todo list to track progress
5. ✅ Document any blockers or unexpected issues
6. ✅ If stuck >20 mins on one issue, move to next and circle back

### After Session 7:

1. ✅ Run full verification suite
2. ✅ Test production build
3. ✅ Create Session 7 summary document
4. ✅ Plan Session 8 (if needed - final polish & deployment prep?)
5. ✅ Update project documentation with patterns learned
6. ✅ Celebrate achieving <30 errors! 🎉

---

## 🎯 Expected Final State

After Session 7 completion:

```
✅ TypeScript Errors: 87 → <30 (target) or <20 (stretch)
✅ User Type Pattern: Resolved across entire codebase
✅ Schema Consistency: ActivityLog, Task fields aligned
✅ Module Resolution: All import errors fixed
✅ ESLint: <500 total problems (from 608)
✅ Build: Success with minimal warnings
✅ Ready for: Session 8 (final polish & deployment prep)
```

---

## 💡 Pro Tips for Success

1. **Start with User Helpers** - Phase 1 is foundation for everything
2. **Test Helper Functions First** - Ensure they work before mass refactoring
3. **Use Search & Replace Wisely** - For `user.organizationId` → `organizationId`
4. **Commit After Each Phase** - Enables easy rollback if needed
5. **Document Unexpected Issues** - Help future sessions
6. **Don't Skip Verification** - Catch errors early
7. **Ask for Help if Stuck** - Better to ask than waste time
8. **Keep Prisma Schema Handy** - Reference for all type/enum questions
9. **Run Build Early** - Don't wait until end to test
10. **Stay Focused** - Goal is <30 errors, not perfection

---

## 🎖️ Session 7 Success Criteria Summary

| Metric | Start | Target | Stretch |
|--------|-------|--------|---------|
| TypeScript Errors | 87 | <30 | <20 |
| User.organizationId Issues | 30+ | 0 | 0 |
| Schema Consistency | Poor | Good | Excellent |
| Module Resolution | 9 errors | 0 | 0 |
| ESLint Problems | 608 | <500 | <400 |
| Production Build | Unknown | Success | Success |
| Code Quality | Good | Very Good | Excellent |

---

**Session 7 Ready** 🚀
**Let's achieve <30 TypeScript errors and resolve the User type pattern!**
**Estimated Time: 2-3 hours**
**Expected Outcome: 87 → <30 errors (65%+ reduction)**
