'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './deal-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { StageConfig } from './actions';
import type { DealWithAssignee } from '@/lib/modules/crm/deals/queries';

interface PipelineColumnProps {
  stage: StageConfig;
  deals: DealWithAssignee[];
  totalValue: number;
  isUpdating?: boolean;
}

export function PipelineColumn({ stage, deals, totalValue, isUpdating }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex-shrink-0 w-80">
      <Card
        className={`transition-colors ${
          isOver ? 'ring-2 ring-primary' : ''
        } ${isUpdating ? 'opacity-50' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full bg-${stage.color}-500`}
                style={{
                  backgroundColor: `var(--${stage.color}-500, ${getColorValue(stage.color)})`,
                }}
              />
              {stage.title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
            </span>
          </div>
          <p className="text-sm font-medium text-green-600">
            {formatCurrency(totalValue)}
          </p>
        </CardHeader>
        <CardContent>
          <div
            ref={setNodeRef}
            className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto"
          >
            <SortableContext
              items={deals.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {deals.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No deals in this stage
                </div>
              ) : (
                deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
              )}
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get color values
function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    gray: '#6b7280',
    blue: '#3b82f6',
    yellow: '#eab308',
    orange: '#f97316',
    green: '#22c55e',
    emerald: '#10b981',
    red: '#ef4444',
  };

  return colors[color] || colors.gray;
}
