import { HolographicCard } from "@/components/HolographicCard";
import { StatsCard } from "@/components/StatsCard";
import { AgentAvatar } from "@/components/AgentAvatar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CapabilityMeter } from "@/components/CapabilityMeter";
import { BuildProgress } from "@/components/BuildProgress";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Wrench, ShoppingCart, Zap, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  //todo: remove mock functionality
  const activeProjects = [
    { id: "1", name: "Sales Assistant Pro", type: "agent", status: "IN_PROGRESS" as const, progress: 65 },
    { id: "2", name: "Data Analytics Tool", type: "tool", status: "TESTING" as const, progress: 90 },
    { id: "3", name: "Content Generator", type: "agent", status: "IN_PROGRESS" as const, progress: 45 },
  ];

  const milestones = [
    { id: "1", label: "Requirements Analysis", completed: true, active: false },
    { id: "2", label: "Agent Design", completed: true, active: false },
    { id: "3", label: "Development", completed: false, active: true },
    { id: "4", label: "Testing", completed: false, active: false },
    { id: "5", label: "Deployment", completed: false, active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                AI Garage & Workbench
              </h1>
              <p className="text-muted-foreground">Welcome back to your command center</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/agent-builder">
                <Button variant="default" size="default" className="gap-2" data-testid="button-new-agent">
                  <Plus className="w-4 h-4" />
                  New Agent
                </Button>
              </Link>
              <Link href="/tool-forge">
                <Button variant="outline" size="default" className="gap-2" data-testid="button-new-tool">
                  <Plus className="w-4 h-4" />
                  New Tool
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Agents"
              value={24}
              icon={Bot}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Custom Tools"
              value={18}
              icon={Wrench}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Pending Orders"
              value={7}
              icon={ShoppingCart}
            />
            <StatsCard
              title="Build Credits"
              value={85}
              icon={Zap}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Active Projects</h2>
              <Link href="/gallery">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-view-all">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {activeProjects.map((project) => (
                <HolographicCard key={project.id} glowColor="cyan">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <AgentAvatar status="building" size="md" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{project.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
                          </div>
                          <OrderStatusBadge status={project.status} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-cyan-400">{project.progress}%</span>
                          </div>
                          <div className="h-2 bg-card rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </HolographicCard>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Link href="/agent-builder">
                <HolographicCard glowColor="violet" className="cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Agent Builder</h3>
                        <p className="text-sm text-muted-foreground">Design custom AI agents</p>
                      </div>
                    </div>
                  </CardContent>
                </HolographicCard>
              </Link>

              <Link href="/tool-forge">
                <HolographicCard glowColor="emerald" className="cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Tool Forge</h3>
                        <p className="text-sm text-muted-foreground">Create custom tools</p>
                      </div>
                    </div>
                  </CardContent>
                </HolographicCard>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capability Meters */}
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CapabilityMeter value={85} label="Build Credits" max={100} />
                <CapabilityMeter value={12} label="Active Projects" max={20} />
                <CapabilityMeter value={47} label="API Quota" max={100} />
              </CardContent>
            </HolographicCard>

            {/* Build Progress */}
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle>Latest Build Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <BuildProgress milestones={milestones} />
              </CardContent>
            </HolographicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
