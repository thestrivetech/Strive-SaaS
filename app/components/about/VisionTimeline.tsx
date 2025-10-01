"use client";

import React from "react";
import { ArrowTrendingUpIcon, LightBulbIcon, GlobeAltIcon, CpuChipIcon } from "@heroicons/react/24/outline";

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  status: string;
}

export function VisionTimeline() {
  const visionMilestones: Milestone[] = [
    {
      year: "Q4 2026",
      title: "AI Platform Beta Launch",
      description: "Rolling out beta version of our next-gen AI automation platform to select enterprise clients",
      icon: <CpuChipIcon className="h-6 w-6" />,
      status: "current"
    },
    {
      year: "Q1 2027",
      title: "50 Custom Solutions Delivered",
      description: "Reaching our first 50 successful AI implementations, helping 40 businesses streamline key processes and save an average of 15 hours per week",
      icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
      status: "upcoming"
    },
    {
      year: "Q2 2027",
      title: "100 Businesses Transformed",
      description: "Celebrating 100 businesses enhanced with custom AI solutions, achieving 95% client satisfaction and expanding to 10 industry verticals",
      icon: <GlobeAltIcon className="h-6 w-6" />,
      status: "future"
    },
    {
      year: "Q3 2027",
      title: "10,000 Hours Saved Monthly",
      description: "Saving clients 10,000+ hours monthly through 200 intelligent workflow solutions, equivalent to 60+ full-time employees focused on strategic work",
      icon: <LightBulbIcon className="h-6 w-6" />,
      status: "future"
    },
    {
      year: "Q4 2027",
      title: "$50M in Client Savings Generated",
      description: "Achieving $50 million in documented cost savings and efficiency gains for our clients through 300+ deployed AI solutions",
      icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
      status: "future"
    }
  ];

  return (
    <div className="text-center mb-16">
      <div
        className="text-sm uppercase tracking-wide text-primary font-semibold mb-4"
        data-testid="text-vision-label"
      >
        OUR VISION
      </div>
      <h1
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white"
        data-testid="text-vision-title"
      >
        Roadmap to the <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">Future</span>
      </h1>
      <p className="text-[#94a3b8] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12">
        What's Ahead for Us and For You: Continuous innovation in AI & emerging tech, so you're always a step ahead.
      </p>

      {/* Timeline */}
      <div className="relative max-w-6xl mx-auto">
        {/* Timeline Line - Desktop: Center, Mobile: Left */}
        <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-primary/20 rounded-full"></div>

        {visionMilestones.map((milestone, index) => (
          <div
            key={index}
            className={`relative mb-12 md:mb-16 md:flex md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            data-testid={`milestone-${milestone.year}`}
          >
            {/* Content - Mobile: Full width left-aligned, Desktop: Alternating */}
            <div className={`pl-16 md:pl-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
              <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all duration-300 ${
                milestone.status === 'current' ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
              }`}>
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center text-white">
                    <div className="scale-75 md:scale-100">
                      {milestone.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">{milestone.year}</div>
                    {milestone.status === 'current' && (
                      <div className="text-xs text-primary font-semibold uppercase tracking-wide">Current Focus</div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{milestone.title}</h3>
                <p className="text-sm md:text-base text-white/80">{milestone.description}</p>
              </div>
            </div>

            {/* Timeline Dot - Mobile: Left aligned, Desktop: Center */}
            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full border-2 md:border-4 border-white shadow-lg z-10"></div>

            {/* Spacer - Desktop only */}
            <div className="hidden md:block md:w-5/12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
