# Expenses & Taxes Dashboard Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the Expense Manager Dashboard into the Strive SaaS Platform, preserving the exact UI design and functionality while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Expenses & Taxes code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Live Preview)
**Color Scheme:**
- Background: Clean light gray/white theme
- Primary text: Dark gray (#374151)
- Success indicators: Green (#10B981) for positive changes
- Warning indicators: Red (#EF4444) for negative changes
- KPI cards: White background with subtle shadows
- Navigation: Dark sidebar with blue accent

**Layout Pattern:**
- Left sidebar navigation with sections: Dashboard, Expenses, Analytics, Reports, Tax Estimate, Settings
- Main content area with header "Expense Dashboard"
- KPI cards in 2x2 grid: Total Expenses YTD, This Month, Tax Deductible, Total Receipts
- Expenses table with Date, Merchant, Category, Property, Amount columns
- Two-column lower section: Category Breakdown/Cash Flow Timeline + Receipt Gallery + Tax Estimate
- Add expense modal with form fields and receipt upload

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add Expense Management Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// Expense Management Module Tables
model Expense {
  id             String   @id @default(cuid())
  date           DateTime
  merchant       String
  category       ExpenseCategory
  amount         Decimal  // Amount in cents for precision
  
  // Optional fields
  propertyId     String?  // Link to property if applicable
  property       Property? @relation(fields: [propertyId], references: [id])
  notes          String?
  
  // Tax information
  isDeductible   Boolean  @default(true)
  taxCategory    String?
  
  // Receipt management
  receiptUrl     String?  // Supabase Storage URL
  receiptName    String?
  receiptType    String?  // image/pdf
  
  // Processing status
  status         ExpenseStatus @default(PENDING)
  reviewedAt     DateTime?
  reviewedBy     String?
  reviewer       User?    @relation("ExpenseReviewer", fields: [reviewedBy], references: [id])
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("expenses")
}

model ExpenseCategory {
  id             String   @id @default(cuid())
  name           String
  description    String?
  isDeductible   Boolean  @default(true)
  taxCode        String?
  
  // Category configuration
  isActive       Boolean  @default(true)
  sortOrder      Int      @default(0)
  
  // System vs custom categories
  isSystem       Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation (nullable for system categories)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  expenses       Expense[]
  
  @@unique([name, organizationId])
  @@map("expense_categories")
}

model TaxEstimate {
  id             String   @id @default(cuid())
  year           Int
  quarter        Int?     // 1-4 for quarterly estimates
  
  // Income information
  totalIncome    Decimal
  businessIncome Decimal
  otherIncome    Decimal
  
  // Deduction information
  totalDeductions Decimal
  businessDeductions Decimal
  standardDeduction Decimal
  
  // Tax calculations
  taxableIncome  Decimal
  estimatedTax   Decimal
  taxRate        Float    // Effective tax rate
  
  // Payment tracking
  paidAmount     Decimal  @default(0)
  dueDate        DateTime?
  isPaid         Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@unique([year, quarter, organizationId])
  @@map("tax_estimates")
}

model ExpenseReport {
  id             String   @id @default(cuid())
  name           String
  reportType     ReportType
  
  // Date range
  startDate      DateTime
  endDate        DateTime
  
  // Filters
  categories     String[] // Category IDs to include
  properties     String[] // Property IDs to include
  merchants      String[] // Specific merchants
  
  // Report data (cached)
  reportData     Json
  totalExpenses  Decimal
  totalDeductible Decimal
  
  // File generation
  pdfUrl         String?  // Generated PDF URL
  csvUrl         String?  // Generated CSV URL
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("expense_reports")
}

model Receipt {
  id             String   @id @default(cuid())
  expenseId      String   @unique
  expense        Expense  @relation(fields: [expenseId], references: [id])
  
  // File information
  originalName   String
  fileName       String   // Stored filename
  fileUrl        String   // Supabase Storage URL
  fileSize       Int
  mimeType       String
  
  // OCR/Processing results
  extractedData  Json?    // OCR extracted text and data
  processedAt    DateTime?
  
  uploadedAt     DateTime @default(now())
  
  @@map("receipts")
}

enum ExpenseCategory {
  COMMISSION
  TRAVEL
  MARKETING
  OFFICE
  UTILITIES
  LEGAL
  INSURANCE
  REPAIRS
  MEALS
  EDUCATION
  SOFTWARE
  OTHER
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  NEEDS_REVIEW
}

enum ReportType {
  MONTHLY
  QUARTERLY
  YEARLY
  CUSTOM
  TAX_SUMMARY
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Expense relations
  expenses          Expense[]
  reviewedExpenses  Expense[] @relation("ExpenseReviewer")
  taxEstimates      TaxEstimate[]
  expenseReports    ExpenseReport[]
}

model Organization {
  // ... existing fields
  
  // Expense relations
  expenses          Expense[]
  expenseCategories ExpenseCategory[]
  taxEstimates      TaxEstimate[]
  expenseReports    ExpenseReport[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-expense-management
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create Expense Management Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/expenses/{dashboard,manage,analytics,reports,tax-estimate,settings}
```

#### 2.2 Copy and Adapt Components
Create `components/features/expenses/` directory:

```bash
mkdir -p components/features/expenses/{
  dashboard,
  forms,
  tables,
  charts,
  receipts,
  tax,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/expenses/{expenses,categories,reports,tax,receipts}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Expense Module
Following platform module patterns:

```typescript
// lib/modules/expenses/index.ts
export const ExpenseSchema = z.object({
  date: z.date(),
  merchant: z.string().min(1).max(100),
  category: z.nativeEnum(ExpenseCategory),
  amount: z.number().positive(),
  propertyId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isDeductible: z.boolean().default(true),
  organizationId: z.string().uuid(),
});

export async function createExpense(input: ExpenseInput) {
  const session = await requireAuth();
  
  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expenses access required');
  }
  
  if (!canAccessFeature(session.user, 'expenses')) {
    throw new Error('Upgrade required: Expense tracking not available');
  }

  const validated = ExpenseSchema.parse(input);

  return await prisma.expense.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      property: true,
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });
}

export async function getExpenses(filters?: ExpenseFilters) {
  const session = await requireAuth();

  return await prisma.expense.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.dateFrom && { 
        date: { gte: filters.dateFrom } 
      }),
      ...(filters?.dateTo && { 
        date: { lte: filters.dateTo } 
      }),
      ...(filters?.isDeductible !== undefined && { 
        isDeductible: filters.isDeductible 
      }),
    },
    include: {
      property: true,
      creator: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { date: 'desc' }
  });
}

export async function getExpenseSummary() {
  const session = await requireAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // YTD expenses
  const ytdExpenses = await prisma.expense.aggregate({
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
  const monthlyExpenses = await prisma.expense.aggregate({
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
  const deductibleExpenses = await prisma.expense.aggregate({
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
  const receiptCount = await prisma.receipt.count({
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
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Expense Permissions
Update `lib/auth/rbac.ts`:
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
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'expenses'], // Basic expense tracking
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'expenses', 'tax-estimates'], // Full expense + tax
};

export function getExpenseLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { expenses: 0, receipts: 0, reports: 0 },
    STARTER: { expenses: 0, receipts: 0, reports: 0 },
    GROWTH: { expenses: 500, receipts: 500, reports: 5 }, // Per month
    ELITE: { expenses: -1, receipts: -1, reports: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation (Pixel-Perfect)

#### 5.1 Create Main Dashboard Page
Create `app/(platform)/expenses/page.tsx`:
```tsx
import { Suspense } from 'react'
import { ExpenseHeader } from '@/components/features/expenses/dashboard/header'
import { ExpenseKPIs } from '@/components/features/expenses/dashboard/kpis'
import { ExpenseTable } from '@/components/features/expenses/tables/expense-table'
import { CategoryBreakdown } from '@/components/features/expenses/charts/category-breakdown'
import { ReceiptGallery } from '@/components/features/expenses/receipts/receipt-gallery'
import { TaxEstimateCard } from '@/components/features/expenses/tax/tax-estimate-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExpenseDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExpenseHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards */}
          <Suspense fallback={<Skeleton className="h-32" />}>
            <ExpenseKPIs />
          </Suspense>
          
          {/* Recent Expenses Table */}
          <Suspense fallback={<Skeleton className="h-96" />}>
            <ExpenseTable />
          </Suspense>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <CategoryBreakdown />
              </Suspense>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              <Suspense fallback={<Skeleton className="h-48" />}>
                <ReceiptGallery />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-64" />}>
                <TaxEstimateCard />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Create KPI Cards Component (Exact UI Match)
Create `components/features/expenses/dashboard/ExpenseKPIs.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'

export function ExpenseKPIs() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['expense-summary'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/summary')
      return response.json()
    }
  })

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Expenses YTD',
      value: formatCurrency(summary.ytdTotal),
      change: '+12.5% from last year',
      positive: true
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlyTotal),
      change: '-8.3% from last month',
      positive: false
    },
    {
      title: 'Tax Deductible',
      value: formatCurrency(summary.deductibleTotal),
      subtitle: '85% of total',
      positive: true
    },
    {
      title: 'Total Receipts',
      value: summary.receiptCount.toString(),
      subtitle: '12 pending',
      positive: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                {kpi.title}
              </h3>
              
              <div className="text-3xl font-bold text-gray-900">
                {kpi.value}
              </div>
              
              {kpi.change && (
                <div className={`flex items-center text-sm ${
                  kpi.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.positive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {kpi.change}
                </div>
              )}
              
              {kpi.subtitle && (
                <p className="text-sm text-gray-500">
                  {kpi.subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

#### 5.3 Create Expenses Table Component (Exact UI Match)
Create `components/features/expenses/tables/ExpenseTable.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Plus, Edit, Eye, Trash } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddExpenseModal } from '../forms/AddExpenseModal'

interface Expense {
  id: string
  date: string
  merchant: string
  category: string
  property?: {
    address: string
  }
  amount: number
  receiptUrl?: string
}

export function ExpenseTable() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }
      const response = await fetch(`/api/v1/expenses?${params}`)
      return response.json()
    }
  })

  const categories = [
    { value: 'all', label: 'All categories' },
    { value: 'COMMISSION', label: 'Commission' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'UTILITIES', label: 'Utilities' },
  ]

  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Recent Expenses
            </CardTitle>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : expenses?.expenses?.map((expense: Expense) => (
                <TableRow key={expense.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>{expense.merchant}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {expense.property ? expense.property.address : '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {expense.receiptUrl && (
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showAddModal && (
        <AddExpenseModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  )
}
```

#### 5.4 Create Tax Estimate Card (Exact UI Match)
Create `components/features/expenses/tax/TaxEstimateCard.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'

export function TaxEstimateCard() {
  const { data: taxData } = useQuery({
    queryKey: ['tax-estimate'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/tax-estimate')
      return response.json()
    }
  })

  const deductibleAmount = taxData?.deductibleTotal || 38450
  const nonDeductibleAmount = taxData?.nonDeductibleTotal || 6781
  const totalAmount = deductibleAmount + nonDeductibleAmount
  const deductiblePercentage = (deductibleAmount / totalAmount * 100).toFixed(1)
  const taxRate = 25
  const estimatedSavings = deductibleAmount * (taxRate / 100)

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Tax Estimate
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Deductible Amount */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Deductible
          </Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-lg text-gray-500 mr-1">$</span>
              <span className="text-2xl font-bold text-gray-900">
                {deductibleAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-semibold text-lg mr-1">
                {deductiblePercentage}
              </span>
              <span>% of total</span>
            </div>
          </div>
        </div>

        {/* Non-deductible */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Non-deductible
          </Label>
          <div className="flex items-center">
            <span className="text-lg text-gray-500 mr-1">$</span>
            <span className="text-2xl font-bold text-gray-900">
              {nonDeductibleAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tax Rate Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Tax rate
          </Label>
          <div className="flex items-center space-x-2">
            <Input 
              type="number" 
              defaultValue={taxRate}
              className="w-20"
            />
            <span className="text-gray-500">%</span>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Label className="text-sm font-medium text-gray-700">
            Estimated Savings
          </Label>
          <div className="flex items-center">
            <span className="text-lg text-gray-500 mr-1">$</span>
            <span className="text-2xl font-bold text-green-600">
              {estimatedSavings.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Based on <span className="font-medium">{taxRate}%</span> tax bracket
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Expenses API
Create `app/api/v1/expenses/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createExpense, getExpenses } from '@/lib/modules/expenses'
import { canAccessExpenses, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessExpenses(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      category: searchParams.get('category'),
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    const expenses = await getExpenses(filters)
    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessExpenses(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'expenses')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const expense = await createExpense({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
```

#### 6.2 Create Summary API
Create `app/api/v1/expenses/summary/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getExpenseSummary } from '@/lib/modules/expenses'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessExpenses(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await getExpenseSummary()
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
```

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'Expense Manager',
    href: '/expenses',
    icon: Receipt,
    children: [
      { name: 'Dashboard', href: '/expenses' },
      { name: 'Expenses', href: '/expenses/manage' },
      { name: 'Analytics', href: '/expenses/analytics' },
      { name: 'Reports', href: '/expenses/reports' },
      { name: 'Tax Estimate', href: '/expenses/tax-estimate' },
      { name: 'Settings', href: '/expenses/settings' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create Expense Tests
Create `__tests__/modules/expenses/expenses.test.ts`:
```typescript
import { createExpense, getExpenseSummary } from '@/lib/modules/expenses'
import { canAccessExpenses } from '@/lib/auth/rbac'

describe('Expense Management Module', () => {
  it('should create expense for current org only', async () => {
    const expense = await createExpense({
      date: new Date(),
      merchant: 'Test Merchant',
      category: 'OFFICE',
      amount: 12500, // $125.00
      organizationId: 'org-123'
    })

    expect(expense.organizationId).toBe('org-123')
  })

  it('should calculate expense summary correctly', async () => {
    const summary = await getExpenseSummary()
    
    expect(summary).toHaveProperty('ytdTotal')
    expect(summary).toHaveProperty('monthlyTotal')
    expect(summary).toHaveProperty('deductibleTotal')
    expect(summary).toHaveProperty('receiptCount')
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all expense tables
- [ ] RBAC permissions working for expense access
- [ ] Subscription tier limits enforced
- [ ] KPI cards display correct styling and metrics
- [ ] Expense table matches original layout exactly
- [ ] Add expense modal functional with all fields
- [ ] Category filtering working correctly
- [ ] Tax estimate calculations accurate
- [ ] Receipt upload functionality working
- [ ] Category breakdown chart displaying
- [ ] Export functionality operational
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements from Live Preview:**
- **Background**: Light gray (#F9FAFB) page background
- **Cards**: White background with subtle shadows
- **KPI Layout**: 2x2 grid on larger screens, stacked on mobile
- **Typography**: 
  - KPI titles: Small gray text (#6B7280)
  - KPI values: Large bold black text
  - Change indicators: Green (#10B981) or red (#EF4444)
- **Table**: Clean white background with hover states
- **Navigation**: Dark sidebar with blue accent indicators
- **Tax Estimate**: Right-aligned card with form inputs and large savings display

**Component Styling Patterns:**
```css
/* KPI card styling */
.kpi-card {
  @apply bg-white shadow-sm rounded-lg p-6;
}

/* KPI value styling */
.kpi-value {
  @apply text-3xl font-bold text-gray-900;
}

/* Change indicator styling */
.change-positive {
  @apply text-green-600 text-sm flex items-center;
}

.change-negative {
  @apply text-red-600 text-sm flex items-center;
}

/* Table styling */
.expense-table {
  @apply bg-white rounded-lg shadow-sm;
}

/* Tax estimate styling */
.tax-estimate {
  @apply bg-white rounded-lg shadow-sm p-6 space-y-6;
}
```

This integration preserves the exact visual design and functionality of the Expense Manager Dashboard while seamlessly integrating it into the Strive platform's multi-tenant, RBAC architecture.