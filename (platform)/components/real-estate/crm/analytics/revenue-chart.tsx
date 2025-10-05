'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyRevenue } from '@/lib/modules/analytics';

/**
 * Revenue Chart Component
 *
 * Displays monthly revenue trends
 * Simple bar chart with month labels
 *
 * @example
 * ```tsx
 * <RevenueChart data={monthlyRevenueData} />
 * ```
 */

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <p className="text-sm text-muted-foreground">Last 12 months</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {data.map((month) => {
              const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center h-40">
                    <div
                      className="w-full bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-colors group relative"
                      style={{ height: `${heightPercent}%`, minHeight: month.revenue > 0 ? '4px' : '0' }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {formatCurrency(month.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {month.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg per Month</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0) / data.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deals</p>
              <p className="text-lg font-bold">
                {data.reduce((sum, d) => sum + d.dealsWon, 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
