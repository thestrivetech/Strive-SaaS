import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check, X, Clock, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function RecentExecutions() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ['/api/executions'],
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-xl">
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Check className="w-4 h-4 text-neon-green" />;
      case 'FAILED':
        return <X className="w-4 h-4 text-destructive" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Play className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/30">
            <Check className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
            <X className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'RUNNING':
        return (
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 status-pulse">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="glass-card rounded-xl" data-testid="recent-executions">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Executions</CardTitle>
          <Link href="/analytics" data-testid="link-view-all-executions">
            <Button variant="ghost" size="sm">
              View All <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.isArray(executions) && executions.slice(0, 5).map((execution: any) => (
            <div 
              key={execution.id}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30"
              data-testid={`execution-${execution.id}`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {getStatusIcon(execution.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid={`execution-workflow-${execution.id}`}>
                    Workflow Execution
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`execution-time-${execution.id}`}>
                    {execution.createdAt ? formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true }) : 'Unknown time'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(execution.status)}
                <span className="text-sm text-muted-foreground" data-testid={`execution-duration-${execution.id}`}>
                  {execution.executionTime ? `${execution.executionTime}ms` : '--'}
                </span>
              </div>
            </div>
          ))}
          
          {(!executions || !Array.isArray(executions) || executions.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent executions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
