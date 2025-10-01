"use client";

import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetCustomSolution: () => void;
  onExploreSolutions: () => void;
}

export function HeroSection({ onGetCustomSolution, onExploreSolutions }: HeroSectionProps) {
  return (
    <section className="py-12 sm:py-14 md:py-16 lg:py-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-primary rounded-full animate-ping opacity-60`}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
            <div className="relative">
              <Lightbulb className="text-primary h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 animate-pulse" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-white px-4"
            data-testid="text-solutions-hero-title"
          >
            Unlock the Power of AI to <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">Transform Your Business</span> for Tomorrow
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#94a3b8] max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 px-4"
            data-testid="text-solutions-hero-subtitle"
          >
            We help industry leaders conquer operational challenges, maximize efficiency, and drive growth with AI tools designed just for your field.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500 min-h-[44px]"
              onClick={onGetCustomSolution}
              data-testid="button-get-custom-solution"
            >
              Get Custom Tool
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-gradient border-2 border-[#ff7033] text-white hover:text-[#ff7033] px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px]"
              onClick={onExploreSolutions}
              data-testid="button-explore-solutions"
            >
              Explore Industry Tools
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
