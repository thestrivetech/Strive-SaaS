import { useState } from "react";
import { HolographicCard } from "@/components/HolographicCard";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, DollarSign, Calendar } from "lucide-react";

export default function OrderStudio() {
  const [orderTitle, setOrderTitle] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [useCase, setUseCase] = useState("");
  const [complexity, setComplexity] = useState("");

  //todo: remove mock functionality
  const useCaseTemplates = [
    { id: "sales", name: "Sales Assistant", estimatedHours: 15, cost: 2250 },
    { id: "support", name: "Support Bot", estimatedHours: 12, cost: 1800 },
    { id: "analyst", name: "Data Analyst", estimatedHours: 25, cost: 3750 },
    { id: "content", name: "Content Creator", estimatedHours: 18, cost: 2700 },
  ];

  const complexityLevels = [
    { value: "SIMPLE", label: "Simple (1-5 hours)", color: "emerald" },
    { value: "MODERATE", label: "Moderate (5-20 hours)", color: "cyan" },
    { value: "COMPLEX", label: "Complex (20-50 hours)", color: "violet" },
    { value: "ENTERPRISE", label: "Enterprise (50+ hours)", color: "amber" },
  ];

  const getEstimate = () => {
    if (complexity === "SIMPLE") return { hours: 3, cost: 450 };
    if (complexity === "MODERATE") return { hours: 12, cost: 1800 };
    if (complexity === "COMPLEX") return { hours: 35, cost: 5250 };
    if (complexity === "ENTERPRISE") return { hours: 75, cost: 11250 };
    return { hours: 0, cost: 0 };
  };

  const estimate = getEstimate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Studio</h1>
              <p className="text-muted-foreground">Build your custom AI solution request</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="order-title">Project Title</Label>
                  <Input
                    id="order-title"
                    data-testid="input-order-title"
                    placeholder="e.g., Custom Sales Agent for SaaS"
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="order-description">Description</Label>
                  <Textarea
                    id="order-description"
                    data-testid="input-order-description"
                    placeholder="Describe your requirements in detail..."
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    className="mt-2 min-h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="use-case">Use Case Template</Label>
                  <Select value={useCase} onValueChange={setUseCase}>
                    <SelectTrigger className="mt-2" data-testid="select-use-case">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {useCaseTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="complexity">Complexity Level</Label>
                  <Select value={complexity} onValueChange={setComplexity}>
                    <SelectTrigger className="mt-2" data-testid="select-complexity">
                      <SelectValue placeholder="Select complexity..." />
                    </SelectTrigger>
                    <SelectContent>
                      {complexityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </HolographicCard>

            {/* Use Case Templates */}
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle>Popular Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {useCaseTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 rounded-lg border border-border hover-elevate cursor-pointer transition-all"
                      onClick={() => {
                        setUseCase(template.id);
                        console.log(`Selected template: ${template.name}`);
                      }}
                      data-testid={`template-${template.id}`}
                    >
                      <h4 className="font-semibold text-foreground mb-2">{template.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedHours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${template.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </HolographicCard>
          </div>

          {/* Summary & Estimation */}
          <div className="space-y-6">
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <OrderStatusBadge status="DRAFT" />
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Project</span>
                    <span className="text-sm font-medium text-foreground">
                      {orderTitle || "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Complexity</span>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {complexity ? complexityLevels.find(l => l.value === complexity)?.label.split(' ')[0] : "Not set"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </HolographicCard>

            <HolographicCard glowColor="emerald">
              <CardHeader>
                <CardTitle>Estimation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Time</p>
                      <p className="text-2xl font-bold text-foreground">{estimate.hours} hours</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="text-2xl font-bold text-foreground">${estimate.cost}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery</p>
                      <p className="text-lg font-semibold text-foreground">
                        {estimate.hours > 0 ? `${Math.ceil(estimate.hours / 8)} business days` : "TBD"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="default"
                  disabled={!orderTitle || !complexity}
                  data-testid="button-submit-order"
                  onClick={() => console.log("Submitting order:", { orderTitle, orderDescription, useCase, complexity, estimate })}
                >
                  Submit Order
                </Button>
              </CardContent>
            </HolographicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
