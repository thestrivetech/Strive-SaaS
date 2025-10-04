import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface PipelineColumnProps {
  id: string;
  title: string;
  count: number;
  deals: Deal[];
  color: string;
}

function SortableDealCard(props: Deal) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard {...props} />
    </div>
  );
}

export function PipelineColumn({ id, title, count, deals, color }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 ${isOver ? "ring-2 ring-primary" : ""}`}
      data-testid={`column-${id}`}
    >
      <div className="bg-muted rounded-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="secondary">{count}</Badge>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-add-deal-${id}`}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} {...deal} />
          ))}
          {deals.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No deals in this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
