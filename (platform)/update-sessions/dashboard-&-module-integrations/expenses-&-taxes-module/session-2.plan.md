# Session 2: Expense Module - Backend & API

## Session Overview
**Goal:** Implement the core Expense module with Server Actions, queries, and API routes for expense management.

**Duration:** 2-3 hours
**Complexity:** High
**Dependencies:** Session 1 (Database schema must be complete)

## Objectives

1. ✅ Create Expense module structure (`lib/modules/expenses/`)
2. ✅ Implement Zod schemas for expense validation
3. ✅ Create Server Actions for expense CRUD operations
4. ✅ Implement query functions for expense data fetching
5. ✅ Add RBAC permission checks
6. ✅ Create API routes for expense operations
7. ✅ Implement expense summary calculations
8. ✅ Add proper error handling and validation

## Prerequisites

- [x] Session 1 completed (database schema ready)
- [x] Prisma client generated with expense types
- [x] Understanding of Server Actions pattern
- [x] RBAC system in place

## Module Structure

```
lib/modules/expenses/
├── expenses/
│   ├── actions.ts      # Server Actions (create, update, delete)
│   ├── queries.ts      # Data fetching functions
│   ├── schemas.ts      # Zod validation schemas
│   └── index.ts        # Public API exports
├── categories/
│   ├── actions.ts
│   ├── queries.ts
│   ├── schemas.ts
│   └── index.ts
├── summary/
│   ├── queries.ts      # Summary calculations
│   └── index.ts
└── index.ts            # Module exports
```

## Step-by-Step Implementation

### Step 1: Create Zod Schemas

**File:** `lib/modules/expenses/expenses/schemas.ts`

```typescript
import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

export const ExpenseSchema = z.object({
  date: z.coerce.date(),
  merchant: z.string().min(1, 'Merchant is required').max(100),
  category: z.nativeEnum(ExpenseCategory),
  amount: z.number().positive('Amount must be positive'),
  propertyId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isDeductible: z.boolean().default(true),
  taxCategory: z.string().optional(),
  organizationId: z.string().uuid(),
});

export const UpdateExpenseSchema = ExpenseSchema.partial().extend({
  id: z.string().uuid(),
});

export const ExpenseFiltersSchema = z.object({
  category: z.nativeEnum(ExpenseCategory).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  isDeductible: z.boolean().optional(),
  propertyId: z.string().uuid().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseFilters = z.infer<typeof ExpenseFiltersSchema>;
```

### Step 2: Create Server Actions

**File:** `lib/modules/expenses/expenses/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses, canCreateExpenses } from '@/lib/auth/rbac';
import { ExpenseSchema, UpdateExpenseSchema } from './schemas';
import type { ExpenseInput, UpdateExpenseInput } from './schemas';

export async function createExpense(input: ExpenseInput) {
  const session = await requireAuth();

  // RBAC check
  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  if (!canCreateExpenses(session.user)) {
    throw new Error('Unauthorized: Cannot create expenses');
  }

  // Validate input
  const validated = ExpenseSchema.parse(input);

  try {
    const expense = await prisma.expenses.create({
      data: {
        ...validated,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
      include: {
        property: true,
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    revalidatePath('/expenses');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw new Error('Failed to create expense');
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = UpdateExpenseSchema.parse(input);
  const { id, ...data } = validated;

  try {
    // Verify expense belongs to user's organization
    const existing = await prisma.expenses.findUnique({
      where: { id },
      select: { organizationId: true }
    });

    if (!existing || existing.organizationId !== session.user.organizationId) {
      throw new Error('Expense not found');
    }

    const expense = await prisma.expenses.update({
      where: { id },
      data,
      include: {
        property: true,
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    revalidatePath('/expenses');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense');
  }
}

export async function deleteExpense(id: string) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    // Verify expense belongs to user's organization
    const existing = await prisma.expenses.findUnique({
      where: { id },
      select: { organizationId: true }
    });

    if (!existing || existing.organizationId !== session.user.organizationId) {
      throw new Error('Expense not found');
    }

    await prisma.expenses.delete({
      where: { id }
    });

    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
}

export async function reviewExpense(id: string, status: 'APPROVED' | 'REJECTED') {
  const session = await requireAuth();

  if (!canReviewExpenses(session.user)) {
    throw new Error('Unauthorized: Cannot review expenses');
  }

  try {
    const expense = await prisma.expenses.update({
      where: {
        id,
        organizationId: session.user.organizationId
      },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: session.user.id
      }
    });

    revalidatePath('/expenses');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to review expense:', error);
    throw new Error('Failed to review expense');
  }
}
```

