import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Settings, Trash2, Users, Play, Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [structureFilter, setStructureFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/teams/${id}`),
    onSuccess: () => {
      toast({
        title: "Team Deleted",
        description: "Team has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    }
  });

  const filteredTeams = Array.isArray(teams) ? teams.filter((team: any) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStructure = structureFilter === "all" || team.structure.toLowerCase() === structureFilter;
    return matchesSearch && matchesStructure;
  }) : [];

  const getStructureBadge = (structure: string) => {
    switch (structure) {
      case 'HIERARCHICAL':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Hierarchical</Badge>;
      case 'COLLABORATIVE':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Collaborative</Badge>;
      case 'PIPELINE':
        return <Badge className="bg-accent/20 text-accent border-accent/30">Pipeline</Badge>;
      case 'DEMOCRATIC':
        return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Democratic</Badge>;
      default:
        return <Badge variant="outline">{structure}</Badge>;
    }
  };

  const getStructureIcon = (structure: string) => {
    switch (structure) {
      case 'HIERARCHICAL':
        return '🏢';
      case 'COLLABORATIVE':
        return '🤝';
      case 'PIPELINE':
        return '⚡';
      case 'DEMOCRATIC':
        return '🗳️';
      default:
        return '👥';
    }
  };

  return (
    <div className="space-y-6" data-testid="teams-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text" data-testid="page-title">Agent Teams</h1>
          <p className="text-muted-foreground mt-1">Orchestrate multi-agent collaboration</p>
        </div>
        <Link href="/teams/new" data-testid="button-new-team">
          <Button className="bg-gradient-to-r from-accent to-neon-violet hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Team
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
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-teams"
              />
            </div>
            <Select value={structureFilter} onValueChange={setStructureFilter}>
              <SelectTrigger className="w-[200px]" data-testid="filter-structure">
                <SelectValue placeholder="Filter by structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Structures</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="collaborative">Collaborative</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
                <SelectItem value="democratic">Democratic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
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
      ) : filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team: any) => (
            <Card key={team.id} className="glass-card hover:border-primary/30 transition-all group" data-testid={`team-card-${team.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="text-2xl" data-testid={`team-icon-${team.id}`}>
                      {getStructureIcon(team.structure)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="truncate" data-testid={`team-name-${team.id}`}>{team.name}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`team-description-${team.id}`}>
                        {team.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  {getStructureBadge(team.structure)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Team Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <Badge variant="outline" data-testid={`team-members-${team.id}`}>
                      <Users className="w-3 h-3 mr-1" />
                      {/* This would come from team members query */}
                      0 agents
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Structure:</span>
                    <span className="text-xs capitalize" data-testid={`team-structure-${team.id}`}>
                      {team.structure.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-xs" data-testid={`team-updated-${team.id}`}>
                      {team.updatedAt ? formatDistanceToNow(new Date(team.updatedAt), { addSuffix: true }) : 'Never'}
                    </span>
                  </div>

                  {/* Performance Metrics (Mock data) */}
                  <div className="border-t border-border/50 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Efficiency</p>
                        <p className="font-semibold text-neon-green" data-testid={`team-efficiency-${team.id}`}>--</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-semibold" data-testid={`team-tasks-${team.id}`}>--</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 mt-4">
                    <Link href={`/teams/${team.id}/edit`} data-testid={`button-edit-${team.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-2" />
                        Manage
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-neon-green border-neon-green/30"
                      data-testid={`button-activate-${team.id}`}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Activate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive border-destructive/30"
                      onClick={() => deleteTeamMutation.mutate(team.id)}
                      disabled={deleteTeamMutation.isPending}
                      data-testid={`button-delete-${team.id}`}
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
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || structureFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first agent team to enable multi-agent collaboration"
              }
            </p>
            <Link href="/teams/new">
              <Button data-testid="button-create-first-team">Create Your First Team</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
