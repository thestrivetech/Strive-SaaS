# Session 8: Schema Fixes & Error Resolution - Execution Plan

**Status**: 🔵 Ready to Execute
**Prerequisites**: Types folder reorganized ✅ (84 errors baseline)
**Goal**: 84 errors → <30 errors (65%+ reduction)
**Estimated Time**: 3-3.5 hours

---

## 📊 Current State

### Error Baseline
- **Total TypeScript Errors**: 84 (was 85 before types reorg)
- **ESLint Status**: 207 errors, 401 warnings (unchanged)
- **Build Status**: Failing due to TypeScript errors

### Recent Changes
✅ **Types Reorganization Completed** (just finished):
- Organized types by domain (shared/web/platform/chatbot)
- Created 17 new type files + 5 barrel exports
- Updated 5 import statements
- **Impact**: -1 error, 0 breaking changes

### What's Left from Session 8
🔴 **Not Started Yet**:
- Phase 1: Schema field mismatch fixes (-13 to -15 errors)
- Phase 2: Module resolution fixes (-9 errors)
- Phase 3: Type mismatch fixes (-19 to -22 errors)
- Phase 4: ESLint critical fixes (-50+ ESLint errors)
- Phase 6: Final verification & build test

---

## 🎯 Session Objectives

### Primary Goals
1. **Fix schema field mismatches** → -13 to -15 errors
   - ActivityLog: entityType/entityId → resourceType/resourceId
   - AIConversation: messages → conversationData

2. **Resolve module resolution issues** → -9 errors
   - Fix "Cannot find module" errors in scripts and lib files

3. **Fix type mismatches** → -19 to -22 errors
   - TaskWithAssignee missing properties
   - Test fixtures enum/type issues
   - ROI Calculator type issues
   - Scattered validation and util errors

4. **ESLint critical fixes** → -50+ ESLint errors
   - Fix Supabase types file (recursive Json type)
   - Fix scripts 'any' types
   - Fix high-impact files with 5+ warnings

5. **Achieve production build success**

### Success Criteria
- ✅ TypeScript errors reduced to <30 total (from 84)
- ✅ ActivityLog/AIConversation schema alignment complete
- ✅ All module imports resolved
- ✅ Production build succeeds
- ✅ ESLint errors reduced to <150

---

## 📋 Detailed Task List

### Phase 1: Schema Field Mismatch Fixes (40 mins) 🔴 NOT STARTED

**Expected Impact**: -13 to -15 errors

#### Task 1.1: Fix ActivityLog Field Names (25 mins)
**Problem**: Code uses `entityType/entityId`, schema has `resourceType/resourceId`

**Files to Update**:
1. [ ] Search all occurrences: `grep -r "entityType" lib/ --include="*.ts"`
2. [ ] Update `lib/modules/tasks/bulk-actions.ts` (4 locations):
   - Line ~72: BULK_UPDATE_STATUS
   - Line ~155: BULK_ASSIGN
   - Line ~223: BULK_UPDATE_PRIORITY
   - Line ~287: BULK_DELETE
3. [ ] Update `lib/modules/ai/actions.ts` (1 location, line ~163)
4. [ ] Search and fix any remaining files

**Pattern to Apply**:
```typescript
// Before (WRONG)
await prisma.activityLog.create({
  data: {
    userId: user.id,
    organizationId,
    action: 'BULK_UPDATE_STATUS',
    entityId: validated.taskIds.join(','),  // ❌
    entityType: 'Task',  // ❌
  },
});

// After (CORRECT)
await prisma.activityLog.create({
  data: {
    userId: user.id,
    organizationId,
    action: 'BULK_UPDATE_STATUS',
    resourceType: 'Task',  // ✅
    resourceId: validated.taskIds.join(','),  // ✅
    details: {
      taskIds: validated.taskIds,  // ✅ Keep in details too
    } as Prisma.JsonObject,
  },
});
```

**Verification**: `npx tsc --noEmit | grep -c "error TS"` → Should be ~71 (was ~84, fixed ~13)

#### Task 1.2: Fix AIConversation Field Names (15 mins)
**Problem**: Code uses `messages`, schema has `conversationData`

**File to Update**: `lib/modules/ai/actions.ts`

**Lines to Fix**:
1. [ ] Line 84-95: Reading messages
2. [ ] Line 124-138: Updating messages (existing conversation)
3. [ ] Line 142-153: Creating with messages (new conversation)
4. [ ] Line 206-214: createConversation function