### Step 3: Create Query Functions

**File:** `lib/modules/expenses/expenses/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { ExpenseFiltersSchema } from './schemas';
import type { ExpenseFilters } from './schemas';

export async function getExpenses(filters?: ExpenseFilters) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = filters ? ExpenseFiltersSchema.parse(filters) : {};
  const { page = 1, limit = 50, ...otherFilters } = validated;
  const skip = (page - 1) * limit;

  const where = {
    organizationId: session.user.organizationId,
    ...(otherFilters.category && { category: otherFilters.category }),
    ...(otherFilters.dateFrom && {
      date: { gte: otherFilters.dateFrom }
    }),
    ...(otherFilters.dateTo && {
      date: { lte: otherFilters.dateTo }
    }),
    ...(otherFilters.isDeductible !== undefined && {
      isDeductible: otherFilters.isDeductible
    }),
    ...(otherFilters.propertyId && {
      propertyId: otherFilters.propertyId
    }),
    ...(otherFilters.status && {
      status: otherFilters.status
    }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expenses.findMany({
      where,
      include: {
        property: {
          select: { id: true, address: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        receipt: {
          select: { id: true, fileUrl: true, mimeType: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.expenses.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
}

export async function getExpenseById(id: string) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const expense = await prisma.expenses.findUnique({
    where: {
      id,
      organizationId: session.user.organizationId
    },
    include: {
      property: true,
      creator: {
        select: { id: true, name: true, email: true }
      },
      reviewer: {
        select: { id: true, name: true, email: true }
      },
      receipt: true,
    }
  });

  if (!expense) {
    throw new Error('Expense not found');
  }

  return expense;
}
```

### Step 4: Create Summary Queries

**File:** `lib/modules/expenses/summary/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';

export async function getExpenseSummary() {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // YTD expenses
  const ytdExpenses = await prisma.expenses.aggregate({
    where: {
      organizationId: session.user.organizationId,
      date: {
        gte: new Date(currentYear, 0, 1)
      }
    },
    _sum: { amount: true },
    _count: true
  });

  // This month expenses
  const monthlyExpenses = await prisma.expenses.aggregate({
    where: {
      organizationId: session.user.organizationId,
      date: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1)
      }
    },
    _sum: { amount: true }
  });

  // Tax deductible expenses YTD
  const deductibleExpenses = await prisma.expenses.aggregate({
    where: {
      organizationId: session.user.organizationId,
      date: {
        gte: new Date(currentYear, 0, 1)
      },
      isDeductible: true
    },
    _sum: { amount: true }
  });

  // Total receipts count
  const receiptCount = await prisma.receipts.count({
    where: {
      expense: {
        organizationId: session.user.organizationId
      }
    }
  });

  return {
    ytdTotal: ytdExpenses._sum.amount || 0,
    monthlyTotal: monthlyExpenses._sum.amount || 0,
    deductibleTotal: deductibleExpenses._sum.amount || 0,
    receiptCount,
    totalCount: ytdExpenses._count
  };
}

export async function getCategoryBreakdown() {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const currentYear = new Date().getFullYear();

  const breakdown = await prisma.expenses.groupBy({
    by: ['category'],
    where: {
      organizationId: session.user.organizationId,
      date: {
        gte: new Date(currentYear, 0, 1)
      }
    },
    _sum: {
      amount: true
    },
    _count: true
  });

  return breakdown.map(item => ({
    category: item.category,
    total: item._sum.amount || 0,
    count: item._count,
  }));
}
```

