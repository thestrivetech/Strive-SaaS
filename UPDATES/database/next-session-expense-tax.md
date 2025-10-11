# Expense-Tax Module - Complete Backend Integration (Session 2)

**Prepared:** 2025-10-10
**Previous Session:** `2025-10-10-expense-tax-schema-fixes.md`
**Status:** Ready to start

---

## 📋 Quick Context

**Last Session Achievements:**
- ✅ Fixed core expense CRUD (actions.ts, queries.ts)
- ✅ Updated dashboard to show real data
- ✅ Fixed API routes (summary, categories, main expenses route)
- ✅ Aligned all field names with production Prisma schema

**This Session Goal:** Fix remaining sub-modules and make form fully functional

---

## 🔴 CRITICAL: Schema Reference

**Use these for reference:**
```bash
# Schema documentation (500 tokens vs 18k for MCP!)
cat (platform)/prisma/SCHEMA-MODELS.md | grep -A 30 "## expenses"
cat (platform)/prisma/SCHEMA-MODELS.md | grep -A 30 "## receipts"
cat (platform)/prisma/SCHEMA-MODELS.md | grep -A 30 "## tax_estimates"
cat (platform)/prisma/SCHEMA-MODELS.md | grep -A 30 "## tax_reports"
```

**Key Schema Facts:**
- Expenses use `user_id` (NOT `created_by_id`)
- Expenses use `category_id` FK (NOT `category` string)
- Receipts in separate table (NOT `receipt_url` on expenses)
- Reports table is `tax_reports` (NOT `expense_reports`)
- Tax estimates use `tax_year` (NOT `year`)
- User relation is `user` (NOT `creator`)

---

## 📋 Tasks (Priority Order)

### 1. Fix Receipts Module ⚡ HIGH (30 min)

**Files:**
- `lib/modules/expenses/receipts/actions.ts` (4 errors)
- `lib/modules/expenses/receipts/queries.ts` (if exists)

**Type Errors:**
```
Line 94:  receipt_url doesn't exist on expenses
Line 140: receipt_url doesn't exist in select
Line 176: receipt_url doesn't exist in update
```

**What to fix:**
```typescript
// ❌ OLD (incorrect):
await prisma.expenses.update({
  where: { id: expenseId },
  data: { receipt_url: url, receipt_name: name }
});

// ✅ NEW (correct):
await prisma.receipts.create({
  data: {
    expense_id: expenseId,
    organization_id: orgId,
    file_name: name,
    file_url: url,
    file_type: type,
    file_size_bytes: size
  }
});
```

**Verification:** Upload a receipt, check `receipts` table in Prisma Studio

---

### 2. Fix Tax Reports Actions ⚡ HIGH (30 min)

**File:** `lib/modules/expenses/reports/actions.ts` (4 errors)

**Type Errors:**
```
Line 8:   Missing ExpenseReportInput type
Line 44:  'creator' doesn't exist (use 'user')
Line 89:  'expense_reports' table doesn't exist
Line 122: 'expense_reports' table doesn't exist
Line 131: 'expense_reports' table doesn't exist
```

**Steps:**
1. Create `lib/modules/expenses/reports/schemas.ts`:
   ```typescript
   export const TaxReportSchema = z.object({
     name: z.string(),
     template_type: z.nativeEnum(TaxReportType),
     tax_year: z.number().int(),
     // ... other fields
   });
   export type TaxReportInput = z.infer<typeof TaxReportSchema>;
   ```

2. Update all `expense_reports` → `tax_reports`
3. Update all `creator` → `user`

**Verification:** Generate a tax report, check `tax_reports` table

---

### 3. Fix Tax Estimates Module 📊 MEDIUM (30 min)

**Files:**
- `lib/modules/expenses/tax-estimates/actions.ts` (4 errors)
- `lib/modules/expenses/tax-estimates/queries.ts` (3 errors)

