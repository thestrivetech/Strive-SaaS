'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Mail,
  TrendingUp,
  FileSearch,
  Sparkles,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Mail,
  TrendingUp,
  FileSearch,
  Sparkles,
};

interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  usageCount: number;
  category: string;
}

interface FeaturedToolsProps {
  tools: FeaturedTool[];
  onLaunchTool?: (toolId: string) => void;
}

export function FeaturedTools({ tools, onLaunchTool }: FeaturedToolsProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Content Generation': 'bg-purple-100 text-purple-800 border-purple-200',
      'Communication': 'bg-blue-100 text-blue-800 border-blue-200',
      'Analysis': 'bg-green-100 text-green-800 border-green-200',
      'Document Processing': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatUsageCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card className="glass neon-border-orange">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Featured AI Tools
        </CardTitle>
        <CardDescription>
          Quick access to popular AI-powered tools
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No featured tools available</p>
            </div>
          ) : (
            tools.map((tool) => {
              const IconComponent = iconMap[tool.icon] || Sparkles;

              return (
                <div
                  key={tool.id}
                  className="group p-4 rounded-lg border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onLaunchTool?.(tool.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLaunchTool?.(tool.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{tool.name}</h4>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                        {tool.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(tool.category)} text-xs`}
                        >
                          {tool.category}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {formatUsageCount(tool.usageCount)} uses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Browse All Tools Button */}
        {tools.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Navigate to AI tools marketplace or directory
                window.location.href = '/real-estate/marketplace';
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Browse All AI Tools
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
