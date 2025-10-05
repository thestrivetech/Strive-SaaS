import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type OrderStatus = 
  | "DRAFT" 
  | "SUBMITTED" 
  | "IN_REVIEW" 
  | "APPROVED" 
  | "IN_PROGRESS" 
  | "TESTING" 
  | "COMPLETED" 
  | "DELIVERED" 
  | "REJECTED";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  DRAFT: { 
    label: "Draft", 
    className: "bg-slate-500/20 text-slate-300 border-slate-500/30" 
  },
  SUBMITTED: { 
    label: "Submitted", 
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30" 
  },
  IN_REVIEW: { 
    label: "In Review", 
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30" 
  },
  APPROVED: { 
    label: "Approved", 
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
  },
  TESTING: { 
    label: "Testing", 
    className: "bg-violet-500/20 text-violet-300 border-violet-500/30" 
  },
  COMPLETED: { 
    label: "Completed", 
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
  },
  DELIVERED: { 
    label: "Delivered", 
    className: "bg-green-500/20 text-green-300 border-green-500/30" 
  },
  REJECTED: { 
    label: "Rejected", 
    className: "bg-red-500/20 text-red-300 border-red-500/30" 
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "border",
        config.className,
        className
      )}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
