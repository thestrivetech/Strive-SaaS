# Session 3.7: Update REID Providers

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Replace mock data with Prisma queries in REID Analytics module.

---

## 📋 TASK (CONDENSED)

**Files to Update:**
- `lib/modules/reid/market-data/queries.ts`
- `lib/modules/reid/demographics/queries.ts`
- `lib/modules/reid/schools/queries.ts`
- `lib/modules/reid/roi/queries.ts`
- `lib/modules/reid/alerts/queries.ts`
- `lib/modules/reid/reports/queries.ts`
- `lib/modules/reid/ai-profiles/queries.ts`

**Pattern:**
```typescript
// ❌ OLD:
const marketData = mockReidProvider.getMarketData(zipCode);

// ✅ NEW:
const marketData = await prisma.reid_market_data.findMany({
  where: {
    organization_id: organizationId,
    zip_code: zipCode
  },
  orderBy: { date: 'desc' },
  take: 30 // Last 30 days
});
```

**Requirements:**
- Remove all mock conditionals
- Add `organizationId` filtering to ALL queries
- Add geographic search indexes (zip, city, state)
- Implement time-series queries for trends
- Add RBAC checks (GROWTH+ tier required)
- External API integration placeholders (MLS data)
- Test all analytics pages

**DO NOT report success unless:**
- All mock code removed
- Multi-tenancy enforced
- Tier validation in place
- Tests passing

---

**Next:** Session 3.8 - Update Expense-Tax Providers
