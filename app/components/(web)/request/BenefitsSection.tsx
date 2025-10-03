"use client";

import { Card, CardContent } from "@/components/(shared)/ui/card";
import { Target, Clock, Users } from "lucide-react";

export function BenefitsSection() {
  return (
    <div className="mt-8 md:mt-12">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:pb-0">
        <Card className="hero-gradient backdrop-blur-sm min-w-[280px] snap-center md:min-w-0">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-sm md:text-base">Tailored to You</h3>
            <p className="text-xs md:text-sm text-white/80">
              Your solution showcase will focus on your specific industry and challenges
            </p>
          </CardContent>
        </Card>

        <Card className="hero-gradient backdrop-blur-sm min-w-[280px] snap-center md:min-w-0">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-sm md:text-base">Quick Response</h3>
            <p className="text-xs md:text-sm text-white/80">
              We'll contact you within 24 hours to confirm your showcase
            </p>
          </CardContent>
        </Card>

        <Card className="hero-gradient backdrop-blur-sm min-w-[280px] snap-center md:min-w-0">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-sm md:text-base">Expert Guidance</h3>
            <p className="text-xs md:text-sm text-white/80">
              Our solution architects will guide you through the best options
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
