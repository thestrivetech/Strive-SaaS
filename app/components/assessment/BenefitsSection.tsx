"use client";

import { Lightbulb, Target, Building } from "lucide-react";

export function BenefitsSection() {
  return (
    <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border">
        <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
        <h3 className="font-semibold mb-2 text-sm md:text-base">Strategic AI Assessment</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Receive actionable insights from industry-experienced AI consultants
        </p>
      </div>
      <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border">
        <Target className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
        <h3 className="font-semibold mb-2 text-sm md:text-base">Custom AI Roadmap</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Get a step-by-step plan, mapped to your priorities, for deploying AI at scale
        </p>
      </div>
      <div className="text-center p-4 md:p-6 rounded-lg bg-card/50 border">
        <Building className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
        <h3 className="font-semibold mb-2 text-sm md:text-base">Fast-Track Implementation</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Accelerate adoption with clear timelines and ongoing expert support
        </p>
      </div>
    </div>
  );
}
