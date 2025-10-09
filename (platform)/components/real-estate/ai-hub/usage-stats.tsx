'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Zap, Target, Activity } from 'lucide-react';

interface UsageStatsProps {
  conversationsThisMonth: number;
  tokensUsedThisMonth: number;
  mostUsedFeatures: Array<{ name: string; count: number; percentage: number }>;
  usageTrends: Array<{ month: string; conversations: number; tokens: number }>;
}

export function UsageStats({
  conversationsThisMonth,
  tokensUsedThisMonth,
  mostUsedFeatures,
  usageTrends,
}: UsageStatsProps) {
  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get top feature
  const topFeature = mostUsedFeatures.length > 0 ? mostUsedFeatures[0] : null;

  // Calculate total cost (approximate)
  const estimatedCostCents = Math.floor(tokensUsedThisMonth * 0.002);
  const estimatedCostDollars = (estimatedCostCents / 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-strong neon-border-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="glass-strong neon-border-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(tokensUsedThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ~${estimatedCostDollars} estimated cost
            </p>
          </CardContent>
        </Card>

        <Card className="glass-strong neon-border-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Feature</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topFeature ? topFeature.name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topFeature ? `${topFeature.count} uses` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Chart */}
      <Card className="glass neon-border-green">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Most Used AI Features
          </CardTitle>
          <CardDescription>
            Distribution of AI feature usage this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mostUsedFeatures.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostUsedFeatures}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} uses`, 'Count']}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No feature usage data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Trends Chart */}
      <Card className="glass neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage Trends
          </CardTitle>
          <CardDescription>
            AI usage over the past 3 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageTrends.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={usageTrends}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-xs"
                    tickFormatter={formatNumber}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'tokens' ? formatNumber(value) : value,
                      name === 'conversations' ? 'Conversations' : 'Tokens',
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="conversations"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tokens"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No usage trend data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
