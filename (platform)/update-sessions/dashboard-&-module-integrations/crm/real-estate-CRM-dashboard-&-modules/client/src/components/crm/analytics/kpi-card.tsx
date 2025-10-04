import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: string;
}

export function KPICard({ title, value, trend, trendValue, subtitle }: KPICardProps) {
  return (
    <Card data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid="text-kpi-value">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && (
              <TrendingUp className="h-4 w-4 text-status-online" />
            )}
            {trend === "down" && (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            {trend === "neutral" && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`text-sm ${
                trend === "up"
                  ? "text-status-online"
                  : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
