'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface TrendChartProps {
  data: Array<{
    month: string;
    views: number;
    engagement: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke="hsl(240 100% 27%)"
          strokeWidth={2}
          name="Views"
          dot={{ fill: 'hsl(240 100% 27%)' }}
        />
        <Line
          type="monotone"
          dataKey="engagement"
          stroke="#10b981"
          strokeWidth={2}
          name="Engagement"
          dot={{ fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
