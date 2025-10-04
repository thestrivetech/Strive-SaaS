import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: "currency" | "number" | "percentage" | "days";
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, change, format = "number", icon }: MetricCardProps) {
  const formattedValue = typeof value === "number" 
    ? format === "currency" 
      ? `$${value.toLocaleString()}`
      : format === "percentage"
      ? `${value}%`
      : format === "days"
      ? `${value} days`
      : value.toLocaleString()
    : value;

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-mono" data-testid={`metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {formattedValue}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive && "text-chart-3",
              isNegative && "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-primary/20">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
