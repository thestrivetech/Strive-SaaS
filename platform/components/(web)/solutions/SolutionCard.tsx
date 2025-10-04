"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface SolutionCardProps {
  solution: any;
  onSelect: (solution: any) => void;
  onFilterBySolution: (category: string) => void;
  onNavigateToResources: (industry: string) => void;
}

export function SolutionCard({ solution, onSelect, onFilterBySolution, onNavigateToResources }: SolutionCardProps) {
  return (
    <Card
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 h-full flex flex-col"
      onClick={() => onSelect(solution)}
      data-testid={`solution-card-${solution.id}`}
    >
      <CardContent className="p-3 md:p-6 flex flex-col h-full relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center md:items-start mb-3">
            <div className="mb-2">
              <div className="text-primary transition-transform duration-300 group-hover:scale-110 text-2xl md:text-xl flex justify-center">
                {solution.icon}
              </div>
            </div>

            <h3 className="text-base md:text-xl font-bold text-[#ff7033] group-hover:text-primary transition-colors duration-300 line-clamp-2 text-center md:text-left">
              {solution.title}
            </h3>

            <div className="mt-1 flex justify-center md:justify-start">
              <Badge
                variant="outline"
                className="bg-[#ff7033]/10 text-[#ff7033] border-[#ff7033]/20 font-semibold px-2 sm:px-3 py-1 text-xs hover:bg-[#ff7033] hover:text-white transition-colors cursor-pointer min-h-[28px] flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterBySolution(solution.category);
                }}
              >
                {solution.category || 'AI Tool'}
              </Badge>
            </div>
          </div>

          <div className="flex-1 flex flex-col text-left">
            <div className="flex-grow mb-3 md:mb-6">
              <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed text-sm">
                {solution.shortDescription}
              </p>
            </div>

            <div className="mb-3 md:mb-6">
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
                {solution.applicableIndustries?.slice(0, 2).map((industry: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-[#ff7033] hover:text-white transition-colors px-2 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToResources(industry);
                    }}
                  >
                    {industry}
                  </Badge>
                ))}
                {solution.applicableIndustries?.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-[#ff7033] hover:text-white transition-colors px-2 py-1"
                  >
                    +{solution.applicableIndustries.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-auto pt-2">
              <Button
                className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 text-sm py-2 min-h-[48px]"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(solution);
                }}
              >
                View Details
                <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
