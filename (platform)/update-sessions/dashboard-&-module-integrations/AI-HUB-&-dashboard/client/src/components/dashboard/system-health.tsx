import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Info } from "lucide-react";

interface HealthMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'error';
}

export default function SystemHealth() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['/api/system/health'],
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-xl">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics: HealthMetric[] = [
    {
      name: 'API Response',
      value: (health as any)?.apiResponse || 0,
      status: (health as any)?.apiResponse >= 95 ? 'good' : (health as any)?.apiResponse >= 85 ? 'warning' : 'error'
    },
    {
      name: 'Workflow Success',
      value: (health as any)?.workflowSuccess || 0,
      status: (health as any)?.workflowSuccess >= 95 ? 'good' : (health as any)?.workflowSuccess >= 85 ? 'warning' : 'error'
    },
    {
      name: 'Agent Uptime',
      value: (health as any)?.agentUptime || 0,
      status: (health as any)?.agentUptime >= 95 ? 'good' : (health as any)?.agentUptime >= 85 ? 'warning' : 'error'
    },
    {
      name: 'Database Load',
      value: (health as any)?.databaseLoad || 0,
      status: (health as any)?.databaseLoad <= 70 ? 'good' : (health as any)?.databaseLoad <= 85 ? 'warning' : 'error'
    },
    {
      name: 'Memory Usage',
      value: (health as any)?.memoryUsage || 0,
      status: (health as any)?.memoryUsage <= 80 ? 'good' : (health as any)?.memoryUsage <= 90 ? 'warning' : 'error'
    }
  ];

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-neon-green';
      case 'warning':
        return 'bg-chart-4';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-neon-green';
      case 'warning':
        return 'text-chart-4';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="glass-card rounded-xl" data-testid="system-health">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>System Health</CardTitle>
          <div className="w-3 h-3 bg-neon-green rounded-full status-pulse" data-testid="health-indicator"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} data-testid={`health-metric-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.name}</span>
                <span className={`text-sm font-semibold ${getTextColor(metric.status)}`} data-testid={`health-value-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {metric.value}%
                </span>
              </div>
              <Progress 
                value={metric.value} 
                className="h-2"
                indicatorClassName={getProgressColor(metric.status)}
              />
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider" data-testid="events-title">Recent Events</p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2 text-xs" data-testid="event-backup">
              <CheckCircle className="w-3 h-3 text-neon-green mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">System backup completed</span>
            </div>
            <div className="flex items-start space-x-2 text-xs" data-testid="event-integration">
              <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">New integration deployed</span>
            </div>
            <div className="flex items-start space-x-2 text-xs" data-testid="event-security">
              <CheckCircle className="w-3 h-3 text-neon-green mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Security scan passed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
