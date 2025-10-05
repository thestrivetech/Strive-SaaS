import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface CapabilityMeterProps {
  value: number;
  label: string;
  max?: number;
  className?: string;
}

export function CapabilityMeter({ value, label, max = 100, className }: CapabilityMeterProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan" />
      <div className="relative p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm font-bold text-cyan-400">
            {value} / {max}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2 bg-card"
        />
      </div>
    </div>
  );
}
