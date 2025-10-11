# Session 3.8: Update Expense-Tax Providers

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1.5 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Replace mock data with Prisma queries in Expense & Tax module.

---

## 📋 TASK (CONDENSED)

**Files to Update:**
- `lib/modules/expense-tax/expenses/queries.ts`
- `lib/modules/expense-tax/expenses/actions.ts`
- `lib/modules/expense-tax/categories/queries.ts`
- `lib/modules/expense-tax/tax-estimates/queries.ts`
- `lib/modules/expense-tax/receipts/queries.ts`
- `lib/modules/expense-tax/receipts/actions.ts`

**Pattern:**
```typescript
// ❌ OLD:
const expenses = mockExpenseProvider.findMany();

// ✅ NEW:
const expenses = await prisma.expenses.findMany({
  where: {
    organization_id: organizationId,
    date: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    category: true,
    receipts: true
  }
});
```

**Requirements:**
- Remove all mock conditionals
- Add `organizationId` filtering
- Implement receipt upload to Supabase Storage
- Add OCR text extraction (placeholder or integrate)
- Tax year filtering
- QuickBooks sync fields (populate on export)
- Test expense tracking and tax reports

**DO NOT report success unless:**
- All mock code removed
- Receipt uploads functional
- Multi-tenancy enforced
- Tests passing

---

**Next:** Session 3.9 - Update CMS Campaign Providers
