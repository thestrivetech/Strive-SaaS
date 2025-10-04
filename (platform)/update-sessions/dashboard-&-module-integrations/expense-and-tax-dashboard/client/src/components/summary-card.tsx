import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
}

export function SummaryCard({ title, value, trend, trendUp, icon: Icon }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-chart-2' : 'text-destructive'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
