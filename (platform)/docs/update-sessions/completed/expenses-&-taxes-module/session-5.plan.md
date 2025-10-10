# Session 5: Dashboard UI - KPI Cards & Summary

## Session Overview
**Goal:** Build the Expense Dashboard UI with KPI cards and summary displays.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 4 (Backend modules must be complete)

## Objectives

1. ✅ Create Expense Dashboard page structure
2. ✅ Implement KPI cards component (Total YTD, This Month, Tax Deductible, Receipts)
3. ✅ Add responsive grid layout
4. ✅ Implement loading states with Suspense
5. ✅ Add error boundaries
6. ✅ Integrate with TanStack Query for data fetching
7. ✅ Match UI design from integration plan

## Prerequisites

- [x] Session 4 completed (All backend modules ready)
- [x] shadcn/ui components installed
- [x] TanStack Query configured
- [x] Understanding of Server Components vs Client Components

## Component Structure

```
app/real-estate/expenses/
├── page.tsx                 # Main dashboard page (Server Component)
├── layout.tsx              # Expense layout
└── loading.tsx             # Loading state

components/real-estate/expenses/
├── dashboard/
│   ├── ExpenseKPIs.tsx     # KPI cards (Client Component)
│   ├── ExpenseHeader.tsx   # Page header
│   └── DashboardSkeleton.tsx # Loading skeleton
```

## Step-by-Step Implementation

### Step 1: Create Expense Dashboard Page

**File:** `app/real-estate/expenses/page.tsx`

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import { ExpenseHeader } from '@/components/real-estate/expenses/dashboard/ExpenseHeader';
import { ExpenseKPIs } from '@/components/real-estate/expenses/dashboard/ExpenseKPIs';
import { DashboardSkeleton } from '@/components/real-estate/expenses/dashboard/DashboardSkeleton';

export const metadata: Metadata = {
  title: 'Expense Dashboard | Strive Platform',
  description: 'Track and manage business expenses',
};

export default function ExpenseDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <ExpenseHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards */}
          <Suspense fallback={<DashboardSkeleton />}>
            <ExpenseKPIs />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Create Page Header

**File:** `components/real-estate/expenses/dashboard/ExpenseHeader.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ExpenseHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your business expenses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create KPI Cards Component

**File:** `components/real-estate/expenses/dashboard/ExpenseKPIs.tsx`

```typescript
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface KPISummary {
  ytdTotal: number;
  monthlyTotal: number;
  deductibleTotal: number;
  receiptCount: number;
  totalCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpenseKPIs() {
  const { data: summary, isLoading } = useQuery<KPISummary>({
    queryKey: ['expense-summary'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Expenses YTD',
      value: formatCurrency(summary.ytdTotal),
      change: '+12.5% from last year',
      positive: true,
      count: `${summary.totalCount} expenses`,
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlyTotal),
      change: '-8.3% from last month',
      positive: false,
      subtitle: 'Current month spending',
    },
    {
      title: 'Tax Deductible',
      value: formatCurrency(summary.deductibleTotal),
      subtitle: `${Math.round((summary.deductibleTotal / summary.ytdTotal) * 100)}% of total`,
      positive: true,
    },
    {
      title: 'Total Receipts',
      value: summary.receiptCount.toString(),
      subtitle: `${summary.receiptCount} uploaded`,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                {kpi.title}
              </h3>

              <div className="text-3xl font-bold text-gray-900">
                {kpi.value}
              </div>

              {kpi.change && (
                <div
                  className={`flex items-center text-sm ${
                    kpi.positive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {kpi.positive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {kpi.change}
                </div>
              )}

              {kpi.subtitle && (
                <p className="text-sm text-gray-500">{kpi.subtitle}</p>
              )}

              {kpi.count && (
                <p className="text-xs text-gray-400">{kpi.count}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Step 4: Create Loading Skeleton

**File:** `components/real-estate/expenses/dashboard/DashboardSkeleton.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Step 5: Create Layout

**File:** `app/real-estate/expenses/layout.tsx`

```typescript
import { ReactNode } from 'react';

export default function ExpenseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="expense-module">
      {children}
    </div>
  );
}
```

### Step 6: Create Loading Page

**File:** `app/real-estate/expenses/loading.tsx`

```typescript
import { DashboardSkeleton } from '@/components/real-estate/expenses/dashboard/DashboardSkeleton';

export default function ExpenseLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
```

### Step 7: Add Navigation Integration

**File:** Update sidebar navigation (if not already present)

```typescript
// In components/shared/navigation/Sidebar.tsx or equivalent
const navigationItems = [
  // ... existing items
  {
    name: 'Expense Manager',
    href: '/real-estate/expenses',
    icon: Receipt,
    children: [
      { name: 'Dashboard', href: '/real-estate/expenses' },
      { name: 'Manage', href: '/real-estate/expenses/manage' },
      { name: 'Analytics', href: '/real-estate/expenses/analytics' },
      { name: 'Reports', href: '/real-estate/expenses/reports' },
      { name: 'Tax Estimate', href: '/real-estate/expenses/tax-estimate' },
      { name: 'Settings', href: '/real-estate/expenses/settings' },
    ],
  },
];
```

## Testing & Validation

### Test 1: Page Renders
```bash
# Navigate to http://localhost:3000/real-estate/expenses
# Verify page loads without errors
```

### Test 2: KPI Data Loads
- Verify API call to `/api/v1/expenses/summary` succeeds
- Check KPI cards display correct data
- Verify loading skeleton appears initially

### Test 3: Responsive Design
- Test on mobile (< 768px)
- Test on tablet (768px - 1024px)
- Test on desktop (> 1024px)
- Verify grid layout adapts correctly

### Test 4: Loading States
- Verify Suspense boundary shows skeleton
- Verify smooth transition from loading to data
- Test error states (disconnect network)

## Success Criteria

- [x] Expense dashboard page created
- [x] KPI cards display correct data
- [x] Responsive grid layout functional
- [x] Loading states with Suspense working
- [x] TanStack Query integration complete
- [x] UI matches design from integration plan
- [x] Mobile-responsive design
- [x] Proper TypeScript types

## Files Created

- ✅ `app/real-estate/expenses/page.tsx`
- ✅ `app/real-estate/expenses/layout.tsx`
- ✅ `app/real-estate/expenses/loading.tsx`
- ✅ `components/real-estate/expenses/dashboard/ExpenseHeader.tsx`
- ✅ `components/real-estate/expenses/dashboard/ExpenseKPIs.tsx`
- ✅ `components/real-estate/expenses/dashboard/DashboardSkeleton.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: "use client" in wrong components
**Problem:** Server Component benefits lost
**Solution:** Only use "use client" in ExpenseKPIs (needs hooks)

### ❌ Pitfall 2: Missing error boundaries
**Problem:** Errors crash entire page
**Solution:** Add error.tsx for graceful error handling

### ❌ Pitfall 3: No loading states
**Problem:** Blank screen during data fetch
**Solution:** Use Suspense + skeleton components

### ❌ Pitfall 4: Hardcoded colors
**Problem:** Not using Tailwind theme
**Solution:** Use Tailwind utility classes

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Expense Table & Management UI**
2. ✅ Dashboard KPIs functional and tested
3. ✅ Ready to build table and forms

---

**Session 5 Complete:** ✅ Dashboard UI with KPI cards implemented