**Pattern to Apply**:
```typescript
// Before (WRONG)
if (conversation && conversation.messages) {
  const previousMessages = conversation.messages as Prisma.JsonArray;
}

// After (CORRECT)
if (conversation && conversation.conversationData) {
  const previousMessages = conversation.conversationData as Prisma.JsonArray;
}

// Update writes
await prisma.aIConversation.update({
  where: { id: conversationId },
  data: {
    conversationData: [...currentMessages, newMessage],  // ✅ Not 'messages'
    updatedAt: new Date(),
  },
});
```

**Verification**: `npx tsc --noEmit | grep "ai/actions.ts"` → Should be 0 errors

---

### Phase 2: Module Resolution Fixes (30 mins) 🔴 NOT STARTED

**Expected Impact**: -9 errors

#### Task 2.1: Identify Module Resolution Errors (5 mins)
1. [ ] Run: `npx tsc --noEmit 2>&1 | grep "error TS2307" > module-errors.txt`
2. [ ] Review all TS2307 "Cannot find module" errors
3. [ ] Group by file and module name

**Expected Files with Errors**:
- `lib/chatbot-iframe-communication.ts` (5 errors) - likely type imports
- `scripts/test-realtime.ts` (2 errors) - likely path issues
- `hooks/use-chat.ts` (2 errors) - likely dependency issues

#### Task 2.2: Fix Import Path Errors (20 mins)
1. [ ] Check each import path in error messages
2. [ ] Verify file exists: `ls app/lib/[path]`
3. [ ] Fix incorrect `@/` imports
4. [ ] Add missing type declarations if needed

**Common Fixes**:
```typescript
// Fix 1: Correct @/ imports
// Before: import { prisma } from '@/lib/database/prisma';
// After:  import { prisma } from '@/lib/prisma';

// Fix 2: Add type declarations
// Create: app/types/some-external-lib.d.ts
declare module 'some-external-lib' {
  export function someFunction(): void;
}
```

#### Task 2.3: Verification (5 mins)
1. [ ] Run: `npx tsc --noEmit | grep "error TS2307" | wc -l`
2. [ ] Should be 0 (was 9)
3. [ ] Total errors should be ~62 (was ~71, fixed ~9)

---

### Phase 3: Type Mismatch Fixes (60 mins) 🔴 NOT STARTED

**Expected Impact**: -19 to -22 errors

#### Task 3.1: Fix Test Fixtures (15 mins)
**File**: `__tests__/fixtures/projects.ts`

1. [ ] Check errors: `npx tsc --noEmit | grep "__tests__/fixtures/projects.ts"`
2. [ ] Fix enum values (TaskPriority → Priority)
3. [ ] Add missing required fields
4. [ ] Use correct Prisma imports

**Pattern**:
```typescript
import { ProjectStatus, TaskStatus, Priority } from '@prisma/client';

export const testProjects = {
  activeProject: {
    name: 'Test Project',
    status: ProjectStatus.ACTIVE,  // ✅ Correct enum
    priority: Priority.HIGH,        // ✅ Not TaskPriority
    organizationId: 'test-org-id',  // ✅ Add if required
  },
};
```

**Verification**: 0 errors in fixtures file

#### Task 3.2: Fix TaskWithAssignee Type (10 mins)
**Files**: `components/features/tasks/task-list.tsx` and related

1. [ ] Check TaskWithAssignee definition in `lib/modules/tasks/queries.ts`
2. [ ] Ensure all queries include `assignedTo` relation
3. [ ] Update components using TaskWithAssignee

**Fix**:
```typescript
const tasks = await prisma.task.findMany({
  where: { projectId },
  include: {
    assignedTo: {  // ✅ Must include
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  },
});
```

**Verification**: 0 errors related to TaskWithAssignee

#### Task 3.3: Fix ROI Calculator Types (10 mins)
**File**: `components/ui/roi-calculator.tsx`

1. [ ] Check errors: `npx tsc --noEmit | grep "roi-calculator"`
2. [ ] Add type annotations to useState
3. [ ] Add interface for props
4. [ ] Add types to event handlers

**Pattern**:
```typescript
// Add type annotations
const [value, setValue] = useState<number>(0);

// Add interface
interface ROICalculatorProps {
  initialValue?: number;
  onCalculate?: (result: number) => void;
}

// Type event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(Number(e.target.value));
};
```