**Type Errors:**
```
actions.ts:9   - Missing TaxEstimateInput type
actions.ts:33  - 'year' field doesn't exist (use 'tax_year')
actions.ts:57  - Missing UpdateTaxEstimateInput type
actions.ts:80  - 'year' field doesn't exist

queries.ts:29  - 'creator' doesn't exist (use 'user')
queries.ts:38  - 'year' in orderBy (use 'tax_year')
queries.ts:56  - 'creator' doesn't exist (use 'user')
```

**Steps:**
1. Create `lib/modules/expenses/tax-estimates/schemas.ts`
2. Replace all `year` → `tax_year`
3. Replace all `creator` → `user`

**Verification:** Create tax estimate, check calculations work

---

### 4. Seed Expense Categories ⚡ HIGH (20 min)

**Problem:** Database has no categories, form dropdown won't work

**Create:** `scripts/expenses/seed-categories.ts`

```typescript
import { prisma } from '@/lib/database/prisma';

const systemCategories = [
  {
    name: 'Commission',
    code: 'COMMISSION',
    irs_category: 'Schedule C Line 10',
    color: '#3b82f6',
    icon: 'DollarSign',
    default_deductible: true
  },
  {
    name: 'Travel',
    code: 'TRAVEL',
    irs_category: 'Schedule C Line 24a',
    color: '#8b5cf6',
    icon: 'Plane',
    default_deductible: true
  },
  {
    name: 'Marketing',
    code: 'MARKETING',
    irs_category: 'Schedule C Line 8',
    color: '#ec4899',
    icon: 'Megaphone',
    default_deductible: true
  },
  {
    name: 'Office Supplies',
    code: 'OFFICE',
    irs_category: 'Schedule C Line 18',
    color: '#10b981',
    icon: 'Briefcase',
    default_deductible: true
  },
  {
    name: 'Utilities',
    code: 'UTILITIES',
    irs_category: 'Schedule C Line 25',
    color: '#f59e0b',
    icon: 'Zap',
    default_deductible: true
  },
  {
    name: 'Legal & Professional',
    code: 'LEGAL',
    irs_category: 'Schedule C Line 17',
    color: '#6366f1',
    icon: 'Scale',
    default_deductible: true
  },
  {
    name: 'Insurance',
    code: 'INSURANCE',
    irs_category: 'Schedule C Line 15',
    color: '#14b8a6',
    icon: 'Shield',
    default_deductible: true
  },
  {
    name: 'Repairs & Maintenance',
    code: 'REPAIRS',
    irs_category: 'Schedule C Line 21',
    color: '#f97316',
    icon: 'Wrench',
    default_deductible: true
  },
  {
    name: 'Meals & Entertainment',
    code: 'MEALS',
    irs_category: 'Schedule C Line 24b',
    color: '#ef4444',
    icon: 'Utensils',
    default_deductible: true,
    deduction_limit: 50 // Only 50% deductible
  },
  {
    name: 'Education & Training',
    code: 'EDUCATION',
    irs_category: 'Schedule C Line 27',
    color: '#06b6d4',
    icon: 'GraduationCap',
    default_deductible: true
  },
  {
    name: 'Software & Technology',
    code: 'SOFTWARE',
    irs_category: 'Schedule C Line 18',
    color: '#8b5cf6',
    icon: 'Laptop',
    default_deductible: true
  },
  {
    name: 'Other Expenses',
    code: 'OTHER',
    irs_category: 'Schedule C Line 27',
    color: '#6b7280',
    icon: 'MoreHorizontal',
    default_deductible: false
  },
];

async function seedCategories() {
  console.log('🌱 Seeding expense categories...');

  for (const category of systemCategories) {
    await prisma.expense_categories.upsert({
      where: { code: category.code },
      update: {},
      create: {
        ...category,
        is_system: true,
        organization_id: null, // System categories available to all
        is_active: true,
      },
    });
  }

  console.log('✅ Seeded', systemCategories.length, 'system categories');
}

seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
```

**Run:**
```bash
npx tsx scripts/expenses/seed-categories.ts
```

**Verification:** Check Prisma Studio - `expense_categories` should have 12 records

---

### 5. Create Categories List API ⚡ HIGH (20 min)

