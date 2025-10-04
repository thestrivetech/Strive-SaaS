import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PipelineColumn } from "./pipeline-column";
import { DealCard } from "./deal-card";

interface Deal {
  id: string;
  propertyAddress: string;
  clientName: string;
  value: string;
  stage: string;
  daysInStage: number;
  nextAction: string;
  nextActionDate: Date;
  agentAvatar?: string;
}

interface PipelineBoardProps {
  deals: Deal[];
  onDealMove?: (dealId: string, newStage: string) => void;
}

const stages = [
  { id: "lead", label: "Lead", color: "bg-chart-1" },
  { id: "qualified", label: "Qualified", color: "bg-chart-2" },
  { id: "showing", label: "Showing", color: "bg-chart-3" },
  { id: "offer", label: "Offer", color: "bg-chart-4" },
  { id: "contract", label: "Under Contract", color: "bg-chart-5" },
  { id: "closing", label: "Closing", color: "bg-primary" },
];

export function PipelineBoard({ deals, onDealMove }: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dealsByStage, setDealsByStage] = useState(() => {
    const grouped: Record<string, Deal[]> = {};
    stages.forEach((stage) => {
      grouped[stage.id] = deals.filter((d) => d.stage.toLowerCase() === stage.id);
    });
    return grouped;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const dealId = active.id as string;
    const newStage = over.id as string;

    if (stages.some((s) => s.id === newStage)) {
      setDealsByStage((prev) => {
        const newDealsByStage = { ...prev };
        let movedDeal: Deal | undefined;

        for (const stage of Object.keys(newDealsByStage)) {
          const index = newDealsByStage[stage].findIndex((d) => d.id === dealId);
          if (index !== -1) {
            [movedDeal] = newDealsByStage[stage].splice(index, 1);
            break;
          }
        }

        if (movedDeal) {
          movedDeal.stage = newStage;
          if (!newDealsByStage[newStage]) {
            newDealsByStage[newStage] = [];
          }
          newDealsByStage[newStage].push(movedDeal);
          onDealMove?.(dealId, newStage);
        }

        return newDealsByStage;
      });
    }

    setActiveId(null);
  };

  const activeDeal = activeId
    ? Object.values(dealsByStage)
        .flat()
        .find((d) => d.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" data-testid="board-pipeline">
        {stages.map((stage) => (
          <SortableContext
            key={stage.id}
            id={stage.id}
            items={dealsByStage[stage.id]?.map((d) => d.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <PipelineColumn
              id={stage.id}
              title={stage.label}
              count={dealsByStage[stage.id]?.length || 0}
              deals={dealsByStage[stage.id] || []}
              color={stage.color}
            />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 opacity-80">
            <DealCard {...activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
