'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Info, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Tax Estimate Summary Data
 *
 * Data structure from /api/v1/expenses/summary
 */
interface TaxSummary {
  ytdTotal: number;
  monthlyTotal: number;
  deductibleTotal: number;
  receiptCount: number;
  totalCount: number;
}

/**
 * Format currency for display
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
 * Tax Estimate Card Component
 *
 * Displays tax calculator with:
 * - Tax rate input (adjustable, default 25%)
 * - Total deductible expenses YTD
 * - Estimated tax savings calculation
 * - Info tooltip explaining calculations
 *
 * Real-time calculations update when tax rate changes
 *
 * @client-component - Uses useState for tax rate input
 */
export function TaxEstimateCard() {
  const [taxRate, setTaxRate] = useState<number>(25);

  // Fetch expense summary for deductible total
  const { data: summary, isLoading, isError } = useQuery<TaxSummary>({
    queryKey: ['expense-summary'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
  });

  // Calculate tax savings
  const deductibleTotal = summary?.deductibleTotal || 0;
  const taxSavings = deductibleTotal * (taxRate / 100);

  // Handle tax rate input change
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setTaxRate(value);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Tax Data</CardTitle>
          <CardDescription>Failed to load expense data. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Tax Estimate
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Info className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Tax savings are calculated by multiplying your deductible expenses by your tax
                  rate. This is an estimate based on your current year-to-date deductible expenses.
                  Consult a tax professional for accurate calculations.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Estimated tax savings based on deductible expenses</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tax Rate Input */}
        <div className="space-y-2">
          <Label htmlFor="tax-rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Tax Rate (%)
          </Label>
          <div className="relative">
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={handleTaxRateChange}
              className="pr-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter your estimated tax rate (0-100%)
          </p>
        </div>

        {/* Deductible Expenses */}
        <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Deductible Expenses YTD
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(deductibleTotal)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Year-to-date deductible business expenses
          </p>
        </div>

        {/* Estimated Tax Savings */}
        <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estimated Tax Savings
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(taxSavings)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatCurrency(deductibleTotal)} × {taxRate}% = {formatCurrency(taxSavings)}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Note: This is an estimate only. Actual tax savings may vary. Consult a qualified tax
            professional for accurate tax advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
