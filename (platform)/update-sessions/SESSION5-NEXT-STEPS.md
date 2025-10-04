# 🎯 Session 5 Next Steps - Quick Start Guide

**Current Status:** 35% Complete (~69/404 errors fixed)
**Remaining:** ~335 errors (mainly snake_case conversions)

---

## 🚀 **START HERE - Next Session**

### Step 1: Read Context (2 min)
```bash
# Read this file first:
C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\SESSION5-PROGRESS-SUMMARY.md

# Check current error count:
cd "(platform)"
npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l
```

### Step 2: Continue Phase 4 - Snake_case Conversion (2 hours)

**Strategy:** Batch edit files using `replace_all: true`

#### File 1: `__tests__/integration/crm-workflow.test.ts` (~38 errors)
```typescript
// Run these Edit commands with replace_all: true
1. organizationId → organization_id
2. createdAt → created_at
3. updatedAt → updated_at
4. assignedToId → assigned_to

// Also fix where clauses manually:
where: { organizationId: org.id } → where: { organization_id: org.id }
orderBy: { createdAt: 'desc' } → orderBy: { created_at: 'desc' }
include: { assignedTo: true } → include: { assigned_to: true }
```

#### File 2: `__tests__/unit/lib/modules/crm/actions.test.ts` (~10 errors)
```typescript
// Replace:
resourceType → resource_type
resourceId → resource_id
userId → user_id
```

#### File 3: `__tests__/unit/lib/modules/notifications/actions.test.ts` (~20 errors)
```typescript
// Replace:
userId → user_id
organizationId → organization_id

// Where clauses:
data: { userId: ... } → data: { user_id: ... }
```

#### File 4: `app/projects/[projectId]/page.tsx` (~20 errors)
```typescript
// Replace:
startDate → start_date
dueDate → due_date
completionDate → completion_date
createdAt → created_at
updatedAt → updated_at
projectManager → project_manager (for relation access)
```

---

## 📝 **BATCH EDIT TEMPLATE**

Copy this pattern for each file:

```typescript
// 1. Open file
Read("C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS\\(platform)\\__tests__\\integration\\crm-workflow.test.ts")

// 2. Replace property names (run separately)
Edit({
  file_path: "C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS\\(platform)\\__tests__\\integration\\crm-workflow.test.ts",
  old_string: "organizationId",
  new_string: "organization_id",
  replace_all: true
})

Edit({
  file_path: "C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS\\(platform)\\__tests__\\integration\\crm-workflow.test.ts",
  old_string: "createdAt",
  new_string: "created_at",
  replace_all: true
})

Edit({
  file_path: "C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS\\(platform)\\__tests__\\integration\\crm-workflow.test.ts",
  old_string: "updatedAt",
  new_string: "updated_at",
  replace_all: true
})

Edit({
  file_path: "C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS\\(platform)\\__tests__\\integration\\crm-workflow.test.ts",
  old_string: "assignedToId",
  new_string: "assigned_to",
  replace_all: true
})

// 3. Check errors reduced
Bash("cd \"(platform)\" && npx tsc --noEmit 2>&1 | grep \"crm-workflow\" | wc -l")
```

---

## 🔧 **PROPERTY NAME CHEAT SHEET**

### Test Files:
| Replace This | With This |
|--------------|-----------|
| `organizationId` | `organization_id` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `assignedToId` | `assigned_to` |
| `resourceType` | `resource_type` |
| `resourceId` | `resource_id` |
| `userId` | `user_id` |

### App Pages:
| Replace This | With This |
|--------------|-----------|
| `customerId` | `customer_id` |
| `projectManagerId` | `project_manager_id` |
| `startDate` | `start_date` |
| `dueDate` | `due_date` |
| `completionDate` | `completion_date` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### Where Clauses (Manual Fix):
```typescript
// Before
where: { organizationId: org.id }
orderBy: { createdAt: 'desc' }
include: { assignedTo: true }

// After
where: { organization_id: org.id }
orderBy: { created_at: 'desc' }
include: { assigned_to: true }
```

---

## ✅ **FILE-BY-FILE CHECKLIST**

