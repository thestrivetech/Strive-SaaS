import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Activity, CheckCircle2, FileText } from 'lucide-react';

interface CampaignStatsProps {
  metrics: {
    total: number;
    active: number;
    completed: number;
    draft: number;
  };
}

export function CampaignStats({ metrics }: CampaignStatsProps) {
  const stats = [
    {
      title: 'Total Campaigns',
      value: metrics.total,
      icon: Target,
      description: 'All campaigns',
      color: 'text-blue-500',
    },
    {
      title: 'Active',
      value: metrics.active,
      icon: Activity,
      description: 'Currently running',
      color: 'text-green-500',
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle2,
      description: 'Successfully finished',
      color: 'text-purple-500',
    },
    {
      title: 'Draft',
      value: metrics.draft,
      icon: FileText,
      description: 'Not yet published',
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