**Verification**: 0 errors in roi-calculator.tsx

#### Task 3.4: Fix Scattered Type Errors (25 mins)
**Files**: Multiple files with 2-5 errors each

Priority order (highest impact first):
1. [ ] `lib/chatbot-iframe-communication.ts` (5 errors) - 10 mins
2. [ ] `lib/realtime/use-realtime.ts` (3 errors) - 5 mins
3. [ ] `lib/validation.ts` (3 errors) - 5 mins
4. [ ] `lib/rate-limit.ts` (2 errors) - 2 mins
5. [ ] `lib/pdf-generator-helpers.ts` (2 errors) - 3 mins

**Strategy**: Fix file by file, validate after each

**Verification**: Total errors ~40 (was ~62, fixed ~22)

---

### Phase 4: ESLint Critical Fixes (30 mins) 🔴 NOT STARTED

**Expected Impact**: -50+ ESLint errors

#### Task 4.1: Fix Supabase Types File (5 mins)
**File**: `app/types/supabase.ts` (Lines 15-18, 4 errors)

**Fix**:
```typescript
// Before (WRONG)
export type Json = string | number | boolean | null | { [key: string]: any } | any[];

// After (CORRECT - Recursive)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }  // ✅ Recursive
  | Json[];                  // ✅ Array of Json
```

**Verification**: `npx eslint types/supabase.ts` → 0 errors

#### Task 4.2: Fix Scripts 'any' Types (15 mins)
**Files**:
- `scripts/verify-database-config.ts` (8 errors)
- `scripts/generate-email-previews.ts` (1 error)

**Pattern**:
```typescript
// Before (WRONG)
const result: any = await prisma.$queryRaw`...`;

// After (CORRECT)
interface QueryResult {
  count: number;
  [key: string]: unknown;
}
const result = await prisma.$queryRaw<QueryResult[]>`...`;
```

**Verification**: `npx eslint scripts/ --ext .ts` → <5 errors

#### Task 4.3: Fix High-Impact Files (10 mins)
1. [ ] Find top offenders: `npx eslint . --ext .ts,.tsx --format json | jq '.[] | select(.messages | length > 5) | .filePath' | head -10`
2. [ ] Focus on files with 5+ warnings
3. [ ] Apply common fixes:
   - Prefix unused variables with `_`
   - Remove truly unused code
   - Add explicit types where inferred as `any`

**Verification**: `npx eslint . --ext .ts,.tsx` → <550 total problems (was 608)

---

### Phase 5: Final Verification & Build (20 mins) 🔴 NOT STARTED

#### Task 5.1: Complete Type Check (5 mins)
1. [ ] Run: `npx tsc --noEmit`
2. [ ] Count errors: `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`
3. [ ] **Target**: <30 errors (stretch: <20)

#### Task 5.2: Generate Error Analysis (5 mins)
```bash
npx tsc --noEmit 2>&1 | grep "error TS" > session8-errors.txt
cat session8-errors.txt | cut -d'(' -f1 | sort | uniq -c | sort -rn > errors-by-file.txt
cat session8-errors.txt | grep -o "error TS[0-9]*" | sort | uniq -c | sort -rn > errors-by-type.txt
```

#### Task 5.3: Test Production Build (5 mins)
```bash
cd app
rm -rf .next
npm run build
echo $?  # Should be 0 for success
```

#### Task 5.4: Run ESLint Check (3 mins)
```bash
npx eslint . --ext .ts,.tsx
npx eslint . --ext .ts,.tsx 2>&1 | grep "✖" | tail -1
```
**Target**: <500 total problems (from 608)

#### Task 5.5: Document Final State (2 mins)
- Starting errors: 84
- Ending errors: <30 target
- Errors fixed: 55+
- Build status: Success/Failure
- Create Session 8 Summary document

---

## 🔄 Fallback Strategies

### If Schema Fixes Block Progress

**Fallback A**: Temporary type assertions
```typescript
const log = await prisma.activityLog.create({
  data: {
    resourceType: 'Task',
    resourceId: taskId,
  } as any,  // ⚠️ Temporary
});
```

**Fallback B**: Update schema to match code (if easier)
```prisma
model ActivityLog {
  entityType String @map("resource_type")  // Add alias
  entityId   String @map("resource_id")
}
```
Then: `npx prisma migrate dev --name add_entity_aliases`

