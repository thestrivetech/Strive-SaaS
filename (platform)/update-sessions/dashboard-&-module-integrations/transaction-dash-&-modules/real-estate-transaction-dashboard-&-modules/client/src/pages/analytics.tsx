import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, DollarSign, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();

  const metrics = analytics ? [
    {
      title: "Total Transactions",
      value: analytics.totalTransactions.toString(),
      change: "+12% from last month",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Average Cycle Time",
      value: `${analytics.averageCycleTime} days`,
      change: `${analytics.pendingSignatures} pending signatures`,
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "Success Rate",
      value: `${analytics.successRate}%`,
      change: "+3% from last month",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Total Volume",
      value: `$${analytics.totalVolume ? (analytics.totalVolume / 1000000).toFixed(1) : "0"}M`,
      change: "+23% from last month",
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ] : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Analytics & Reports</h1>
        <p className="text-muted-foreground">Track performance and transaction metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" data-testid={`skeleton-metric-${i}`} />
          ))
        ) : (
          metrics.map((metric, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`metric-value-${idx}`}>{metric.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" data-testid="skeleton-recent-metrics" />
          ) : analytics ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Total Parties</span>
                <span className="text-sm text-muted-foreground">{analytics.totalParties}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Closing This Month</span>
                <span className="text-sm text-muted-foreground">{analytics.closingThisMonth}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Active Loops</span>
                <span className="text-sm text-muted-foreground">{analytics.activeLoops}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Pending Signatures</span>
                <span className="text-sm text-muted-foreground">{analytics.pendingSignatures}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Average Cycle Time</span>
                <span className="text-sm text-muted-foreground">{analytics.averageCycleTime} days</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
