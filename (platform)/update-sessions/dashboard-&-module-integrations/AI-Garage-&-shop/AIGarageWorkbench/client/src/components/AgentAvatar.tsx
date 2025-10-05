import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface AgentAvatarProps {
  status?: "active" | "building" | "idle";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AgentAvatar({ status = "active", size = "md", className }: AgentAvatarProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-14 h-14",
  };

  const statusColors = {
    active: "bg-emerald-500",
    building: "bg-amber-500",
    idle: "bg-slate-500",
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        sizes[size],
        "rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-1"
      )}>
        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
          <Bot className={cn(iconSizes[size], "text-cyan-400")} />
        </div>
      </div>
      <div className={cn(
        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card animate-pulse",
        statusColors[status]
      )} />
    </div>
  );
}
