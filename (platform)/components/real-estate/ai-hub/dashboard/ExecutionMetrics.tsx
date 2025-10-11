'use client';

import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { BarChart3, TrendingUp, Coins } from 'lucide-react';

interface ExecutionMetricsProps {
  totalExecutions: number;
  successRate: number;
  totalTokens?: number;
  totalCost?: number;
}

export function ExecutionMetrics({
  totalExecutions,
  successRate,
  totalTokens = 0,
  totalCost = 0,
}: ExecutionMetricsProps) {
  const formattedCost = totalCost.toFixed(2);

  return (
    <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle>Execution Metrics</CardTitle>
        </div>
        <CardDescription>Performance and usage statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Executions</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalExecutions}</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">{successRate}%</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Tokens Used</div>
              <div className="text-lg font-semibold">{totalTokens.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Total Cost
              </div>
              <div className="text-lg font-semibold">${formattedCost}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
