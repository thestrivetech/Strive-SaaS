import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  isOverdue?: boolean;
  description?: string;
}

export interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <Card data-testid="card-milestone-timeline">
      <CardHeader>
        <CardTitle className="text-base">Transaction Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex gap-4" data-testid={`milestone-item-${idx}`}>
              <div className="flex flex-col items-center">
                <div className="relative">
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-[hsl(142,71%,45%)] fill-[hsl(142,71%,45%)]" />
                  ) : milestone.isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-[hsl(0,84%,60%)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                {idx < milestones.length - 1 && (
                  <div className={`w-0.5 h-16 my-1 ${milestone.completed ? "bg-[hsl(142,71%,45%)]" : "bg-border"}`} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium text-sm ${milestone.completed ? "text-muted-foreground" : ""}`}>
                      {milestone.title}
                    </p>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-mono whitespace-nowrap ${
                      milestone.isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                    }`}
                    data-testid={`text-milestone-date-${idx}`}
                  >
                    {milestone.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