### Phase 4: Snake_case Conversion
- [ ] `__tests__/integration/crm-workflow.test.ts` (38 errors)
  - [ ] Replace `organizationId` → `organization_id`
  - [ ] Replace `createdAt` → `created_at`
  - [ ] Replace `updatedAt` → `updated_at`
  - [ ] Replace `assignedToId` → `assigned_to`
  - [ ] Fix where clauses manually
  - [ ] Fix include clauses manually

- [ ] `__tests__/unit/lib/modules/crm/actions.test.ts` (10 errors)
  - [ ] Replace `resourceType` → `resource_type`
  - [ ] Replace `userId` → `user_id`

- [ ] `__tests__/unit/lib/modules/notifications/actions.test.ts` (20 errors)
  - [ ] Replace `userId` → `user_id`
  - [ ] Replace `organizationId` → `organization_id`
  - [ ] Fix data objects manually

- [ ] `app/projects/[projectId]/page.tsx` (20 errors)
  - [ ] Replace `startDate` → `start_date`
  - [ ] Replace `dueDate` → `due_date`
  - [ ] Replace `completionDate` → `completion_date`
  - [ ] Replace `createdAt` → `created_at`
  - [ ] Replace `updatedAt` → `updated_at`
  - [ ] Fix relation access (customer, projectManager)

### Phase 5: Relations & Includes
- [ ] Check `lib/modules/projects/queries.ts` relation definitions
- [ ] Update `getProjectById()` include to match schema
- [ ] Fix `app/projects/[projectId]/page.tsx` relation access
- [ ] Verify customer and projectManager are included

### Phase 6: Type Imports & Components
- [ ] `app/crm/page.tsx` - `Customer` → `customers`
- [ ] `app/projects/[projectId]/page.tsx` - Type imports
- [ ] Handle missing components (create stubs or locate)
- [ ] Update @testing-library/react imports

---

## 🎯 **SUCCESS CRITERIA**

### Completion Checks:
```bash
# 1. Zero TypeScript errors
cd "(platform)"
npx tsc --noEmit
# Expected: "Found 0 errors"

# 2. All tests pass
npm test
# Expected: All tests passing

# 3. Count remaining errors
npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l
# Expected: 0
```

### Quality Checks:
- [ ] No runtime errors in development
- [ ] Security infrastructure intact (from Session 4)
- [ ] All tenant isolation working
- [ ] All RBAC checks passing

---

## 📊 **PROGRESS TRACKING**

**Track your progress:**
```bash
# Initial count
echo "Starting errors: $(cd '(platform)' && npx tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l)"

# After each file
echo "Errors after [filename]: $(cd '(platform)' && npx tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l)"

# Final count
echo "Final errors: $(cd '(platform)' && npx tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l)"
```

**Use TodoWrite to track:**
```typescript
TodoWrite([
  { content: "Fix crm-workflow.test.ts snake_case", status: "in_progress", activeForm: "..." },
  { content: "Fix crm actions.test.ts", status: "pending", activeForm: "..." },
  // ... etc
])
```

---

## 🚨 **IMPORTANT NOTES**

### Don't Forget:
1. **Use `replace_all: true`** for batch replacements
2. **Where clauses need manual fixes** - can't use replace_all on objects
3. **Include clauses need manual fixes** - relation names in objects
4. **Test after each file** - verify error count decreasing
5. **Commit incrementally** - don't wait until all done

### Watch Out For:
- **False positives** - some "Id" might not be property names
- **Comments** - may have camelCase text (okay to replace)
- **String literals** - check if replacement affects SQL/display text
- **Relation vs Field** - `assignedTo` relation vs `assigned_to` field

---

## 📞 **STUCK? DEBUG COMMANDS**

### See specific errors:
```bash
# Snake_case errors
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "organizationId\|createdAt\|updatedAt"

# Missing members
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "has no exported member"

# Missing modules
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "Cannot find module"

# Specific file errors
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "crm-workflow.test.ts"
```

### Verify a fix worked:
```bash
# Before
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "crm-workflow" | wc -l
# Do edits...
# After
cd "(platform)" && npx tsc --noEmit 2>&1 | grep "crm-workflow" | wc -l
# Should be lower!
```

---

**Last Updated:** 2025-01-04
**Resume From:** Phase 4 - Snake_case conversion in test files
**Estimated Time to Complete:** 2-3 hours

**Good luck! 🚀**
