'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsData {
  free_count?: number;
  starter_count?: number;
  growth_count?: number;
  elite_count?: number;
  enterprise_count?: number;
}

interface SubscriptionChartProps {
  data: MetricsData | null;
  loading?: boolean;
}

const COLORS = {
  free: 'hsl(215, 20%, 65%)',
  starter: 'hsl(18, 100%, 60%)',
  growth: 'hsl(250, 95%, 75%)',
  elite: 'hsl(197, 100%, 45%)',
  enterprise: 'hsl(283, 100%, 65%)',
};

export function SubscriptionChart({ data, loading }: SubscriptionChartProps) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = [
    { name: 'Free', value: data.free_count || 0, color: COLORS.free },
    { name: 'Starter', value: data.starter_count || 0, color: COLORS.starter },
    { name: 'Growth', value: data.growth_count || 0, color: COLORS.growth },
    { name: 'Elite', value: data.elite_count || 0, color: COLORS.elite },
    { name: 'Enterprise', value: data.enterprise_count || 0, color: COLORS.enterprise },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No subscription data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
