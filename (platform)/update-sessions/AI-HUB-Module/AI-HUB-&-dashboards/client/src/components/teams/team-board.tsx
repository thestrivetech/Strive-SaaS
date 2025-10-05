import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AgentAvatar from "@/components/agents/agent-avatar";
import { ArrowDown, ArrowRight, Users, Crown, Zap } from "lucide-react";

interface TeamBoardProps {
  structure: 'HIERARCHICAL' | 'COLLABORATIVE' | 'PIPELINE' | 'DEMOCRATIC';
  agents: any[];
  agentRoles: Record<string, string>;
  onUpdateRole: (agentId: string, role: string) => void;
}

const STRUCTURE_LAYOUTS = {
  HIERARCHICAL: {
    name: 'Hierarchical',
    description: 'Top-down command structure',
    icon: '🏢',
    roles: ['Manager', 'Lead', 'Specialist', 'Assistant']
  },
  COLLABORATIVE: {
    name: 'Collaborative', 
    description: 'Flat structure with equal participation',
    icon: '🤝',
    roles: ['Contributor', 'Reviewer', 'Coordinator']
  },
  PIPELINE: {
    name: 'Pipeline',
    description: 'Sequential workflow with handoffs',
    icon: '⚡',
    roles: ['Input Handler', 'Processor', 'Quality Check', 'Output Handler']
  },
  DEMOCRATIC: {
    name: 'Democratic',
    description: 'Consensus-based decision making', 
    icon: '🗳️',
    roles: ['Voter', 'Proposer', 'Moderator']
  }
};

