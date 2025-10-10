import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Snowflake } from "lucide-react";

type LeadScore = "hot" | "warm" | "cold";

interface LeadScoreBadgeProps {
  score: LeadScore;
  showIcon?: boolean;
}

export function LeadScoreBadge({ score, showIcon = true }: LeadScoreBadgeProps) {
  const config = {
    hot: {
      label: "Hot",
      className: "bg-lead-hot/10 text-lead-hot border-lead-hot/20",
      icon: Flame,
    },
    warm: {
      label: "Warm",
      className: "bg-lead-warm/10 text-lead-warm border-lead-warm/20",
      icon: Zap,
    },
    cold: {
      label: "Cold",
      className: "bg-lead-cold/10 text-lead-cold border-lead-cold/20",
      icon: Snowflake,
    },
  };

  const { label, className, icon: Icon } = config[score];

  return (
    <Badge
      variant="outline"
      className={className}
      data-testid={`badge-lead-score-${score}`}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
