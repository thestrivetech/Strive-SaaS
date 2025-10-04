import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileCheck, XCircle, FileText, AlertCircle } from "lucide-react";
import type { LoopStatus } from "./loop-card";

export interface StatusBadgeProps {
  status: LoopStatus;
  size?: "sm" | "default";
  showIcon?: boolean;
}

const statusConfig: Record<LoopStatus, { label: string; className: string; icon: any }> = {
  draft: { label: "Draft", className: "bg-[hsl(220,13%,69%)] text-white", icon: FileText },
  active: { label: "Active", className: "bg-[hsl(221,83%,53%)] text-white", icon: Clock },
  underContract: { label: "Under Contract", className: "bg-[hsl(262,83%,58%)] text-white", icon: FileCheck },
  closing: { label: "Closing", className: "bg-[hsl(38,92%,50%)] text-white", icon: AlertCircle },
  closed: { label: "Closed", className: "bg-[hsl(142,71%,45%)] text-white", icon: Check },
  cancelled: { label: "Cancelled", className: "bg-[hsl(0,84%,60%)] text-white", icon: XCircle },
};

export default function StatusBadge({ status, size = "default", showIcon = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge className={config.className} data-testid={`badge-status-${status}`}>
      {showIcon && <Icon className={`${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} mr-1`} />}
      {config.label}
    </Badge>
  );
}
