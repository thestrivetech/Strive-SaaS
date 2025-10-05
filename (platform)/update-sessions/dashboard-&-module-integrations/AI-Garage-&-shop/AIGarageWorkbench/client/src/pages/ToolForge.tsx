import { HolographicCard } from "@/components/HolographicCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Code, Database, Zap, Cloud } from "lucide-react";

export default function ToolForge() {
  const toolCategories = [
    {
      icon: Code,
      name: "API Connectors",
      description: "Connect to external APIs and services",
      color: "cyan" as const,
    },
    {
      icon: Database,
      name: "Data Processors",
      description: "Transform and analyze data streams",
      color: "violet" as const,
    },
    {
      icon: Zap,
      name: "Automation",
      description: "Automate workflows and tasks",
      color: "emerald" as const,
    },
    {
      icon: Cloud,
      name: "Cloud Services",
      description: "Deploy and scale in the cloud",
      color: "cyan" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <Wrench className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tool Forge Laboratory</h1>
              <p className="text-muted-foreground">Create custom business tools</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolCategories.map((category) => (
            <HolographicCard key={category.name} glowColor={category.color}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  data-testid={`button-create-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => console.log(`Creating ${category.name}`)}
                >
                  Create Tool
                </Button>
              </CardContent>
            </HolographicCard>
          ))}
        </div>
      </div>
    </div>
  );
}
