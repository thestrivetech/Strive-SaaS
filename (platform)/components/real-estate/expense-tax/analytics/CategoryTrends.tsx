'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Category Trends Chart Component
 *
 * Multi-line chart showing expense trends for top 5 categories with:
 * - Different color for each category
 * - Monthly granularity (last 6 months)
 * - Interactive tooltips
 * - Responsive sizing
 *
 * @client-component - Uses Recharts library
 */

interface CategoryTrendData {
  month: string;
  Marketing: number;
  Travel: number;
  Office: number;
  Software: number;
  Utilities: number;
}

/**
 * Format currency for display
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
 * Custom Tooltip Component
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function CategoryTrends() {
  // Mock data - replace with API call in future
  // API endpoint: /api/v1/expenses/analytics/category-trends
  const mockData: CategoryTrendData[] = [
    { month: 'Jul', Marketing: 2200, Travel: 1800, Office: 1200, Software: 800, Utilities: 500 },
    { month: 'Aug', Marketing: 1900, Travel: 1500, Office: 1100, Software: 850, Utilities: 450 },
    { month: 'Sep', Marketing: 2500, Travel: 2100, Office: 1300, Software: 900, Utilities: 550 },
    { month: 'Oct', Marketing: 2800, Travel: 2400, Office: 1400, Software: 950, Utilities: 600 },
    { month: 'Nov', Marketing: 2300, Travel: 1900, Office: 1250, Software: 900, Utilities: 500 },
    { month: 'Dec', Marketing: 3100, Travel: 2600, Office: 1500, Software: 1000, Utilities: 650 },
  ];

  // Empty state
  if (!mockData || mockData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No trend data available yet
        </p>
      </div>
    );
  }

  const categories = ['Marketing', 'Travel', 'Office', 'Software', 'Utilities'];
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={384}>
        <LineChart
          data={mockData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Category Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Top Categories (Last Month)
        </h4>
        <div className="space-y-2">
          {categories.map((category, index) => {
            const lastMonthValue = mockData[mockData.length - 1][category as keyof CategoryTrendData] as number;
            return (
              <div key={category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{category}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(lastMonthValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
