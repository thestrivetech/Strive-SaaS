import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  completed: boolean;
  onToggle?: (id: string) => void;
}

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-lead-warm/10 text-lead-warm border-lead-warm/20",
  low: "bg-muted text-muted-foreground border-muted",
};

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  completed,
  onToggle,
}: TaskCardProps) {
  const isOverdue = !completed && dueDate < new Date();

  return (
    <Card
      className={`hover-elevate ${completed ? "opacity-60" : ""}`}
      data-testid={`card-task-${id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={completed}
            onCheckedChange={() => onToggle?.(id)}
            className="mt-1"
            data-testid={`checkbox-task-${id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4
                className={`font-medium text-sm ${
                  completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {title}
              </h4>
              <Badge variant="outline" className={priorityColors[priority]}>
                {priority}
              </Badge>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(dueDate, "MMM d, yyyy")}</span>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-destructive" : ""
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>
                  {isOverdue ? "Overdue" : formatDistanceToNow(dueDate, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
