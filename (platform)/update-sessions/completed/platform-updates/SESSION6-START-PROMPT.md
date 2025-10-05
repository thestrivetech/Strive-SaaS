# Session 7 - Complete TypeScript Error Resolution

**Current State:** 348 errors (down from 631)
**Goal:** Fix remaining errors → 0 errors
**Working Directory:** `(platform)/`
**Time Estimate:** 2-3 hours

---

## 📊 Session 6 Achievements ✅

**Schema Improvements:**
- ✅ Added `@default(cuid())` to all 23+ model IDs
- ✅ Added `@updatedAt` to all updated_at fields
- ✅ Added `Industry` enum + `organization_tool_configs` model
- ✅ Generated Prisma client v6.16.3

**Error Reduction:** 631 → 348 (283 errors fixed, 45% reduction)
- ✅ Fixed tsconfig (excluded update-sessions, chatbot)
- ✅ Created component stubs (dashboard-shell, export-button, ai-chat)
- ✅ Fixed auth routes (avatarUrl → avatar_url)
- ✅ Fixed test helpers (isActive → is_active)
- ✅ Fixed test scripts (3 files, plural model names)
- ✅ Fixed app pages (CRM, Dashboard)
- ✅ Fixed core modules (Tasks, Organization, CRM, Dashboard, Projects, Notifications)

**Reference:** [SCHEMA-IMPROVEMENT-STATUS.md](./SCHEMA-IMPROVEMENT-STATUS.md)

---

## 🎯 Remaining Work (348 errors)

### Error Pattern Analysis
```bash
# See current errors
cd "(platform)" && npx tsc --noEmit 2>&1 | head -50
```

**4 Main Patterns:**

1. **Import Fixes** (~40 errors)
   - `import { DashboardShell }` → `import DashboardShell` (default import)
   - Affects: ai/layout, crm/layout, dashboard/layout, projects/layout, settings/layout, tools/layout

2. **Field Naming** (~100 errors)
   - `estimatedHours` → `estimated_hours`
   - `fileName` → `file_name`, `fileSize` → `file_size`, etc.
   - Affects: app/projects/[projectId]/page.tsx, various components

3. **Missing Includes** (~50 errors)
   - Projects need: `.include({ tasks: true, customers: true, users: true })`
   - Check: lib/modules/projects/queries.ts

4. **Type Updates** (~158 errors)
   - `Customer` → `customers` (type imports)
   - Function signature mismatches
   - Prisma type references

---

## 🚀 Execution Plan

### Phase 1: Import Fixes (15 min → -40 errors)

**Read then batch edit these layouts:**
```typescript
// Pattern: Change named to default import
import { DashboardShell } from '@/components/(platform)/layouts/dashboard-shell'
// TO:
import DashboardShell from '@/components/(platform)/layouts/dashboard-shell'
```

**Files:**
- app/ai/layout.tsx
- app/crm/layout.tsx
- app/dashboard/layout.tsx
- app/projects/layout.tsx
- app/settings/layout.tsx
- app/tools/layout.tsx
- app/ai/page.tsx (AIChat)
- app/projects/page.tsx (ExportButton)

### Phase 2: Projects Page Fix (30 min → -30 errors)

**File:** `app/projects/[projectId]/page.tsx`

**Use Edit tool with replace_all for field names:**
- `estimatedHours` → `estimated_hours`
- `fileName` → `file_name`
- `fileSize` → `file_size`
- `mimeType` → `mime_type`
- `createdAt` → `created_at`

**Add missing includes in lib/modules/projects/queries.ts:**
```typescript
include: {
  tasks: true,
  customers: true,
  users: true
}
```

### Phase 3: Remaining Modules (1 hour → -100 errors)

**Use replace_all pattern for each module:**

1. **Read file** with Read tool
2. **Batch replace** with Edit tool replace_all=true:
   - `prisma.{singular}` → `prisma.{plural}`
   - `Prisma.{Singular}GetPayload` → `Prisma.{plural}GetPayload`
   - `{camelCase}` → `{snake_case}` in where/data clauses

**Modules to fix:**
- lib/modules/attachments/
- lib/modules/ai/
- lib/modules/appointments/
- Any remaining with errors

### Phase 4: Type Imports (30 min → -50 errors)

**Global pattern fixes:**
```typescript
// Find and replace in affected files
import type { Customer } from '@prisma/client'
// TO:
import type { customers } from '@prisma/client'
```

**Check files with:**
```bash
npx tsc --noEmit 2>&1 | grep "has no exported member"
```

### Phase 5: Final Cleanup (30 min → -128 errors)

1. **Run tsc** to find remaining errors
2. **Address edge cases** one by one
3. **Run tests:** `npm test`
4. **Build check:** `npm run build`

---

## ✅ Success Criteria

- [ ] 0 TypeScript errors: `npx tsc --noEmit`
- [ ] All tests pass: `npm test`
- [ ] Production build works: `npm run build`
- [ ] No console errors in dev: `npm run dev`

---

## 🔧 Commands Reference

```bash
# Working directory
cd "(platform)"

# Check errors
npx tsc --noEmit 2>&1 | grep -c "error TS"

# Show first 50 errors
npx tsc --noEmit 2>&1 | head -50

# Run tests
npm test

# Build check
npm run build
```

---

## 📝 Outstanding Tasks from Session 6

**Low priority, complete if time allows:**

1. **Run migration** (when DIRECT_URL configured):
   ```bash
   npx prisma migrate dev --name add-auto-defaults-and-tool-configs --schema=../shared/prisma/schema.prisma
   ```

2. **Check remaining test files:**
   - `__tests__/database/tenant-isolation.test.ts` (for manual IDs)
   - `__tests__/integration/crm-workflow.test.ts` (for manual IDs)

---

**Session 7 Goal:** 348 → 0 errors
**Last Updated:** 2025-10-04
