'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { ExpenseTableRow } from './ExpenseTableRow';
import { AddExpenseModal } from '../forms/AddExpenseModal';

/**
 * Expense API Response
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
  status: string;
}

interface ExpenseResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Category Options
 */
const CATEGORY_OPTIONS = [
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

/**
 * Expense Table Component
 *
 * Displays expenses in a table with:
 * - Category filtering
 * - Add expense button
 * - Loading/empty/error states
 * - Row actions (edit, view receipt, delete)
 */
export function ExpenseTable() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading, refetch } = useQuery<ExpenseResponse>({
    queryKey: ['expenses', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      const response = await fetch(`/api/v1/expenses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      return response.json();
    },
  });

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
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
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {data && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {data.expenses?.length || 0} of{' '}
                {data.pagination?.total || 0} expenses
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Date
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Merchant
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Category
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Property
                  </TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">
                    Amount
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.expenses?.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      No expenses found. Add your first expense to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
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
          </div>
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
