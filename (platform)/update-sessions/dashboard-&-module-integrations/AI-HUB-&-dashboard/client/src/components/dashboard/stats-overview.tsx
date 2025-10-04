import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Workflow, Bot, Play, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  id: string;
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card rounded-xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData: Stat[] = [
    {
      id: 'workflows',
      name: 'Active Workflows',
      value: (stats as any)?.activeWorkflows?.toString() || '0',
      change: '12%',
      changeType: 'increase',
      icon: Workflow,
      color: 'primary'
    },
    {
      id: 'agents',
      name: 'AI Agents',
      value: (stats as any)?.aiAgents?.toString() || '0',
      change: '8%',
      changeType: 'increase',
      icon: Bot,
      color: 'accent'
    },
    {
      id: 'executions',
      name: 'Executions Today',
      value: (stats as any)?.executionsToday?.toString() || '0',
      change: '23%',
      changeType: 'increase',
      icon: Play,
      color: 'neon-green'
    },
    {
      id: 'failed',
      name: 'Failed Tasks',
      value: (stats as any)?.failedTasks?.toString() || '0',
      change: '3%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'destructive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-overview">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === 'increase';
        const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

        return (
          <Card 
            key={stat.id}
            className={cn(
              "glass-card rounded-xl hover:border-opacity-50 transition-all cursor-pointer group",
              stat.color === 'primary' && "hover:border-primary/30",
              stat.color === 'accent' && "hover:border-accent/30",
              stat.color === 'neon-green' && "hover:border-neon-green/30",
              stat.color === 'destructive' && "hover:border-destructive/30"
            )}
            data-testid={`stat-${stat.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-lg transition-colors",
                  stat.color === 'primary' && "bg-primary/10 text-primary group-hover:bg-primary/20",
                  stat.color === 'accent' && "bg-accent/10 text-accent group-hover:bg-accent/20",
                  stat.color === 'neon-green' && "bg-neon-green/10 text-neon-green group-hover:bg-neon-green/20",
                  stat.color === 'destructive' && "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs flex items-center",
                  isIncrease ? "text-neon-green" : "text-destructive"
                )} data-testid={`stat-change-${stat.id}`}>
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1" data-testid={`stat-value-${stat.id}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground" data-testid={`stat-name-${stat.id}`}>{stat.name}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
