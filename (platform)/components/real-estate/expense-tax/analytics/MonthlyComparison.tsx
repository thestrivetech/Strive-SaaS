'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

/**
 * Monthly Comparison Chart Component
 *
 * Compares month-over-month expenses using bar chart with:
 * - Color coding for increase/decrease
 * - Percentage change indicators
 * - Interactive tooltips
 * - Responsive sizing
 *
 * @client-component - Uses Recharts library
 */

interface MonthlyComparisonData {
  month: string;
  current: number;
  previous: number;
  change: number;
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
    payload: MonthlyComparisonData;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.current)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Previous: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.previous)}</span>
          </p>
          <p className={`text-sm font-medium ${data.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}% change
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function MonthlyComparison() {
  // Mock data - replace with API call in future
  // API endpoint: /api/v1/expenses/analytics/comparison
  const mockData: MonthlyComparisonData[] = [
    { month: 'Jul', current: 7200, previous: 6800, change: 5.9 },
    { month: 'Aug', current: 6500, previous: 7200, change: -9.7 },
    { month: 'Sep', current: 7800, previous: 6500, change: 20.0 },
    { month: 'Oct', current: 8200, previous: 7800, change: 5.1 },
    { month: 'Nov', current: 7500, previous: 8200, change: -8.5 },
    { month: 'Dec', current: 8900, previous: 7500, change: 18.7 },
  ];

  // Empty state
  if (!mockData || mockData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No comparison data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => {
              const labels: Record<string, string> = {
                current: 'Current Month',
                previous: 'Previous Month',
              };
              return (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {labels[value] || value}
                </span>
              );
            }}
          />
          <Bar
            dataKey="previous"
            fill="hsl(var(--chart-4))"
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="current" radius={[4, 4, 0, 0]}>
            {mockData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.change >= 0 ? 'hsl(var(--chart-5))' : 'hsl(var(--chart-3))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Average Change:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {(mockData.reduce((acc, d) => acc + d.change, 0) / mockData.length).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
