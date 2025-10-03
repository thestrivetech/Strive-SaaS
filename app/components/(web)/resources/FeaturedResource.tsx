"use client";

import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/(shared)/ui/button";
import { Resource } from "@/data/(web)/resources";

interface FeaturedResourceProps {
  resource: Resource;
  onView: () => void;
}

export function FeaturedResource({ resource, onView }: FeaturedResourceProps) {
  return (
    <div className="bg-off-white rounded-2xl overflow-hidden mb-16 shadow-lg border border-slate-100">
      <div className="md:flex">
        <div className="md:w-1/2">
          <div className="relative">
            <img
              src={resource.imageUrl}
              alt={resource.imageAlt}
              className="w-full h-64 md:h-full object-cover"
              data-testid="img-featured-resource"
            />
            <div className="absolute top-4 left-4">
              <span
                className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center"
                data-testid="text-trending-badge"
              >
                📈 TRENDING
              </span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 p-8 md:p-12">
          <div
            className="text-sm text-orange-500 uppercase tracking-wide font-semibold mb-4 flex items-center"
            data-testid="text-featured-type"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {resource.type}
          </div>
          <h3
            className="text-2xl md:text-3xl font-bold mb-4 text-slate-800"
            data-testid="text-featured-title"
          >
            {resource.title}
          </h3>
          <p
            className="text-slate-600 mb-6 leading-relaxed"
            data-testid="text-featured-description"
          >
            {resource.description}
          </p>
          <div className="flex items-center justify-between">
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-2"
              data-testid="button-download-featured"
              onClick={onView}
            >
              <Download className="h-4 w-4 mr-2" />
              View Whitepaper
            </Button>
            <div className="text-sm text-slate-500 flex items-center">
              <Download className="h-4 w-4 mr-1" />
              <span data-testid="text-download-count">
                {resource.downloads} downloads
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
