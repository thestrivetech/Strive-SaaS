'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';

/**
 * Category Breakdown Data
 *
 * Data structure from /api/v1/expenses/categories
 */
interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryBreakdownResponse {
  categories: CategoryData[];
  totalAmount: number;
  totalCount: number;
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
 * Get user-friendly category name
 *
 * @param category - Enum category name
 * @returns Formatted display name
 */
function formatCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    COMMISSION: 'Commissions',
    TRAVEL: 'Travel',
    MARKETING: 'Marketing',
    OFFICE: 'Office',
    UTILITIES: 'Utilities',
    LEGAL: 'Legal',
    INSURANCE: 'Insurance',
    REPAIRS: 'Repairs',
    MEALS: 'Meals',
    EDUCATION: 'Education',
    SOFTWARE: 'Software',
    OTHER: 'Other',
  };

  return categoryNames[category] || category;
}

/**
 * Color palette for chart categories
 *
 * Uses a vibrant color scheme with good contrast for dark mode
 */
const CATEGORY_COLORS = [
  'hsl(210, 100%, 50%)', // Blue
  'hsl(142, 71%, 45%)', // Green
  'hsl(24, 95%, 53%)', // Orange
  'hsl(271, 91%, 65%)', // Purple
  'hsl(0, 84%, 60%)', // Red
  'hsl(45, 93%, 47%)', // Yellow
  'hsl(180, 77%, 47%)', // Cyan
  'hsl(320, 85%, 60%)', // Pink
  'hsl(30, 80%, 55%)', // Amber
  'hsl(160, 84%, 39%)', // Teal
  'hsl(240, 85%, 65%)', // Indigo
  'hsl(80, 61%, 50%)', // Lime
];

/**
 * Custom Tooltip Component
 *
 * Displays category name, amount, percentage, and count on hover
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CategoryData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          {formatCategoryName(data.category)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Amount: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.amount)}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Percentage: <span className="font-medium text-gray-900 dark:text-white">{data.percentage}%</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Expenses: <span className="font-medium text-gray-900 dark:text-white">{data.count}</span>
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Category Breakdown Chart Component
 *
 * Displays expense distribution by category using:
 * - Pie chart showing percentage breakdown
 * - Legend with category colors
 * - Interactive tooltips on hover
 * - Responsive sizing for mobile/desktop
 *
 * Empty state shown when no expense data
 *
 * @client-component - Uses TanStack Query for data fetching
 */
export function CategoryBreakdown() {
  const { data, isLoading, isError } = useQuery<CategoryBreakdownResponse>({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch category breakdown');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
  });

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Chart</CardTitle>
          <CardDescription>Failed to load category breakdown. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state
  if (!data || data.categories.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Breakdown
          </CardTitle>
          <CardDescription>Expense distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No expense data available yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Add expenses to see category breakdown
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.categories.map((cat) => ({
    ...cat,
    name: formatCategoryName(cat.category),
  }));

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Category Breakdown
        </CardTitle>
        <CardDescription>
          Year-to-date expense distribution by category ({data.totalCount} expenses)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Category List Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Top Categories
            </h4>
            <div className="space-y-2">
              {chartData.slice(0, 5).map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">{cat.percentage}%</span>
                    <span className="font-medium text-gray-900 dark:text-white min-w-[80px] text-right">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {chartData.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                + {chartData.length - 5} more {chartData.length - 5 === 1 ? 'category' : 'categories'}
              </p>
            )}
          </div>

          {/* Total Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Expenses YTD
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
