'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsData {
  mrr_cents?: number;
  arr_cents?: number;
}

interface RevenueChartProps {
  data: MetricsData | null;
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Mock data for demonstration - in production, this would come from metrics history
  const chartData = [
    { month: 'Jan', mrr: 12000, arr: 144000 },
    { month: 'Feb', mrr: 15000, arr: 180000 },
    { month: 'Mar', mrr: 18000, arr: 216000 },
    { month: 'Apr', mrr: 22000, arr: 264000 },
    { month: 'May', mrr: 26000, arr: 312000 },
    { month: 'Jun', mrr: 30000, arr: 360000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 17%)" />
        <XAxis
          dataKey="month"
          stroke="hsl(215, 20%, 65%)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="hsl(215, 20%, 65%)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          formatter={(value) => `$${Number(value).toLocaleString()}`}
          contentStyle={{
            backgroundColor: 'hsl(222, 84%, 5.9%)',
            border: '1px solid hsl(217, 32%, 17%)',
            borderRadius: '0.5rem',
          }}
        />
        <Line
          type="monotone"
          dataKey="mrr"
          stroke="hsl(18, 100%, 60%)"
          strokeWidth={2}
          name="MRR"
          dot={{ fill: 'hsl(18, 100%, 60%)' }}
        />
        <Line
          type="monotone"
          dataKey="arr"
          stroke="hsl(250, 95%, 75%)"
          strokeWidth={2}
          name="ARR"
          dot={{ fill: 'hsl(250, 95%, 75%)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
