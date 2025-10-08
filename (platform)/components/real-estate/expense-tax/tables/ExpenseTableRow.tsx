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

/**
 * Expense Data Type
 */
interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  listing: {
    id: string;
    address: string;
  } | null;
  amount: number;
  receiptUrl: string | null;
  isDeductible: boolean;
}

interface ExpenseTableRowProps {
  expense: Expense;
  onUpdate: () => void;
}

/**
 * Format Currency
 *
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format Date
 *
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Expense Table Row Component
 *
 * Displays a single expense row with:
 * - Date, merchant, category, property, amount
 * - Actions dropdown (edit, view receipt, delete)
 * - Delete confirmation
 */
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
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete expense'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
        {formatDate(expense.date)}
      </TableCell>
      <TableCell className="text-gray-700 dark:text-gray-300">
        {expense.merchant}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {expense.category}
        </span>
      </TableCell>
      <TableCell className="text-gray-600 dark:text-gray-400">
        {expense.listing ? expense.listing.address : '—'}
      </TableCell>
      <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">
        {formatCurrency(expense.amount)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
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
                onClick={() => window.open(expense.receiptUrl!, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Receipt
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
