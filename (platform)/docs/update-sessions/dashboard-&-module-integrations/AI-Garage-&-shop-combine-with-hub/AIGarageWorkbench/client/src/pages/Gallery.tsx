import { HolographicCard } from "@/components/HolographicCard";
import { AgentAvatar } from "@/components/AgentAvatar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function Gallery() {
  //todo: remove mock functionality
  const projects = [
    { id: "1", name: "Sales AI Pro", type: "agent", status: "COMPLETED" as const, category: "sales" },
    { id: "2", name: "Analytics Dashboard", type: "tool", status: "DELIVERED" as const, category: "analysis" },
    { id: "3", name: "Content Engine", type: "agent", status: "COMPLETED" as const, category: "content" },
    { id: "4", name: "Support Assistant", type: "agent", status: "DELIVERED" as const, category: "support" },
    { id: "5", name: "Data Pipeline", type: "tool", status: "COMPLETED" as const, category: "automation" },
    { id: "6", name: "Email Bot", type: "agent", status: "DELIVERED" as const, category: "content" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gallery</h1>
              <p className="text-muted-foreground">Showcase of completed creations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <HolographicCard key={project.id} glowColor="violet">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <AgentAvatar status="active" size="md" />
                  <OrderStatusBadge status={project.status} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">
                    {project.type}
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {project.category}
                  </Badge>
                </div>
              </CardContent>
            </HolographicCard>
          ))}
        </div>
      </div>
    </div>
  );
}
