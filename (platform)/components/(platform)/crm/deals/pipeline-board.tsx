'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { PipelineColumn } from './pipeline-column';
import { DealCard } from './deal-card';
import { updateDealStage } from '@/lib/modules/deals';
import { useToast } from '@/hooks/use-toast';
import type { DealStage } from '@prisma/client';
import type { DealsByStageResult } from '@/lib/modules/deals';
import { PIPELINE_STAGES } from '@/lib/modules/deals';

interface PipelineBoardProps {
  dealsByStage: DealsByStageResult;
}

export function PipelineBoard({ dealsByStage }: PipelineBoardProps) {
  const [activeDeal, setActiveDeal] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Only show active stages (not closed)
  const activeStages = PIPELINE_STAGES.filter(
    (stage) => stage.id !== 'CLOSED_WON' && stage.id !== 'CLOSED_LOST'
  );

  async function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    // Find the deal being dragged
    const deal = dealsByStage
      .flatMap((stage) => stage.deals)
      .find((d) => d.id === active.id);

    setActiveDeal(deal);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveDeal(null);
      return;
    }

    const dealId = active.id as string;
    const newStage = over.id as DealStage;
    const stageConfig = PIPELINE_STAGES.find((s) => s.id === newStage);

    if (!stageConfig) {
      setActiveDeal(null);
      return;
    }

    setIsUpdating(true);

    try {
      await updateDealStage({
        id: dealId,
        stage: newStage,
        probability: stageConfig.probability,
      });

      toast({
        title: 'Deal updated',
        description: `Deal moved to ${stageConfig.title}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update deal stage',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setActiveDeal(null);
    }
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {activeStages.map((stage) => {
          const stageData = dealsByStage.find((s) => s.stage === stage.id);
          const deals = stageData?.deals || [];
          const totalValue = stageData?.totalValue || 0;

          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={deals}
              totalValue={totalValue}
              isUpdating={isUpdating}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
