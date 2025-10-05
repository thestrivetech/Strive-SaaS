# Session 6: Expense Table & Add Expense Modal

## Session Overview
**Goal:** Implement the expense table with filtering and the Add Expense modal with receipt upload.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 5 (Dashboard UI must be complete)

## Objectives

1. ✅ Create Expense Table component with all columns
2. ✅ Implement category filtering and sorting
3. ✅ Add row actions (edit, delete, view receipt)
4. ✅ Create Add Expense Modal with form
5. ✅ Implement receipt upload in modal
6. ✅ Add form validation with React Hook Form + Zod
7. ✅ Integrate with Server Actions for mutations

## Prerequisites

- [x] Session 5 completed (Dashboard page ready)
- [x] shadcn/ui table components installed
- [x] React Hook Form + Zod configured
- [x] Understanding of modal patterns

## Component Structure

```
components/real-estate/expenses/
├── tables/
│   ├── ExpenseTable.tsx       # Main table (Client Component)
│   ├── ExpenseTableRow.tsx    # Table row with actions
│   └── TableFilters.tsx       # Category filter dropdown
├── forms/
│   ├── AddExpenseModal.tsx    # Add expense modal
│   ├── ExpenseForm.tsx        # Reusable expense form
│   └── ReceiptUpload.tsx      # File upload component
└── shared/
    └── ConfirmDialog.tsx      # Delete confirmation
```

## Step-by-Step Implementation

### Step 1: Create Expense Table Component

**File:** `components/real-estate/expenses/tables/ExpenseTable.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { ExpenseTableRow } from './ExpenseTableRow';
import { AddExpenseModal } from '../forms/AddExpenseModal';

interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  property?: { address: string };
  amount: number;
  receiptUrl?: string;
  isDeductible: boolean;
  status: string;
}

export function ExpenseTable() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expenses', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      const response = await fetch(`/api/v1/expenses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    },
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'COMMISSION', label: 'Commission' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'LEGAL', label: 'Legal' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'REPAIRS', label: 'Repairs' },
    { value: 'MEALS', label: 'Meals' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'OTHER', label: 'Other' },
  ];

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

            {data && (
              <p className="text-sm text-gray-500">
                Showing {data.expenses?.length || 0} of {data.pagination?.total || 0} expenses
              </p>
            )}
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
              ) : data?.expenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No expenses found. Add your first expense to get started.
                  </TableCell>
                </TableRow>
              ) : (
                data?.expenses?.map((expense: Expense) => (
                  <ExpenseTableRow
                    key={expense.id}
                    expense={expense}
                    onUpdate={refetch}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showAddModal && (
        <AddExpenseModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </>
  );
}
```

### Step 2: Create Table Row Component

**File:** `components/real-estate/expenses/tables/ExpenseTableRow.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Trash } from 'lucide-react';
import { deleteExpense } from '@/lib/modules/expenses/expenses/actions';
import { toast } from 'sonner';

interface ExpenseTableRowProps {
  expense: {
    id: string;
    date: string;
    merchant: string;
    category: string;
    property?: { address: string };
    amount: number;
    receiptUrl?: string;
  };
  onUpdate: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ExpenseTableRow({ expense, onUpdate }: ExpenseTableRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast.success('Expense deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
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
            <Button variant="ghost" size="sm" disabled={isDeleting}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {expense.receiptUrl && (
              <DropdownMenuItem
                onClick={() => window.open(expense.receiptUrl, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Receipt
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
```

### Step 3: Create Add Expense Modal

**File:** `components/real-estate/expenses/forms/AddExpenseModal.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createExpense } from '@/lib/modules/expenses/expenses/actions';
import { uploadReceipt } from '@/lib/modules/expenses/receipts/actions';
import { toast } from 'sonner';
import { ReceiptUpload } from './ReceiptUpload';

const expenseFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  merchant: z.string().min(1, 'Merchant is required').max(100),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
  isDeductible: z.boolean().default(true),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpenseModal({ open, onClose, onSuccess }: AddExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      isDeductible: true,
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      // Create expense
      const result = await createExpense({
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        organizationId: '', // Will be set by Server Action
      });

      // Upload receipt if provided
      if (receiptFile && result.expense) {
        const formData = new FormData();
        formData.append('expenseId', result.expense.id);
        formData.append('file', receiptFile);
        await uploadReceipt(formData);
      }

      toast.success('Expense added successfully');
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              placeholder="e.g., Office Depot"
              {...form.register('merchant')}
            />
            {form.formState.errors.merchant && (
              <p className="text-sm text-red-600">{form.formState.errors.merchant.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => form.setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMMISSION">Commission</SelectItem>
                <SelectItem value="TRAVEL">Travel</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
                <SelectItem value="UTILITIES">Utilities</SelectItem>
                <SelectItem value="LEGAL">Legal</SelectItem>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="REPAIRS">Repairs</SelectItem>
                <SelectItem value="MEALS">Meals</SelectItem>
                <SelectItem value="EDUCATION">Education</SelectItem>
                <SelectItem value="SOFTWARE">Software</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              {...form.register('notes')}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDeductible"
              checked={form.watch('isDeductible')}
              onCheckedChange={(checked) => form.setValue('isDeductible', checked as boolean)}
            />
            <Label htmlFor="isDeductible" className="text-sm font-normal">
              Tax deductible
            </Label>
          </div>

          <ReceiptUpload onFileSelect={setReceiptFile} />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 4: Create Receipt Upload Component

**File:** `components/real-estate/expenses/forms/ReceiptUpload.tsx`

```typescript
'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';

interface ReceiptUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function ReceiptUpload({ onFileSelect }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Receipt (Optional)</label>

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, PDF up to 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Update Dashboard to Include Table

**File:** Update `app/real-estate/expenses/page.tsx`

```typescript
import { ExpenseTable } from '@/components/real-estate/expenses/tables/ExpenseTable';

// Add after ExpenseKPIs
<Suspense fallback={<Skeleton className="h-96" />}>
  <ExpenseTable />
</Suspense>
```

## Testing & Validation

### Test 1: Table Display
- Verify table shows expenses
- Test category filtering
- Check responsive design

### Test 2: Add Expense Flow
- Open modal
- Fill form with valid data
- Submit and verify expense appears in table

### Test 3: Receipt Upload
- Add expense with receipt
- Verify file uploads to Supabase
- Check receipt URL saved correctly

### Test 4: Delete Expense
- Click delete on expense
- Confirm deletion dialog
- Verify expense removed from table

## Success Criteria

- [x] Expense table displays with all columns
- [x] Category filtering functional
- [x] Add Expense modal opens and closes
- [x] Form validation working
- [x] Receipt upload functional
- [x] Delete action working
- [x] Mobile-responsive design
- [x] Loading states implemented

## Files Created

- ✅ `components/real-estate/expenses/tables/ExpenseTable.tsx`
- ✅ `components/real-estate/expenses/tables/ExpenseTableRow.tsx`
- ✅ `components/real-estate/expenses/forms/AddExpenseModal.tsx`
- ✅ `components/real-estate/expenses/forms/ReceiptUpload.tsx`

## Next Steps

1. ✅ Proceed to **Session 7: Tax Estimate & Category Breakdown UI**

---

**Session 6 Complete:** ✅ Expense table and add modal implemented with receipt upload
