'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SalesFunnelStage } from '@/lib/modules/analytics';

/**
 * Sales Funnel Chart Component
 *
 * Displays a horizontal funnel chart showing deals at each stage
 * Bar width represents relative count of deals
 *
 * @example
 * ```tsx
 * <SalesFunnelChart data={funnelData} />
 * ```
 */

interface SalesFunnelChartProps {
  data: SalesFunnelStage[];
}

export function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

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
        <CardTitle>Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((stage) => {
          const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

          return (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatStage(stage.stage)}</span>
                <span className="text-muted-foreground">
                  {stage.count} deals • {formatCurrency(stage.value)}
                </span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary flex items-center px-3 text-primary-foreground text-xs font-medium transition-all"
                  style={{ width: `${widthPercent}%`, minWidth: stage.count > 0 ? '2rem' : '0' }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
