'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Spending Trends Chart Component
 *
 * Displays expense spending over time using area chart with:
 * - Gradient fill under line
 * - Monthly granularity (last 12 months)
 * - Interactive tooltips
 * - Responsive sizing
 *
 * @client-component - Uses Recharts library
 */

interface SpendingDataPoint {
  month: string;
  amount: number;
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
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Spending: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(payload[0].value)}</span>
        </p>
      </div>
    );
  }

  return null;
}

export function SpendingTrends() {
  // Mock data - replace with API call in future
  // API endpoint: /api/v1/expenses/analytics/trends
  const mockData: SpendingDataPoint[] = [
    { month: 'Jan', amount: 4500 },
    { month: 'Feb', amount: 5200 },
    { month: 'Mar', amount: 4800 },
    { month: 'Apr', amount: 6100 },
    { month: 'May', amount: 5500 },
    { month: 'Jun', amount: 6800 },
    { month: 'Jul', amount: 7200 },
    { month: 'Aug', amount: 6500 },
    { month: 'Sep', amount: 7800 },
    { month: 'Oct', amount: 8200 },
    { month: 'Nov', amount: 7500 },
    { month: 'Dec', amount: 8900 },
  ];

  // Empty state
  if (!mockData || mockData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No spending data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={mockData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            formatter={() => (
              <span className="text-sm text-gray-700 dark:text-gray-300">Monthly Spending</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(mockData.reduce((acc, d) => acc + d.amount, 0) / mockData.length)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Highest</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(Math.max(...mockData.map((d) => d.amount)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total YTD</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(mockData.reduce((acc, d) => acc + d.amount, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
