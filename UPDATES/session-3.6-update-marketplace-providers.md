# Session 3.6: Update Marketplace Providers

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Replace mock data with Prisma queries in marketplace module providers.

---

## 📋 TASK (CONDENSED)

**Files to Update:**
- `lib/modules/marketplace/tools/queries.ts`
- `lib/modules/marketplace/tools/actions.ts`
- `lib/modules/marketplace/cart/queries.ts`
- `lib/modules/marketplace/cart/actions.ts`
- `lib/modules/marketplace/purchases/queries.ts`
- `lib/modules/marketplace/purchases/actions.ts`

**Pattern:**
```typescript
// ❌ OLD:
const tools = await mockToolsProvider.findMany();

// ✅ NEW:
const tools = await prisma.marketplace_tools.findMany({
  where: { status: 'ACTIVE' },
  include: { reviews: true }
});
```

**Requirements:**
- Remove all mock conditionals (`if (USE_MOCKS)`)
- Add `organizationId` filtering to purchases/cart
- Add RBAC checks to all actions
- Add subscription tier validation (GROWTH+ for advanced tools)
- Verify multi-tenancy on all queries
- Test all CRUD operations
- Run verification: `npm test -- lib/modules/marketplace`

**DO NOT report success unless:**
- All mock code removed
- All Prisma queries functional
- Multi-tenancy enforced
- RBAC checks in place
- Tests passing

---

**Next:** Session 3.7 - Update REID Providers
