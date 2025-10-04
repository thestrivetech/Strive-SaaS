import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Star, Eye, Play, Filter } from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Sales",
  "Marketing", 
  "Support",
  "Content",
  "Data",
  "Operations",
  "Finance",
  "HR"
];

const DIFFICULTY_LEVELS = [
  "All Levels",
  "Beginner",
  "Intermediate", 
  "Advanced"
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [sortBy, setSortBy] = useState("popularity");

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates', { public: 'true' }],
  });

  const filteredTemplates = Array.isArray(templates) ? templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All Levels" || template.metadata.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  })?.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'popularity':
        return b.metadata.usageCount - a.metadata.usageCount;
      case 'rating':
        return b.metadata.rating - a.metadata.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  }) : [];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Sales': '💼',
      'Marketing': '📢', 
      'Support': '🎧',
      'Content': '✍️',
      'Data': '📊',
      'Operations': '⚙️',
      'Finance': '💰',
      'HR': '👥'
    };
    return icons[category] || '📝';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'Intermediate':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      case 'Advanced':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6" data-testid="marketplace-page">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold neon-text mb-2" data-testid="page-title">Template Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Discover and deploy pre-built workflow templates
        </p>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-green rounded-full"></div>
            <span>{Array.isArray(templates) ? templates.length : 0} Templates</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-chart-4" />
            <span>Community Rated</span>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-primary" />
            <span>Ready to Deploy</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-templates"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="filter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger data-testid="filter-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: any) => (
            <Card 
              key={template.id} 
              className="glass-card hover:border-primary/30 transition-all group cursor-pointer"
              data-testid={`template-card-${template.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="text-3xl" data-testid={`template-icon-${template.id}`}>
                      {getCategoryIcon(template.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors" data-testid={`template-name-${template.id}`}>
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1" data-testid={`template-description-${template.id}`}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categories and Difficulty */}
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30" data-testid={`template-category-${template.id}`}>
                    {template.category}
                  </Badge>
                  <Badge className={getDifficultyColor(template.metadata.difficulty)} data-testid={`template-difficulty-${template.id}`}>
                    {template.metadata.difficulty}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs" data-testid={`template-tag-${template.id}-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                  {template.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.metadata.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <Download className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-semibold" data-testid={`template-usage-${template.id}`}>
                        {template.metadata.usageCount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Uses</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="w-3 h-3 text-chart-4" />
                      <span className="text-sm font-semibold" data-testid={`template-rating-${template.id}`}>
                        {template.metadata.rating}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-semibold" data-testid={`template-nodes-${template.id}`}>
                        {template.nodes?.length || 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Nodes</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center space-x-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                    size="sm"
                    data-testid={`button-use-template-${template.id}`}
                  >
                    <Play className="w-3 h-3 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-preview-${template.id}`}>
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                  <span data-testid={`template-time-${template.id}`}>
                    ⏱️ Est. setup: {template.metadata.estimatedTime}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory !== "All Categories" || selectedDifficulty !== "All Levels"
                ? "Try adjusting your search criteria or filters"
                : "Templates are being loaded..."
              }
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
                setSelectedDifficulty("All Levels");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer Stats */}
      {filteredTemplates && filteredTemplates.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredTemplates.length} of {Array.isArray(templates) ? templates.length : 0} templates
        </div>
      )}
    </div>
  );
}
