import { Badge } from "@/components/ui/badge";
import { PhaseStatus, getPhaseConfig } from "@/lib/phase-status";

interface PhaseBadgeProps {
  status: PhaseStatus;
}

export function PhaseBadge({ status }: PhaseBadgeProps) {
  const config = getPhaseConfig(status);

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${config.textColor} ${config.borderColor}`}
      data-testid={`badge-phase-${status}`}
    >
      {config.label}
    </Badge>
  );
}
