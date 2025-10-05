import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface Milestone {
  id: string;
  label: string;
  completed: boolean;
  active: boolean;
}

interface BuildProgressProps {
  milestones: Milestone[];
  className?: string;
}

export function BuildProgress({ milestones, className }: BuildProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {milestones.map((milestone, index) => (
        <div
          key={milestone.id}
          className="flex items-center gap-4 transition-all duration-700"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
            milestone.completed
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
              : milestone.active
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse"
              : "bg-card border-border text-muted-foreground"
          )}>
            {milestone.completed ? (
              <Check className="w-5 h-5" />
            ) : milestone.active ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <div className="flex-1">
            <p className={cn(
              "font-medium transition-colors",
              milestone.completed || milestone.active
                ? "text-foreground"
                : "text-muted-foreground"
            )}>
              {milestone.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