### If Module Resolution Persists

**Clear caches**:
```bash
rm -rf .next node_modules/.cache .tsbuildinfo
npm install
npx prisma generate
```

### If Build Fails

1. Comment out problematic imports
2. Build successfully
3. Uncomment and fix one by one
4. Check circular dependencies: `npx madge --circular --extensions ts,tsx app/`

---

## 📊 Success Metrics

### Must Achieve (Session Success)
- [ ] TypeScript errors <30 (from 84) → 65%+ reduction
- [ ] Schema consistency achieved (ActivityLog + AIConversation)
- [ ] Module resolution complete (0 TS2307 errors)
- [ ] Production build succeeds

### Should Achieve (Bonus Goals)
- [ ] TypeScript errors <25
- [ ] ESLint errors <150
- [ ] All test fixtures typed correctly
- [ ] Zero `any` types in new code

### Could Achieve (Stretch Goals)
- [ ] TypeScript errors <20
- [ ] ESLint errors <100
- [ ] 100% type coverage in action files
- [ ] Performance optimizations identified

---

## 🎯 Priority Order

### Critical Path (Must Complete) - 110 mins
1. **Phase 1**: Schema fixes (40 mins) → -13 errors
2. **Phase 2**: Module resolution (30 mins) → -9 errors
3. **Phase 3**: Type mismatches (40 mins) → -19 errors

**After Critical Path**: 84 → ~43 errors ✅ On track for <30

### High Priority (Should Complete) - 30 mins
4. **Phase 4**: ESLint fixes (30 mins) → -50 ESLint errors

### Verification (Must Complete) - 20 mins
5. **Phase 5**: Build & verification (20 mins) → Confirm success

**Total Time**: ~3 hours for complete session

---

## 📚 Quick Reference

### Key Files to Modify
- `lib/modules/tasks/bulk-actions.ts` (ActivityLog fixes)
- `lib/modules/ai/actions.ts` (ActivityLog + AIConversation fixes)
- `__tests__/fixtures/projects.ts` (enum fixes)
- `components/ui/roi-calculator.tsx` (type annotations)
- `types/supabase.ts` (recursive Json type)
- Scripts: `verify-database-config.ts`, `generate-email-previews.ts`

### Prisma Schema Reference
```prisma
model ActivityLog {
  resourceType   String   @map("resource_type")  // NOT entityType
  resourceId     String?  @map("resource_id")    // NOT entityId
}

model AIConversation {
  conversationData Json   @map("conversation_data")  // NOT messages
  aiModel          AIModel @default(OPENAI_GPT4)     // Check if 'provider' exists
}
```

### Useful Commands
```bash
# Type checking
npx tsc --noEmit
npx tsc --noEmit 2>&1 | grep -c "error TS"

# Search for patterns
grep -r "entityType" lib/ --include="*.ts"
grep -r "messages" lib/modules/ai --include="*.ts"

# ESLint
npx eslint . --ext .ts,.tsx

# Build
npm run build

# Prisma
npx prisma generate
```

---

## 🚀 Getting Started

### Before Starting:
1. [ ] Read this execution plan
2. [ ] Verify current error count: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
3. [ ] Expected: 84 errors (after types reorg)
4. [ ] Optional: Create branch: `git checkout -b session-8-schema-fixes`
5. [ ] Have Prisma schema open: `app/prisma/schema.prisma`

### During Session:
1. [ ] Follow phases in order (1 → 2 → 3 → 4 → 5)
2. [ ] Verify after each phase with `npx tsc --noEmit`
3. [ ] Commit after each major phase completion
4. [ ] Document any unexpected issues
5. [ ] If stuck >15 mins, move to next and circle back

### After Session:
1. [ ] Run full verification suite
2. [ ] Test production build
3. [ ] Create Session 8 summary document
4. [ ] Celebrate achieving <30 errors! 🎉

---

## 🎯 Expected Final State

After Session 8 completion:

```
✅ TypeScript Errors: 84 → <30 (target) or <25 (stretch)
✅ Schema Consistency: All field names aligned
✅ Module Resolution: All imports working
✅ ESLint: <500 total problems (from 608)
✅ Build: Success with minimal warnings
✅ Ready for: Production deployment preparation
```

---

**Session 8 Ready to Execute** 🚀
**Estimated Time**: 3-3.5 hours
**Expected Outcome**: 84 → <30 errors (65%+ reduction) + production build success
