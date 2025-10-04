"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface IndustryCardProps {
  industry: any;
  onSelect: (industry: any) => void;
  onFilterByIndustry: (value: string) => void;
}

export function IndustryCard({ industry, onSelect, onFilterByIndustry }: IndustryCardProps) {
  return (
    <Card
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer hover:-translate-y-2 hero-gradient h-full flex flex-col border-l-4 border-l-primary/50"
      onClick={() => onSelect(industry)}
      data-testid={`industry-card-${industry.industryValue}`}
    >
      <CardContent className="p-3 md:p-6 flex flex-col h-full relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl" />

        <div className="absolute top-2 right-2 md:top-4 md:right-4">
          <Badge className="bg-white hover:hero-gradient hover:border-[#ff7033] hover:text-white text-[#020a1c] text-xs px-2 md:px-3 py-0.5 md:py-1 h-6 md:h-7 shadow-md">
            Industry Overview
          </Badge>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center md:items-start mb-3">
            <div className="mb-2">
              <div className="text-[#ff7033] transition-transform duration-300 group-hover:scale-110 text-2xl md:text-xl flex justify-center">
                {industry.icon}
              </div>
            </div>

            <h3 className="text-base md:text-xl font-bold text-[#ff7033] line-clamp-2 text-center md:text-left">
              {industry.title}
            </h3>

            <span className="text-xs md:text-sm font-medium uppercase tracking-wide text-[#ff7033] hidden md:inline mt-1">
              {industry.category}
            </span>
          </div>

          <div className="flex-1 flex flex-col text-left">
            <div className="flex-grow mb-3 md:mb-4">
              <p className="text-white line-clamp-2 md:line-clamp-3 leading-relaxed text-sm">
                {industry.shortDescription}
              </p>
            </div>

            <div className="mb-3 md:mb-4">
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
                {industry.keyApplications?.slice(0, 2).map((app: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs cursor-pointer bg-white hover:hero-gradient hover:border-[#ff7033] hover:text-white transition-colors px-2 py-1 border-gray-300 text-[#020a1c]"
                  >
                    {app}
                  </Badge>
                ))}
                {industry.keyApplications?.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer bg-white hover:hero-gradient hover:border-[#ff7033] hover:text-white transition-colors px-2 py-1 border-gray-300 text-[#020a1c]"
                  >
                    +{industry.keyApplications.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-auto pt-2">
              <Button
                className="w-full bg-[#ff7033] text-white hover:hero-gradient hover:border-[#ff7033] hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500 border text-sm py-2 min-h-[48px]"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterByIndustry(industry.industryValue);
                }}
              >
                Explore {industry.title.split(' ')[0]} Tools
                <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
