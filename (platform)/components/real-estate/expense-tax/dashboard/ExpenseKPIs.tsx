'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Receipt, FileText, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

/**
 * Expense KPI Summary Data
 *
 * Data structure returned from /api/v1/expenses/summary
 */
interface KPISummary {
  ytdTotal: number;
  monthlyTotal: number;
  deductibleTotal: number;
  receiptCount: number;
  totalCount: number;
}

/**
 * KPI Card Data
 *
 * Structure for individual KPI card display
 */
interface KPICardData {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  positive?: boolean;
  count?: string;
  icon: React.ElementType;
  iconColor: string;
}

/**
 * Format currency for display
 *
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "$1,234")
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Expense KPIs Component
 *
 * Displays four KPI cards with expense summary data:
 * 1. Total Expenses YTD
 * 2. This Month
 * 3. Tax Deductible
 * 4. Total Receipts
 *
 * Uses TanStack Query for data fetching with 30s refetch interval
 *
 * @client-component - Uses hooks (useQuery)
 */
export function ExpenseKPIs() {
  const { data: summary, isLoading, isError } = useQuery<KPISummary>({
    queryKey: ['expense-summary'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  // Loading state
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load expense summary. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate deductible percentage
  const deductiblePercentage = summary.ytdTotal > 0
    ? Math.round((summary.deductibleTotal / summary.ytdTotal) * 100)
    : 0;

  // Build KPI cards data
  const kpis: KPICardData[] = [
    {
      title: 'Total Expenses YTD',
      value: formatCurrency(summary.ytdTotal),
      count: `${summary.totalCount} ${summary.totalCount === 1 ? 'expense' : 'expenses'}`,
      icon: DollarSign,
      iconColor: 'text-blue-600 dark:text-blue-400',
      positive: true,
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlyTotal),
      subtitle: 'Current month spending',
      icon: Calendar,
      iconColor: 'text-green-600 dark:text-green-400',
      positive: true,
    },
    {
      title: 'Tax Deductible',
      value: formatCurrency(summary.deductibleTotal),
      subtitle: `${deductiblePercentage}% of total expenses`,
      icon: FileText,
      iconColor: 'text-purple-600 dark:text-purple-400',
      positive: true,
    },
    {
      title: 'Total Receipts',
      value: summary.receiptCount.toString(),
      subtitle: `${summary.receiptCount} ${summary.receiptCount === 1 ? 'receipt' : 'receipts'} uploaded`,
      icon: Receipt,
      iconColor: 'text-orange-600 dark:text-orange-400',
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;

        return (
          <Card
            key={index}
            className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700"
          >
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Icon and Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </h3>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                </div>

                {/* Value */}
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </div>

                {/* Subtitle or Count */}
                {kpi.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {kpi.subtitle}
                  </p>
                )}

                {kpi.count && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {kpi.count}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
