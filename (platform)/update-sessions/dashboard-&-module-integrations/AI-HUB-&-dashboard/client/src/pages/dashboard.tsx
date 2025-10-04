import { useQuery } from "@tanstack/react-query";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentExecutions from "@/components/dashboard/recent-executions";
import ActiveAgents from "@/components/dashboard/active-agents";
import SystemHealth from "@/components/dashboard/system-health";
import WorkflowCanvas from "@/components/workflow/workflow-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: templates } = useQuery({
    queryKey: ['/api/templates', { public: 'true' }],
  });

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Executions */}
        <div className="lg:col-span-2">
          <RecentExecutions />
        </div>

        {/* Active Agents */}
        <div>
          <ActiveAgents />
        </div>
      </div>

      {/* Workflow Builder Preview & Template Marketplace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workflow Builder Canvas Preview */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Workflow Builder</CardTitle>
              <Link href="/workflows/new" data-testid="button-new-workflow-preview">
                <Button className="bg-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <WorkflowCanvas isPreview />
          </CardContent>
        </Card>

        {/* Template Marketplace */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Template Marketplace</CardTitle>
              <Link href="/marketplace" data-testid="link-browse-templates">
                <Button variant="ghost" size="sm">
                  Browse All <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
              {Array.isArray(templates) && templates.slice(0, 5).map((template: any) => (
                <div 
                  key={template.id}
                  className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all cursor-pointer border border-border/30 hover:border-primary/30 group"
                  data-testid={`template-card-${template.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-chart-line text-primary-foreground"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1" data-testid={`template-name-${template.id}`}>{template.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`template-description-${template.id}`}>
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-use-template-${template.id}`}
                    >
                      Use
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3 mt-3">
                    <span className="text-xs text-muted-foreground" data-testid={`template-usage-${template.id}`}>
                      <i className="fas fa-download mr-1"></i>
                      {template.metadata.usageCount} uses
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid={`template-rating-${template.id}`}>
                      <i className="fas fa-star mr-1 text-chart-4"></i>
                      {template.metadata.rating}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-green/10 text-neon-green" data-testid={`template-category-${template.id}`}>
                      {template.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Team Workshop & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Team Workshop placeholder */}
        <div className="lg:col-span-2">
          <Card className="glass-card rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Agent Team Workshop</CardTitle>
                <Link href="/teams/new" data-testid="button-create-team">
                  <Button className="bg-gradient-to-r from-accent to-neon-violet hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Start building your first agent team to automate complex workflows</p>
                <Link href="/teams/new">
                  <Button data-testid="button-get-started-teams">Get Started</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Monitor */}
        <div>
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
