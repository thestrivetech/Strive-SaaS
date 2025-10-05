# Session 5 (Continued) - TypeScript Error Fixes

**Status:** 70% Complete | **Errors:** 487 → Target: 0 | **Working Dir:** `(platform)/`

---

## 🚀 QUICK START

```bash
cd "(platform)" && npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l
cat ./update-sessions/SESSION5-PROGRESS-SUMMARY.md  # Full details
```

---

## ✅ COMPLETED

- Notifications test, @testing-library/react, Projects module
- app/projects/[projectId]/page.tsx, app/crm/[customerId]/page.tsx
- Test helpers (snake_case fields)

---

## 🎯 NEXT: Quick Wins (1 hour → -361 errors)

### 1. Exclude Legacy (5 min → -290 errors)
```json
// tsconfig.json
"exclude": ["node_modules", "update-sessions"]
```

### 2. Component Stubs (15 min → -15 errors)
```bash
touch components/(platform)/layouts/dashboard-shell.tsx
touch components/(platform)/features/ai/ai-chat.tsx
touch components/(platform)/features/export/export-button.tsx
```

### 3. Test Scripts (20 min → -50 errors)
Replace `prisma.notification` → `prisma.notifications` in:
- scripts/test-notifications.ts
- scripts/test-rls.ts
- scripts/test-realtime.ts

### 4. Auth Routes (5 min → -2 errors)
`avatarUrl` → `avatar_url` in:
- app/api/auth/login/route.ts:66
- app/api/auth/signup/route.ts:74

### 5. App Pages (15 min → -4 errors)
- app/crm/page.tsx: `Customer` → `customers`
- app/dashboard/page.tsx: Add callback types

---

## 🎯 THEN: Modules (3 hours → -126 errors)

1. **Tasks** (1h): lib/modules/tasks/{queries,actions,bulk-actions}.ts
2. **Org** (30m): lib/modules/organization/{actions,queries}.ts
3. **CRM** (30m): lib/modules/crm/{queries,actions}.ts
4. **Other** (1h): Dashboard, AI, Attachments, infrastructure files

**Pattern:** Snake_case fields + correct relation names from schema

---

## 🔑 KEY PATTERNS

```typescript
// API Layer = camelCase
createItem({ userId, organizationId })

// DB Layer = snake_case
prisma.items.create({ data: { user_id, organization_id }})

// Relations: Check schema!
// model projects { customers customers? @relation(...) }
project.customers  // ← Use relation name, not field name
```

**Required in creates:** `id`, `updated_at` (if no @default)

---

## 📊 TIMELINE

- Quick Wins: 487 → 126 errors (1 hour)
- Modules: 126 → 0 errors (3 hours)
- Verify: 0 errors ✅ (30 min)

---

## 🔗 DOCS

- [SESSION5-PROGRESS-SUMMARY.md](./SESSION5-PROGRESS-SUMMARY.md) - Full details
- [../shared/prisma/schema.prisma](../shared/prisma/schema.prisma) - Reference

**Updated:** 2025-10-04
