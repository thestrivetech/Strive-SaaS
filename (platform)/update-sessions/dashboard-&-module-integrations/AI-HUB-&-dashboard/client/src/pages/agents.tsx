import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Settings, Trash2, Copy, Play, Pause } from "lucide-react";
import AgentAvatar from "@/components/agents/agent-avatar";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['/api/agents'],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'ACTIVE' ? 'IDLE' : 'ACTIVE';
      return apiRequest('PUT', `/api/agents/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent status",
        variant: "destructive",
      });
    }
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/agents/${id}`),
    onSuccess: () => {
      toast({
        title: "Agent Deleted",
        description: "Agent has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete agent",
        variant: "destructive",
      });
    }
  });

  const filteredAgents = Array.isArray(agents) ? agents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Active</Badge>;
      case 'IDLE':
        return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Idle</Badge>;
      case 'BUSY':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Busy</Badge>;
      case 'OFFLINE':
        return <Badge variant="outline" className="bg-muted/20 text-muted-foreground">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModelBadge = (modelConfig: any) => {
    const provider = modelConfig?.provider;
    switch (provider) {
      case 'openai':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400">OpenAI</Badge>;
      case 'anthropic':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-400">Anthropic</Badge>;
      case 'groq':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400">Groq</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="agents-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text" data-testid="page-title">AI Agents</h1>
          <p className="text-muted-foreground mt-1">Create and manage your AI agents</p>
        </div>
        <Link href="/agents/new" data-testid="button-new-agent">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-agents"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAgents && filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent: any) => (
            <Card key={agent.id} className="glass-card hover:border-primary/30 transition-all group" data-testid={`agent-card-${agent.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <AgentAvatar agent={agent} size="lg" showStatus />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="truncate" data-testid={`agent-name-${agent.id}`}>{agent.name}</CardTitle>
                      {getStatusBadge(agent.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`agent-description-${agent.id}`}>
                      {agent.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Agent Details */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Model:</span>
                    {getModelBadge(agent.modelConfig)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capabilities:</span>
                    <span className="text-xs" data-testid={`agent-capabilities-${agent.id}`}>
                      {agent.capabilities?.length || 0} skills
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-xs" data-testid={`agent-updated-${agent.id}`}>
                      {agent.updatedAt ? formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true }) : 'Never'}
                    </span>
                  </div>

                  {/* Personality Traits */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.personality?.traits?.slice(0, 3).map((trait: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs" data-testid={`agent-trait-${agent.id}-${index}`}>
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 mt-4">
                    <Link href={`/agents/${agent.id}/edit`} data-testid={`button-edit-${agent.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate({ id: agent.id, status: agent.status })}
                      disabled={toggleStatusMutation.isPending}
                      className={agent.status === 'ACTIVE' ? "text-chart-4 border-chart-4/30" : "text-neon-green border-neon-green/30"}
                      data-testid={`button-toggle-${agent.id}`}
                    >
                      {agent.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-clone-${agent.id}`}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive border-destructive/30"
                      onClick={() => deleteAgentMutation.mutate(agent.id)}
                      disabled={deleteAgentMutation.isPending}
                      data-testid={`button-delete-${agent.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first AI agent to start automating tasks"
              }
            </p>
            <Link href="/agents/new">
              <Button data-testid="button-create-first-agent">Create Your First Agent</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
