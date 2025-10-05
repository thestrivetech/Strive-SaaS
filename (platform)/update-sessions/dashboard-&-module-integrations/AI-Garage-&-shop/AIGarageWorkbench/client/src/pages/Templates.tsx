import { useState } from "react";
import { TemplateCard } from "@/components/TemplateCard";
import { HolographicCard } from "@/components/HolographicCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List } from "lucide-react";

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  //todo: remove mock functionality
  const templates = [
    {
      id: "1",
      name: "Sales Assistant",
      description: "AI-powered sales agent that qualifies leads and schedules meetings automatically",
      category: "sales",
      rating: 4.8,
      usageCount: 234,
    },
    {
      id: "2",
      name: "Data Analyst",
      description: "Analyze complex datasets and generate actionable insights with natural language queries",
      category: "analysis",
      rating: 4.9,
      usageCount: 189,
    },
    {
      id: "3",
      name: "Content Creator",
      description: "Generate high-quality content for blogs, social media, and marketing campaigns",
      category: "content",
      rating: 4.7,
      usageCount: 412,
    },
    {
      id: "4",
      name: "Support Bot",
      description: "Intelligent customer support agent with context awareness and escalation capabilities",
      category: "support",
      rating: 4.6,
      usageCount: 298,
    },
    {
      id: "5",
      name: "Code Reviewer",
      description: "Automated code review agent that checks for bugs, security issues, and best practices",
      category: "analysis",
      rating: 4.9,
      usageCount: 156,
    },
    {
      id: "6",
      name: "Email Assistant",
      description: "Draft, summarize, and respond to emails with personalized tone and context",
      category: "content",
      rating: 4.5,
      usageCount: 321,
    },
  ];

  const categories = ["sales", "support", "analysis", "content"];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Template Gallery</h1>
          <p className="text-muted-foreground">Kickstart your project with pre-built templates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <HolographicCard glowColor="emerald" className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="input-search-templates"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge
                variant="outline"
                className={`cursor-pointer transition-all hover-elevate ${
                  !selectedCategory ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : ""
                }`}
                onClick={() => setSelectedCategory(null)}
                data-testid="badge-category-all"
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`cursor-pointer transition-all hover-elevate capitalize ${
                    selectedCategory === category ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`badge-category-${category}`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </HolographicCard>

        {/* Templates Grid */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              name={template.name}
              description={template.description}
              category={template.category}
              rating={template.rating}
              usageCount={template.usageCount}
              onUse={() => console.log(`Using template: ${template.name}`)}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
