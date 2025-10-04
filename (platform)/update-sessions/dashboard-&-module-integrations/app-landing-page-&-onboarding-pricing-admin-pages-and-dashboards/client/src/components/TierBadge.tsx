import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tier = "CUSTOM" | "STARTER" | "GROWTH" | "ELITE" | "ENTERPRISE";

interface TierBadgeProps {
  tier: Tier;
}

const tierConfig: Record<Tier, { label: string; className: string }> = {
  CUSTOM: { label: "Custom", className: "bg-accent text-accent-foreground" },
  STARTER: { label: "Starter", className: "bg-secondary text-secondary-foreground" },
  GROWTH: { label: "Growth", className: "bg-primary/10 text-primary hover:bg-primary/20" },
  ELITE: { label: "Elite", className: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20" },
  ENTERPRISE: { label: "Enterprise", className: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20" }
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier];
  
  return (
    <Badge
      variant="secondary"
      className={cn("no-default-active-elevate no-default-hover-elevate", config.className)}
      data-testid={`badge-tier-${tier.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
