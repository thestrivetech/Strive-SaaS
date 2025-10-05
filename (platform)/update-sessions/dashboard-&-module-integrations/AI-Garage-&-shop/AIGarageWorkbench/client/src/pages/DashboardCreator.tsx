import { useState } from "react";
import { HolographicCard } from "@/components/HolographicCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, BarChart3, PieChart, TrendingUp, Database, Clock, DollarSign, Calendar, Check } from "lucide-react";

export default function DashboardCreator() {
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");
  const [complexity, setComplexity] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedVisualizations, setSelectedVisualizations] = useState<string[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);

  const dashboardTemplates = [
    {
      id: "analytics",
      name: "Analytics Dashboard",
      description: "Track user behavior, metrics, and KPIs",
      icon: BarChart3,
      color: "cyan" as const,
      estimatedHours: 20,
    },
    {
      id: "sales",
      name: "Sales Dashboard",
      description: "Monitor revenue, deals, and pipeline",
      icon: TrendingUp,
      color: "emerald" as const,
      estimatedHours: 18,
    },
    {
      id: "marketing",
      name: "Marketing Dashboard",
      description: "Campaign performance and conversions",
      icon: PieChart,
      color: "violet" as const,
      estimatedHours: 16,
    },
    {
      id: "operations",
      name: "Operations Dashboard",
      description: "Monitor systems, processes, and efficiency",
      icon: Database,
      color: "cyan" as const,
      estimatedHours: 22,
    },
  ];

  const visualizationTypes = [
    { id: "line-charts", name: "Line Charts", hours: 2 },
    { id: "bar-charts", name: "Bar Charts", hours: 2 },
    { id: "pie-charts", name: "Pie Charts", hours: 2 },
    { id: "tables", name: "Data Tables", hours: 3 },
    { id: "metrics", name: "Metric Cards", hours: 1 },
    { id: "heatmaps", name: "Heatmaps", hours: 4 },
    { id: "gauges", name: "Gauges", hours: 3 },
    { id: "timelines", name: "Timelines", hours: 3 },
  ];

  const dataSources = [
    { id: "postgresql", name: "PostgreSQL" },
    { id: "mongodb", name: "MongoDB" },
    { id: "mysql", name: "MySQL" },
    { id: "rest-api", name: "REST API" },
    { id: "graphql", name: "GraphQL" },
    { id: "csv", name: "CSV/Excel" },
    { id: "google-analytics", name: "Google Analytics" },
    { id: "stripe", name: "Stripe" },
  ];

  const complexityLevels = [
    { value: "BASIC", label: "Basic (Single page, 3-5 widgets)", hours: 15 },
    { value: "STANDARD", label: "Standard (Multiple views, 8-12 widgets)", hours: 30 },
    { value: "ADVANCED", label: "Advanced (Complex data, 15+ widgets)", hours: 50 },
    { value: "ENTERPRISE", label: "Enterprise (Multi-tenant, custom features)", hours: 80 },
  ];

  const toggleVisualization = (id: string) => {
    setSelectedVisualizations(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleDataSource = (id: string) => {
    setSelectedDataSources(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const calculateEstimate = () => {
    let totalHours = 0;
    let baseCost = 0;

    const complexityData = complexityLevels.find(c => c.value === complexity);
    if (complexityData) {
      totalHours += complexityData.hours;
    }

    selectedVisualizations.forEach(vizId => {
      const viz = visualizationTypes.find(v => v.id === vizId);
      if (viz) totalHours += viz.hours;
    });

    const dataSourceCount = selectedDataSources.length;
    totalHours += dataSourceCount * 3;

    baseCost = totalHours * 150;

    return { hours: totalHours, cost: baseCost };
  };

  const estimate = calculateEstimate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Creator</h1>
              <p className="text-muted-foreground">Design your custom analytics dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dashboard Templates */}
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardTemplates.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <div
                        key={template.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-border hover-elevate"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                        data-testid={`template-${template.id}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>~{template.estimatedHours}h base</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </HolographicCard>

            {/* Project Details */}
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle>Dashboard Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dashboard-title">Dashboard Title</Label>
                  <Input
                    id="dashboard-title"
                    data-testid="input-dashboard-title"
                    placeholder="e.g., Executive Sales Analytics"
                    value={dashboardTitle}
                    onChange={(e) => setDashboardTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="dashboard-description">Requirements Description</Label>
                  <Textarea
                    id="dashboard-description"
                    data-testid="input-dashboard-description"
                    placeholder="Describe what metrics and insights you need to track..."
                    value={dashboardDescription}
                    onChange={(e) => setDashboardDescription(e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="complexity">Dashboard Complexity</Label>
                  <Select value={complexity} onValueChange={setComplexity}>
                    <SelectTrigger className="mt-2" data-testid="select-complexity">
                      <SelectValue placeholder="Select complexity level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {complexityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} data-testid={`select-item-${level.value.toLowerCase()}`}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </HolographicCard>

            {/* Visualization Types */}
            <HolographicCard glowColor="emerald">
              <CardHeader>
                <CardTitle>Visualization Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visualizationTypes.map((viz) => {
                    const isSelected = selectedVisualizations.includes(viz.id);
                    return (
                      <div
                        key={viz.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-border hover-elevate"
                        }`}
                        onClick={() => toggleVisualization(viz.id)}
                        data-testid={`viz-${viz.id}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleVisualization(viz.id)}
                          className="pointer-events-none"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{viz.name}</p>
                          <p className="text-xs text-muted-foreground">+{viz.hours}h</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </HolographicCard>

            {/* Data Sources */}
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle>Data Sources & Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dataSources.map((source) => {
                    const isSelected = selectedDataSources.includes(source.id);
                    return (
                      <div
                        key={source.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                          isSelected
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-border hover-elevate"
                        }`}
                        onClick={() => toggleDataSource(source.id)}
                        data-testid={`source-${source.id}`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        )}
                        <p className="text-xs font-medium text-foreground">{source.name}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </HolographicCard>
          </div>

          {/* Estimation Sidebar */}
          <div className="space-y-6">
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dashboard</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-title">
                    {dashboardTitle || "Untitled Dashboard"}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Template</span>
                    <span className="text-sm font-medium text-foreground capitalize" data-testid="text-summary-template">
                      {selectedTemplate || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Complexity</span>
                    <span className="text-sm font-medium text-foreground" data-testid="text-summary-complexity">
                      {complexity ? complexityLevels.find(c => c.value === complexity)?.label.split(' ')[0] : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Visualizations</span>
                    <Badge variant="outline" data-testid="text-summary-visualizations-count">{selectedVisualizations.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Sources</span>
                    <Badge variant="outline" data-testid="text-summary-datasources-count">{selectedDataSources.length}</Badge>
                  </div>
                </div>

                {selectedVisualizations.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Selected Components:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedVisualizations.map(vizId => {
                        const viz = visualizationTypes.find(v => v.id === vizId);
                        return (
                          <Badge key={vizId} variant="outline" className="text-xs">
                            {viz?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </HolographicCard>

            <HolographicCard glowColor="emerald">
              <CardHeader>
                <CardTitle>Development Estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Time</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-estimate-hours">{estimate.hours} hours</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-estimate-cost">${estimate.cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Timeline</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-estimate-timeline">
                        {estimate.hours > 0 ? `${Math.ceil(estimate.hours / 8)} business days` : "TBD"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="default"
                  disabled={!dashboardTitle || !complexity || selectedVisualizations.length === 0}
                  data-testid="button-submit-request"
                  onClick={() => {
                    console.log("Submitting dashboard request:", {
                      title: dashboardTitle,
                      description: dashboardDescription,
                      template: selectedTemplate,
                      complexity,
                      visualizations: selectedVisualizations,
                      dataSources: selectedDataSources,
                      estimate
                    });
                  }}
                >
                  Submit Dashboard Request
                </Button>
              </CardContent>
            </HolographicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