export default function TeamBoard({ structure, agents, agentRoles, onUpdateRole }: TeamBoardProps) {
  const layoutConfig = STRUCTURE_LAYOUTS[structure];
  const availableRoles = layoutConfig.roles;

  const agentsByRole = useMemo(() => {
    const roleGroups: Record<string, any[]> = {};
    availableRoles.forEach(role => {
      roleGroups[role] = [];
    });

    agents.forEach(agent => {
      const role = agentRoles[agent.id];
      if (role && roleGroups[role]) {
        roleGroups[role].push(agent);
      }
    });

    return roleGroups;
  }, [agents, agentRoles, availableRoles]);

  const getRoleIcon = (role: string) => {
    const roleIcons: Record<string, string> = {
      'Manager': '👑',
      'Lead': '⭐',
      'Specialist': '🎯',
      'Assistant': '🤝',
      'Contributor': '✍️',
      'Reviewer': '🔍',
      'Coordinator': '🎯',
      'Input Handler': '📥',
      'Processor': '⚙️',
      'Quality Check': '✅',
      'Output Handler': '📤',
      'Voter': '🗳️',
      'Proposer': '💡',
      'Moderator': '⚖️'
    };
    return roleIcons[role] || '👤';
  };

  const renderHierarchicalStructure = () => (
    <div className="space-y-6" data-testid="hierarchical-structure">
      {availableRoles.map((role, index) => {
        const roleAgents = agentsByRole[role] || [];
        const isManager = role === 'Manager';
        
        return (
          <div key={role} className="space-y-3">
            {/* Role Header */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getRoleIcon(role)}</div>
              <div className="flex-1">
                <h4 className="font-semibold flex items-center">
                  {role}
                  {isManager && <Crown className="w-4 h-4 ml-2 text-chart-4" />}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {roleAgents.length} agent{roleAgents.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
            </div>

            {/* Role Agents */}
            <div className={`grid gap-3 ${isManager ? 'grid-cols-1 justify-center' : 'grid-cols-2 md:grid-cols-3'}`}>
              {roleAgents.map((agent) => (
                <Card key={agent.id} className="glass-panel hover:border-primary/30 transition-all" data-testid={`role-agent-${agent.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AgentAvatar agent={agent} size="md" showStatus />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{agent.name}</p>
                        <Select 
                          value={agentRoles[agent.id] || ""} 
                          onValueChange={(value) => onUpdateRole(agent.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs mt-1" data-testid={`select-role-${agent.id}`}>
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((roleOption) => (
                              <SelectItem key={roleOption} value={roleOption}>
                                <div className="flex items-center space-x-2">
                                  <span>{getRoleIcon(roleOption)}</span>
                                  <span>{roleOption}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty slot indicator */}
              {roleAgents.length === 0 && (
                <div className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-border/50 text-muted-foreground">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No agents assigned</p>
                  </div>
                </div>
              )}
            </div>

            {/* Connection arrows */}
            {index < availableRoles.length - 1 && (
              <div className="flex justify-center">
                <ArrowDown className="w-6 h-6 text-primary/50" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCollaborativeStructure = () => (
    <div className="space-y-4" data-testid="collaborative-structure">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🤝</div>
        <h3 className="font-semibold">Collaborative Team</h3>
        <p className="text-sm text-muted-foreground">All members work together as equals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="glass-panel hover:border-primary/30 transition-all" data-testid={`collab-agent-${agent.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <AgentAvatar agent={agent} size="md" showStatus />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{agent.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {agentRoles[agent.id] || 'Contributor'}
                  </Badge>
                </div>
              </div>
              <Select 
                value={agentRoles[agent.id] || ""} 
                onValueChange={(value) => onUpdateRole(agent.id, value)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid={`select-role-${agent.id}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center space-x-2">
                        <span>{getRoleIcon(role)}</span>
                        <span>{role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPipelineStructure = () => (
    <div className="space-y-4" data-testid="pipeline-structure">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚡</div>
        <h3 className="font-semibold">Pipeline Workflow</h3>
        <p className="text-sm text-muted-foreground">Sequential processing with handoffs</p>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-4">
        {availableRoles.map((role, index) => {
          const roleAgents = agentsByRole[role] || [];
          
          return (
            <div key={role} className="flex items-center space-x-4 flex-shrink-0">
              <Card className="glass-panel w-48" data-testid={`pipeline-stage-${role.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-1">{getRoleIcon(role)}</div>
                    <h4 className="font-semibold text-sm">{role}</h4>
                    <p className="text-xs text-muted-foreground">
                      Stage {index + 1}
                    </p>
                  </div>

                  {roleAgents.length > 0 ? (
                    <div className="space-y-2">
                      {roleAgents.map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-2" data-testid={`pipeline-agent-${agent.id}`}>
                          <AgentAvatar agent={agent} size="sm" showStatus />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{agent.name}</p>
                            <Select 
                              value={agentRoles[agent.id] || ""} 
                              onValueChange={(value) => onUpdateRole(agent.id, value)}
                            >
                              <SelectTrigger className="h-6 text-xs" data-testid={`select-role-${agent.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((roleOption) => (
                                  <SelectItem key={roleOption} value={roleOption}>
                                    {roleOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No agent assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {index < availableRoles.length - 1 && (
                <ArrowRight className="w-6 h-6 text-primary/50 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDemocraticStructure = () => (
    <div className="space-y-4" data-testid="democratic-structure">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🗳️</div>
        <h3 className="font-semibold">Democratic Team</h3>
        <p className="text-sm text-muted-foreground">Consensus-based decision making</p>
      </div>

      <div className="relative">
        {/* Central decision circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="glass-panel w-24 h-24 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">⚖️</div>
              <p className="text-xs font-semibold">Consensus</p>
            </div>
          </Card>
        </div>

        {/* Agents arranged in circle */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 pb-12">
          {agents.map((agent, index) => {
            const angle = (index * 360) / agents.length;
            const radius = 120;
            const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
            const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
            
            return (
              <div key={agent.id} className="relative">
                <Card className="glass-panel hover:border-primary/30 transition-all" data-testid={`democratic-agent-${agent.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <AgentAvatar agent={agent} size="md" showStatus />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{agent.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {agentRoles[agent.id] || 'Voter'}
                        </Badge>
                      </div>
                    </div>
                    <Select 
                      value={agentRoles[agent.id] || ""} 
                      onValueChange={(value) => onUpdateRole(agent.id, value)}
                    >
                      <SelectTrigger className="h-8 text-xs" data-testid={`select-role-${agent.id}`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center space-x-2">
                              <span>{getRoleIcon(role)}</span>
                              <span>{role}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStructure = () => {
    switch (structure) {
      case 'HIERARCHICAL':
        return renderHierarchicalStructure();
      case 'COLLABORATIVE':
        return renderCollaborativeStructure();
      case 'PIPELINE':
        return renderPipelineStructure();
      case 'DEMOCRATIC':
        return renderDemocraticStructure();
      default:
        return renderCollaborativeStructure();
    }
  };

  if (agents.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-team-board">
        <div className="text-6xl mb-4">{layoutConfig.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{layoutConfig.name} Structure</h3>
        <p className="text-muted-foreground mb-4">{layoutConfig.description}</p>
        <div className="text-sm text-muted-foreground">
          <p>Add team members to visualize the structure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-board">
      {/* Structure Info */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{layoutConfig.icon}</div>
          <div>
            <h3 className="font-semibold">{layoutConfig.name} Structure</h3>
            <p className="text-sm text-muted-foreground">{layoutConfig.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" data-testid="team-member-count">{agents.length}</p>
          <p className="text-xs text-muted-foreground">Team Members</p>
        </div>
      </div>

      {/* Structure Visualization */}
      {renderStructure()}
    </div>
  );
}
