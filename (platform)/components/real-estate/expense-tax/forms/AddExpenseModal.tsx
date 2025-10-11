'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { createExpense } from '@/lib/modules/expenses/expenses/actions';
import { uploadReceipt } from '@/lib/modules/expenses/receipts/actions';
import { toast } from 'sonner';
import { ReceiptUpload } from './ReceiptUpload';

/**
 * Form Schema
 */
const expenseFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  merchant: z
    .string()
    .min(1, 'Merchant is required')
    .max(100, 'Merchant name must be less than 100 characters'),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
  listingId: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  isDeductible: z.boolean(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Add Expense Modal Component
 *
 * Modal form for adding new expenses with:
 * - React Hook Form + Zod validation
 * - All expense fields
 * - Receipt upload
 * - Submit to Server Actions
 */
export function AddExpenseModal({
  open,
  onClose,
  onSuccess,
}: AddExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Fetch expense categories from API
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await fetch('/api/v1/expenses/categories/list');
      if (!res.ok) throw new Error('Failed to load categories');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const categories = categoriesData?.categories || [];

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      isDeductible: true,
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      // Validate amount is positive
      const parsedAmount = parseFloat(data.amount);
      if (parsedAmount <= 0) {
        toast.error('Amount must be greater than zero');
        setIsSubmitting(false);
        return;
      }

      // Create expense
      const result = await createExpense({
        date: new Date(data.date),
        merchant: data.merchant,
        categoryId: data.category, // Category ID from select
        amount: parsedAmount,
        listingId: data.listingId || null,
        notes: data.notes || null,
        isDeductible: data.isDeductible,
        deductionPercent: 100,
      });

      // Upload receipt if provided
      if (receiptFile && result.expense) {
        const formData = new FormData();
        formData.append('expenseId', result.expense.id);
        formData.append('file', receiptFile);

        try {
          await uploadReceipt(formData);
        } catch (receiptError) {
          console.error('Receipt upload failed:', receiptError);
          toast.warning('Expense created but receipt upload failed');
        }
      }

      toast.success('Expense added successfully');
      form.reset();
      setReceiptFile(null);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add expense'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
          {/* Date and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
                className="dark:bg-gray-800 dark:text-white"
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('amount')}
                className="dark:bg-gray-800 dark:text-white"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Merchant */}
          <div className="space-y-2">
            <Label htmlFor="merchant" className="text-gray-700 dark:text-gray-300">
              Merchant
            </Label>
            <Input
              id="merchant"
              placeholder="e.g., Office Depot, Starbucks"
              {...form.register('merchant')}
              className="dark:bg-gray-800 dark:text-white"
            />
            {form.formState.errors.merchant && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.merchant.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
              Category
            </Label>
            <Select
              onValueChange={(value) => form.setValue('category', value)}
              disabled={loadingCategories}
            >
              <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                <SelectValue
                  placeholder={
                    loadingCategories
                      ? 'Loading categories...'
                      : 'Select category'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {loadingCategories
                      ? 'Loading...'
                      : 'No categories available'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              {...form.register('notes')}
              className="dark:bg-gray-800 dark:text-white"
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Tax Deductible Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDeductible"
              checked={form.watch('isDeductible')}
              onCheckedChange={(checked) =>
                form.setValue('isDeductible', checked as boolean)
              }
            />
            <Label
              htmlFor="isDeductible"
              className="text-sm font-normal text-gray-700 dark:text-gray-300"
            >
              Tax deductible
            </Label>
          </div>

          {/* Receipt Upload */}
          <ReceiptUpload onFileSelect={setReceiptFile} />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
