import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Play, Pause, Settings, Trash2, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['/api/workflows'],
  });

  const filteredWorkflows = Array.isArray(workflows) ? workflows.filter((workflow: any) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Active</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="bg-muted/20">Draft</Badge>;
      case 'PAUSED':
        return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Paused</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" className="bg-muted/20 text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="workflows-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text" data-testid="page-title">Workflows</h1>
          <p className="text-muted-foreground mt-1">Build and manage your automation workflows</p>
        </div>
        <Link href="/workflows/new" data-testid="button-new-workflow">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
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
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-workflows"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow: any) => (
            <Card key={workflow.id} className="glass-card hover:border-primary/30 transition-all group" data-testid={`workflow-card-${workflow.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate" data-testid={`workflow-name-${workflow.id}`}>{workflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`workflow-description-${workflow.id}`}>
                      {workflow.description || "No description provided"}
                    </p>
                  </div>
                  {getStatusBadge(workflow.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span data-testid={`workflow-nodes-${workflow.id}`}>
                    {workflow.nodes?.length || 0} nodes
                  </span>
                  <span data-testid={`workflow-updated-${workflow.id}`}>
                    {workflow.updatedAt ? formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true }) : 'Never updated'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/workflows/${workflow.id}/edit`} data-testid={`button-edit-${workflow.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={workflow.status === 'ACTIVE' ? "text-chart-4 border-chart-4/30" : "text-neon-green border-neon-green/30"}
                    data-testid={`button-toggle-${workflow.id}`}
                  >
                    {workflow.status === 'ACTIVE' ? (
                      <>
                        <Pause className="w-3 h-3 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-2" />
                        Run
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-clone-${workflow.id}`}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" data-testid={`button-delete-${workflow.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first workflow to start automating tasks"
              }
            </p>
            <Link href="/workflows/new">
              <Button data-testid="button-create-first-workflow">Create Your First Workflow</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
