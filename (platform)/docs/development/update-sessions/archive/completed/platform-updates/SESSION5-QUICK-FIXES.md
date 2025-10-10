# Session 5 - Quick Fix Reference

**Quick reference for fixing the ~125 TypeScript errors from Session 4 integration**

---

## 🚀 **TL;DR - What to Fix**

Session 4 completed **100% of security infrastructure**. Session 5 is just fixing compilation errors from integration changes.

---

## 📋 **Fix Patterns (Copy-Paste Ready)**

### Pattern 1: Function Signature Updates

**Find these patterns in `app/` directory:**

```typescript
// ❌ FIND & REPLACE - Pattern 1:
getProjects(organizationId, filters)
// WITH:
getProjects(filters)

// ❌ FIND & REPLACE - Pattern 2:
getProjectById(projectId, organizationId)
// WITH:
getProjectById(projectId)

// ❌ FIND & REPLACE - Pattern 3:
getCustomerById(customerId, organizationId)
// WITH:
getCustomerById(customerId)

// ❌ FIND & REPLACE - Pattern 4:
getUserTasks(userId, organizationId, filters)
// WITH:
getUserTasks(userId, filters)

// ❌ FIND & REPLACE - Pattern 5:
getTaskById(taskId, organizationId)
// WITH:
getTaskById(taskId)

// ❌ FIND & REPLACE - Pattern 6:
getProjectStats(organizationId)
// WITH:
getProjectStats()
```

---

### Pattern 2: Prisma Model Names (Test Files)

**Find these patterns in `__tests__/` directory:**

```typescript
// ❌ FIND & REPLACE in test files:
prisma.customer → prisma.customers
prisma.user → prisma.users
prisma.organization → prisma.organizations
prisma.organizationMember → prisma.organization_members
prisma.project → prisma.projects
prisma.task → prisma.tasks
prisma.notification → prisma.notifications
prisma.activityLog → prisma.activity_logs
prisma.aIConversation → prisma.ai_conversations
```

---

### Pattern 3: Prisma Type Imports

**Find these patterns in `components/` and `app/` directories:**

```typescript
// ❌ FIND:
import type { Customer } from '@prisma/client';
// ✅ REPLACE WITH:
import type { customers } from '@prisma/client';
// ✅ OR:
type Customer = Prisma.customersGetPayload<{}>;

// ❌ FIND:
import type { User } from '@prisma/client';
// ✅ REPLACE WITH:
import type { users } from '@prisma/client';
// ✅ OR:
type User = Prisma.usersGetPayload<{}>;

// ❌ FIND:
import type { Project } from '@prisma/client';
// ✅ REPLACE WITH:
import type { projects } from '@prisma/client';

// ❌ FIND:
import type { Organization } from '@prisma/client';
// ✅ REPLACE WITH:
import type { organizations } from '@prisma/client';

// ❌ FIND:
import type { Notification } from '@prisma/client';
// ✅ REPLACE WITH:
import type { notifications } from '@prisma/client';
```

---

### Pattern 4: Property Name Updates

**Some files use old property names (camelCase) instead of schema names (snake_case):**

```typescript
// ❌ OLD property access:
project.projectManager
project.customerId
project.startDate
project.dueDate
project.completionDate
project.createdAt
project.updatedAt

// ✅ NEW property access:
project.project_manager_id  // or project_manager relation
project.customer_id          // or customer relation
project.start_date
project.due_date
project.completion_date
project.created_at
project.updated_at
```

---

## 🎯 **Files to Fix (Prioritized)**

### 🔴 Priority 1: Critical (App Won't Run)

```bash
app/crm/page.tsx
app/crm/[customerId]/page.tsx
app/projects/page.tsx
app/projects/[projectId]/page.tsx
app/dashboard/page.tsx
```

**What to fix:** Function signature updates (remove `organizationId` argument)

---

### 🟡 Priority 2: High (Tests Won't Run)

```bash
__tests__/unit/lib/modules/crm/actions.test.ts
__tests__/unit/lib/modules/notifications/actions.test.ts
__tests__/database/tenant-isolation.test.ts
__tests__/utils/test-helpers.ts
```

