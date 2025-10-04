import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Users, Plus, X } from "lucide-react";
import { Link } from "wouter";
import TeamBoard from "@/components/teams/team-board";
import AgentAvatar from "@/components/agents/agent-avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TEAM_STRUCTURES = [
  {
    id: "HIERARCHICAL",
    name: "Hierarchical",
    description: "Top-down structure with clear command chain",
    icon: "🏢"
  },
  {
    id: "COLLABORATIVE", 
    name: "Collaborative",
    description: "Flat structure with equal participation",
    icon: "🤝"
  },
  {
    id: "PIPELINE",
    name: "Pipeline", 
    description: "Sequential workflow with handoffs",
    icon: "⚡"
  },
  {
    id: "DEMOCRATIC",
    name: "Democratic",
    description: "Consensus-based decision making",
    icon: "🗳️"
  }
];

const DEFAULT_ROLES = {
  HIERARCHICAL: ["Manager", "Lead", "Specialist", "Assistant"],
  COLLABORATIVE: ["Contributor", "Reviewer", "Coordinator"],
  PIPELINE: ["Input Handler", "Processor", "Quality Check", "Output Handler"],
  DEMOCRATIC: ["Voter", "Proposer", "Moderator"]
};

export default function TeamBuilder() {
  const params = useParams();
  const { toast } = useToast();
  const isEditing = !!params.id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    structure: "COLLABORATIVE",
    configuration: {
      roles: {} as Record<string, any>,
      communicationPatterns: [] as string[],
      decisionMaking: "consensus",
    },
  });

  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);
  const [agentRoles, setAgentRoles] = useState<Record<string, string>>({});

  // Load existing team if editing
  const { data: team, isLoading: loadingTeam } = useQuery({
    queryKey: ['/api/teams', params.id],
    enabled: isEditing,
  });

  // Load available agents
  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['/api/agents'],
  });
  
  const agents = Array.isArray(agentsData) ? agentsData : [];

  useEffect(() => {
    if (team && isEditing) {
      setFormData({
        name: (team as any).name,
        description: (team as any).description || "",
        structure: (team as any).structure,
        configuration: (team as any).configuration,
      });
    }
  }, [team, isEditing]);

  // Update roles when structure changes
  useEffect(() => {
    const defaultRoles = DEFAULT_ROLES[formData.structure as keyof typeof DEFAULT_ROLES] || [];
    const roles = defaultRoles.reduce((acc, role) => ({
      ...acc,
      [role]: {
        name: role,
        permissions: ["read", "write"],
        responsibilities: [`Handle ${role.toLowerCase()} tasks`]
      }
    }), {});

    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        roles
      }
    }));
  }, [formData.structure]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/teams/${params.id}` : '/api/teams';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Team Updated" : "Team Created",
        description: `${formData.name} has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save team",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedAgents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one agent to the team",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const addAgentToTeam = (agent: any) => {
    if (!selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents(prev => [...prev, agent]);
      
      // Assign default role
      const availableRoles = Object.keys(formData.configuration.roles);
      if (availableRoles.length > 0) {
        setAgentRoles(prev => ({
          ...prev,
          [agent.id]: availableRoles[0]
        }));
      }
    }
  };

  const removeAgentFromTeam = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.id !== agentId));
    setAgentRoles(prev => {
      const { [agentId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const updateAgentRole = (agentId: string, role: string) => {
    setAgentRoles(prev => ({
      ...prev,
      [agentId]: role
    }));
  };

  if (loadingTeam && isEditing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  const selectedStructure = TEAM_STRUCTURES.find(s => s.id === formData.structure);
  const availableRoles = Object.keys(formData.configuration.roles);

  return (
    <div className="space-y-6" data-testid="team-builder">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/teams" data-testid="button-back">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold neon-text" data-testid="page-title">
              {isEditing ? 'Edit Team' : 'New Team'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Modify your agent team' : 'Create a new agent team'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-accent to-neon-violet hover:opacity-90"
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Team'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Configuration */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter team name"
                  data-testid="input-team-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the team's purpose"
                  rows={3}
                  data-testid="input-team-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Structure</label>
                <Select 
                  value={formData.structure} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, structure: value }))}
                >
                  <SelectTrigger data-testid="select-team-structure">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_STRUCTURES.map((structure) => (
                      <SelectItem key={structure.id} value={structure.id}>
                        <div className="flex items-center space-x-2">
                          <span>{structure.icon}</span>
                          <span>{structure.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStructure && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedStructure.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Structure</span>
                  <span className="text-sm flex items-center" data-testid="stat-structure">
                    {selectedStructure?.icon} {selectedStructure?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="text-sm font-semibold" data-testid="stat-members">
                    {selectedAgents.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Roles</span>
                  <span className="text-sm" data-testid="stat-roles">
                    {availableRoles.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Visualization */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamBoard 
                structure={formData.structure as any}
                agents={selectedAgents}
                agentRoles={agentRoles}
                onUpdateRole={updateAgentRole}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Agents */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Available Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAgents ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading agents...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {agents.filter((agent: any) => !selectedAgents.find(a => a.id === agent.id)).map((agent: any) => (
                  <div 
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    data-testid={`available-agent-${agent.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <AgentAvatar agent={agent} size="sm" showStatus />
                      <div>
                        <p className="text-sm font-medium" data-testid={`agent-name-${agent.id}`}>
                          {agent.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {agent.personality?.expertise?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAgentToTeam(agent)}
                      data-testid={`button-add-agent-${agent.id}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
                {agents.filter((agent: any) => !selectedAgents.find(a => a.id === agent.id)).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">All available agents have been added</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Team Members */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Team Members ({selectedAgents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {selectedAgents.map((agent) => (
                <div 
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  data-testid={`team-member-${agent.id}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <AgentAvatar agent={agent} size="sm" showStatus />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`member-name-${agent.id}`}>
                        {agent.name}
                      </p>
                      <Select 
                        value={agentRoles[agent.id] || ""} 
                        onValueChange={(value) => updateAgentRole(agent.id, value)}
                      >
                        <SelectTrigger className="h-7 text-xs" data-testid={`select-role-${agent.id}`}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeAgentFromTeam(agent.id)}
                    className="text-destructive border-destructive/30 ml-2"
                    data-testid={`button-remove-agent-${agent.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {selectedAgents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No team members added yet</p>
                  <p className="text-xs text-muted-foreground">Add agents from the available list</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
