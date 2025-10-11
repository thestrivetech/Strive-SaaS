'use client';

import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { GitBranch, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WorkflowOverviewProps {
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  recentExecutions?: Array<{
    id: string;
    status: string;
    automation_workflow?: {
      name: string;
      description?: string | null;
    } | null;
    started_at: Date;
  }>;
}

export function WorkflowOverview({
  activeWorkflows,
  totalExecutions,
  successRate,
  recentExecutions = [],
}: WorkflowOverviewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      COMPLETED: 'default',
      FAILED: 'destructive',
      RUNNING: 'secondary',
      PENDING: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <CardTitle>Workflow Overview</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/ai-hub/workflows">View All</Link>
          </Button>
        </div>
        <CardDescription>Active automation workflows and recent executions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeWorkflows}</div>
            <div className="text-xs text-muted-foreground">Active Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalExecutions}</div>
            <div className="text-xs text-muted-foreground">Total Executions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold mb-3">Recent Executions</h4>
          {recentExecutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No executions yet. Create a workflow to get started.
            </div>
          ) : (
            recentExecutions.slice(0, 5).map((execution) => (
              <div
                key={execution.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(execution.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {execution.automation_workflow?.name || 'Unnamed Workflow'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(execution.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadge(execution.status)}>
                  {execution.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
