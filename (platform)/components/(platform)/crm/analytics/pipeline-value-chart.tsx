'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { PipelineByStage } from '@/lib/modules/analytics';

/**
 * Pipeline Value Chart Component
 *
 * Displays pipeline value distribution by stage
 * Bar chart showing value at each stage
 *
 * @example
 * ```tsx
 * <PipelineValueChart data={pipelineData} />
 * ```
 */

interface PipelineValueChartProps {
  data: PipelineByStage[];
}

export function PipelineValueChart({ data }: PipelineValueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  // Format stage name for display
  const formatStage = (stage: string) => {
    return stage
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalValue)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((stage) => {
          const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const valuePercent = totalValue > 0 ? (stage.value / totalValue) * 100 : 0;

          return (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatStage(stage.stage)}</span>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(stage.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {valuePercent.toFixed(1)}% of pipeline
                  </p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
