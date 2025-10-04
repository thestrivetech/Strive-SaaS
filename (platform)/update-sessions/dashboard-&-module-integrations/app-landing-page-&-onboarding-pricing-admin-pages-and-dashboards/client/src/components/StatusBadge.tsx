import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success/10 text-success hover:bg-success/20" },
  CANCELED: { label: "Canceled", className: "bg-muted text-muted-foreground" },
  PAST_DUE: { label: "Past Due", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  TRIALING: { label: "Trial", className: "bg-warning/10 text-warning hover:bg-warning/20" }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="secondary"
      className={cn("no-default-active-elevate no-default-hover-elevate", config.className)}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