**What to fix:** Prisma model name updates (`prisma.customer` → `prisma.customers`)

---

### 🟢 Priority 3: Medium (Type Safety)

```bash
components/(platform)/projects/create-project-dialog.tsx
components/(platform)/real-estate/crm/customer-actions-menu.tsx
components/(platform)/shared/navigation/notification-dropdown.tsx
lib/auth/user-helpers.ts
```

**What to fix:** Type import updates

---

### ⚪ Priority 4: Low (Type Assertions)

```bash
lib/database/prisma-middleware.ts
```

**What to fix:** Add `as any` type assertions for Prisma 6 extension compatibility

---

## 🔧 **Fix Commands (Automated)**

### Step 1: Function Signatures (App Files)

```bash
# Run these in the (platform) directory:

# Fix getProjects calls
find app -type f -name "*.tsx" -exec sed -i 's/getProjects(organizationId, /getProjects(/g' {} +

# Fix getCustomerById calls
find app -type f -name "*.tsx" -exec sed -i 's/getCustomerById(\([^,]*\), organizationId)/getCustomerById(\1)/g' {} +

# Fix getUserTasks calls
find app -type f -name "*.tsx" -exec sed -i 's/getUserTasks(\([^,]*\), organizationId, /getUserTasks(\1, /g' {} +

# Fix getProjectById calls
find app -type f -name "*.tsx" -exec sed -i 's/getProjectById(\([^,]*\), organizationId)/getProjectById(\1)/g' {} +

# Fix getProjectStats calls
find app -type f -name "*.tsx" -exec sed -i 's/getProjectStats(organizationId)/getProjectStats()/g' {} +
```

### Step 2: Prisma Model Names (Test Files)

```bash
# Run these in the (platform) directory:

# Fix Prisma model names in test files
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.customer\b/prisma.customers/g' {} +
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.user\b/prisma.users/g' {} +
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.organization\b/prisma.organizations/g' {} +
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.organizationMember\b/prisma.organization_members/g' {} +
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.notification\b/prisma.notifications/g' {} +
find __tests__ -type f -name "*.ts" -exec sed -i 's/prisma\.activityLog\b/prisma.activity_logs/g' {} +
```

**Note:** On Windows, use PowerShell equivalent or VS Code's find/replace across files.

---

## 🧪 **Testing Commands**

```bash
# Check remaining errors
npx tsc --noEmit 2>&1 | grep -c "error TS"

# Run security tests
npm test __tests__/database/tenant-isolation.test.ts

# Run all tests
npm test

# Build check
npm run build
```

---

## ✅ **Verification Checklist**

After each fix:

```bash
# 1. Check error count decreased
npx tsc --noEmit 2>&1 | wc -l

# 2. Check specific file is fixed
npx tsc --noEmit 2>&1 | grep "app/crm/page.tsx"

# 3. Verify no new errors introduced
git diff app/crm/page.tsx
```

---

## 🚨 **Common Mistakes to Avoid**

### ❌ DON'T:
- Change any files in `lib/database/` (except type assertions)
- Change any files in `lib/modules/*/queries.ts`
- Modify the security logic
- Add back `organizationId` parameters

### ✅ DO:
- Only remove `organizationId` from function calls
- Update Prisma model names in tests
- Fix type imports
- Add type assertions for Prisma 6 compatibility

---

## 📊 **Expected Progress**

| Phase | Fixes | Errors Reduced | Cumulative |
|-------|-------|----------------|------------|
| Start | - | - | ~125 errors |
| Phase 1 | Function sigs | -50 | ~75 errors |
| Phase 2 | Test files | -30 | ~45 errors |
| Phase 3 | Type imports | -20 | ~25 errors |
| Phase 4 | Type assertions | -15 | ~10 errors |
| Done | Misc fixes | -10 | **0 errors** ✅ |

---

## 🎯 **End Goal**

```bash
npx tsc --noEmit
# ✅ Expected output: No errors!

npm test
# ✅ Expected: All tests pass

npm run build
# ✅ Expected: Build succeeds
```

---

**Last Updated:** 2025-01-04
**Session:** 5 - Integration Fixes
**Estimated Time:** 2-4 hours