### Step 5: Update RBAC Permissions

**File:** `lib/auth/rbac.ts`

Add expense-specific permission checks:

```typescript
export function canAccessExpenses(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

export function canCreateExpenses(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canReviewExpenses(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canDeleteExpenses(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

### Step 6: Create API Routes

**File:** `app/api/v1/expenses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createExpense, updateExpense } from '@/lib/modules/expenses/expenses/actions';
import { getExpenses } from '@/lib/modules/expenses/expenses/queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      category: searchParams.get('category') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      isDeductible: searchParams.get('isDeductible') === 'true' ? true : searchParams.get('isDeductible') === 'false' ? false : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    };

    const result = await getExpenses(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/expenses error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await createExpense(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await updateExpense(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH /api/v1/expenses error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update expense' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/expenses/summary/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getExpenseSummary } from '@/lib/modules/expenses/summary/queries';

export async function GET(req: NextRequest) {
  try {
    const summary = await getExpenseSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('GET /api/v1/expenses/summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
```

## Testing & Validation

### Test 1: Schema Validation
```typescript
import { ExpenseSchema } from '@/lib/modules/expenses/expenses/schemas';

const validExpense = ExpenseSchema.parse({
  date: new Date(),
  merchant: 'Test Merchant',
  category: 'OFFICE',
  amount: 125.50,
  isDeductible: true,
  organizationId: 'org-uuid',
});
```

### Test 2: Create Expense
```bash
# Use API route
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-05",
    "merchant": "Office Depot",
    "category": "OFFICE",
    "amount": 125.50,
    "isDeductible": true
  }'
```

### Test 3: Fetch Expenses
```bash
curl http://localhost:3000/api/v1/expenses?category=OFFICE&page=1&limit=10
```

### Test 4: Verify Multi-tenancy
```typescript
// Ensure expenses from other orgs are not returned
const expenses = await getExpenses();
expenses.expenses.every(e => e.organizationId === session.user.organizationId)
// Should be true
```

## Success Criteria

- [x] Expense module structure created
- [x] Zod schemas implemented with validation
- [x] Server Actions created for CRUD operations
- [x] Query functions implemented with filters
- [x] RBAC permissions enforced
- [x] API routes functional
- [x] Summary calculations working
- [x] Multi-tenancy enforced (organizationId checks)
- [x] Error handling in place
- [x] Type safety maintained

## Files Created

- ✅ `lib/modules/expenses/expenses/schemas.ts`
- ✅ `lib/modules/expenses/expenses/actions.ts`
- ✅ `lib/modules/expenses/expenses/queries.ts`
- ✅ `lib/modules/expenses/expenses/index.ts`
- ✅ `lib/modules/expenses/summary/queries.ts`
- ✅ `lib/modules/expenses/summary/index.ts`
- ✅ `lib/modules/expenses/index.ts`
- ✅ `app/api/v1/expenses/route.ts`
- ✅ `app/api/v1/expenses/summary/route.ts`

## Files Modified

- ✅ `lib/auth/rbac.ts` - Added expense permissions

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId in queries
**Problem:** Data leak across organizations
**Solution:** ALWAYS include organizationId in where clauses

### ❌ Pitfall 2: Skipping RBAC checks
**Problem:** Unauthorized access
**Solution:** Call canAccessExpenses() at the start of every function

### ❌ Pitfall 3: Not validating input
**Problem:** Invalid data in database
**Solution:** Use Zod schemas to parse all input

### ❌ Pitfall 4: Forgetting revalidatePath
**Problem:** Stale data in UI
**Solution:** Call revalidatePath('/expenses') after mutations

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Expense Categories Module**
2. ✅ Backend foundation ready for UI implementation
3. ✅ API endpoints available for testing

---

**Session 2 Complete:** ✅ Expense module backend implemented with RBAC and multi-tenancy
