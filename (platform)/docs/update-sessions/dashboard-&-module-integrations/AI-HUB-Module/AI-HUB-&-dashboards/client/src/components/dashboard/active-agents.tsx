import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import AgentAvatar from "@/components/agents/agent-avatar";

export default function ActiveAgents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['/api/agents'],
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-xl">
        <CardHeader>
          <CardTitle>Active Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

  const getStatusDot = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-neon-green',
      'IDLE': 'bg-chart-4',
      'BUSY': 'bg-primary',
      'OFFLINE': 'bg-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted-foreground';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Processing tasks';
      case 'IDLE':
        return 'Available';
      case 'BUSY':
        return 'Working';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="glass-card rounded-xl" data-testid="active-agents">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Active Agents</CardTitle>
          <Link href="/agents" data-testid="link-manage-agents">
            <Button variant="ghost" size="sm">
              Manage <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(agents) && agents.slice(0, 5).map((agent: any) => (
            <div 
              key={agent.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
              data-testid={`agent-${agent.id}`}
            >
              <div className="relative">
                <AgentAvatar 
                  agent={agent} 
                  size="md"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(agent.status)} rounded-full border-2 border-background`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid={`agent-name-${agent.id}`}>{agent.name}</p>
                <p className="text-xs text-muted-foreground" data-testid={`agent-status-${agent.id}`}>
                  {getStatusText(agent.status)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
          
          {(!agents || !Array.isArray(agents) || agents.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No agents found</p>
              <Link href="/agents/new">
                <Button data-testid="button-create-first-agent">Create Your First Agent</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