**Create:** `app/api/v1/expenses/categories/list/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user?.organization_members?.[0]?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const organizationId = user.organization_members[0].organization_id;

    // Fetch system categories + org-specific categories
    const categories = await prisma.expense_categories.findMany({
      where: {
        OR: [
          { is_system: true }, // System categories (available to all)
          { organization_id: organizationId }, // Org-specific categories
        ],
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        irs_category: true,
        default_deductible: true,
        deduction_limit: true,
        color: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
```

**Verification:**
```bash
curl http://localhost:3000/api/v1/expenses/categories/list
```

---

### 6. Update AddExpenseModal Form 📝 MEDIUM (20 min)

**File:** `components/real-estate/expense-tax/forms/AddExpenseModal.tsx`

**Changes:**

1. Add React Query to fetch categories:
```typescript
import { useQuery } from '@tanstack/react-query';

// Inside component:
const { data: categoriesData, isLoading: loadingCategories } = useQuery({
  queryKey: ['expense-categories'],
  queryFn: async () => {
    const res = await fetch('/api/v1/expenses/categories/list');
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },
});

const categories = categoriesData?.categories || [];
```

2. Update Select component:
```typescript
<Select
  onValueChange={(value) => form.setValue('category', value)}
  disabled={loadingCategories}
>
  <SelectTrigger className="dark:bg-gray-800 dark:text-white">
    <SelectValue placeholder={
      loadingCategories ? 'Loading categories...' : 'Select category'
    } />
  </SelectTrigger>
  <SelectContent>
    {categories.map((cat: any) => (
      <SelectItem key={cat.id} value={cat.id}>
        {cat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Verification:** Open form, dropdown should show 12 categories from database

---

### 7. Fix Test Files 🧪 LOW (15 min)

**Files:**
- `__tests__/integration/expense-tax/expense-workflow.test.ts`
- Others with expense test errors

**Changes:**
- Update mocks: `category` → `categoryId`
- Update mocks: `creator` → `user`
- Update field names to match current schema

**Skip if:** Time is limited, tests can be fixed later

---

## ✅ Verification Checklist

After completing all tasks:

```bash
# 1. Type check (should be 0 expense errors)
cd (platform)
npx tsc --noEmit 2>&1 | grep -i "expense" | wc -l

# 2. Database verification
npx prisma studio
# Check tables:
# - expense_categories: 12+ records
# - expenses: Can create new records
# - receipts: Uploads create records here
# - tax_estimates: Can create records
# - tax_reports: Can generate reports

# 3. API endpoints test
# GET /api/v1/expenses/categories/list (should return 12 categories)
# POST /api/v1/expenses (should create expense)
# GET /api/v1/expenses (should list expenses)

# 4. Frontend test
# Visit: /real-estate/expense-tax/expense-tax-dashboard
# - Dashboard shows real data
# - Click "Add Expense"
# - Dropdown shows 12 categories
# - Can create expense successfully
```

---

## 📊 Expected Results

**Type Errors:**
- Before: ~20 expense-related errors
- After: 0 errors

**Database:**
- expense_categories: 12 system records
- All CRUD operations work end-to-end

**Frontend:**
- Form dropdown loads real categories
- Can create expenses with real category IDs
- Receipts upload to separate table
- Dashboard shows accurate data

---

## 🚀 Session Start Commands

```bash
# Navigate
cd "(platform)"

# Check errors
npx tsc --noEmit 2>&1 | grep -i "expense" | head -30

# Review schema
cat prisma/SCHEMA-MODELS.md | grep -A 30 "## receipts"
cat prisma/SCHEMA-MODELS.md | grep -A 30 "## tax_reports"
cat prisma/SCHEMA-MODELS.md | grep -A 30 "## tax_estimates"
```

---

## 📝 Notes

- Focus on receipts first (most critical)
- Test each fix incrementally
- Use Prisma Studio to verify database changes
- Archive files errors can be ignored

**Estimated Time:** 2-3 hours total

---

**Ready to start!** 🚀
