"use client";

import { Target, Eye, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisionTimeline } from "@/components/about/VisionTimeline";
import { CompanyStory } from "@/components/about/CompanyStory";
import { TeamCarousel } from "@/components/about/TeamCarousel";

const Company = () => {
  const missionVisionValues = [
    {
      icon: <Target className="text-primary text-2xl" />,
      title: "Our Mission",
      description: "Help you boost revenues, cut costs, and outpace your competitors through the right AI, delivered at the right time."
    },
    {
      icon: <Eye className="text-primary text-2xl" />,
      title: "Our Vision",
      description: "To be the trusted partner B2B leaders call for transformation and breakthrough growth."
    },
    {
      icon: <Heart className="text-primary text-2xl" />,
      title: "Our Values",
      description: "Your success is our standard through excellence, integrity, bold innovation, and relentless commitment."
    }
  ];

  const stats = [
    { number: "203", label: "Total Projects Completed" },
    { number: "12", label: "Fortune 500 Clients" },
    { number: "95%", label: "Retention Rate, Year After Year" },
    { number: "24/7", label: "Always-On Support for Your Success" }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section - Our Vision & Roadmap to the Future */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <VisionTimeline />
        </div>
      </section>

      {/* Stats Section - Moved outside hero */}
      <section className="py-12 bg-[#ffffffeb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile & Tablet: 2x2 Grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-2xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300"
                  data-testid={`text-stat-number-${index}`}
                >
                  {stat.number}
                </div>
                <div
                  className="text-muted-foreground font-medium text-sm md:text-base leading-tight"
                  data-testid={`text-stat-label-${index}`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section id="our-story" className="py-16 md:py-24 bg-[#ffffffeb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CompanyStory />
        </div>
      </section>


      {/* Mission, Vision, Values */}
      <section className="py-16 md:py-24 bg-[#ffffffeb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="text-sm uppercase tracking-wide text-primary font-semibold mb-4"
              data-testid="text-mvv-label"
            >
              OUR FOUNDATION
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-6 text-[#020a1c]"
              data-testid="text-mvv-title"
            >
              Mission, Vision & Values
            </h2>
          </div>

          {/* Mobile: 1x2 Layout - Values on top, Mission and Vision below */}
          <div className="block md:hidden">
            <div className="space-y-6">
              {/* Values card first */}
              {missionVisionValues.filter(item => item.title === "Our Values").map((item, index) => (
                <div
                  key={index}
                  className="group"
                  data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="bg-white rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="w-14 h-14 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-primary text-lg">
                        {item.icon}
                      </div>
                    </div>
                    <h3
                      className="text-base font-bold mb-2 text-[#020a1c]"
                      data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-title`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-description`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Mission and Vision in a 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {missionVisionValues.filter(item => item.title !== "Our Values").map((item, index) => (
                  <div
                    key={index}
                    className="group"
                    data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                      <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-primary text-lg">
                          {item.icon}
                        </div>
                      </div>
                      <h3
                        className="text-base font-bold mb-2 text-[#020a1c]"
                        data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-title`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-description`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Original 3-column grid */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            {missionVisionValues.map((item, index) => (
              <div
                key={index}
                className="group"
                data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 h-full flex flex-col">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-primary text-2xl">
                      {item.icon}
                    </div>
                  </div>
                  <h3
                    className="text-xl font-bold mb-4 text-[#020a1c]"
                    data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-title`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-base text-muted-foreground leading-relaxed flex-grow"
                    data-testid={`text-${item.title.toLowerCase().replace(/\s+/g, "-")}-description`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-[#ffffffeb]">
        <TeamCarousel />
      </section>

      {/* Call to Action */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to See AI Work For You?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Book a free custom automation assessment and discover your roadmap to stronger growth, efficiency, and market leadership starting today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500"
                size="lg"
                onClick={() => window.location.href = "/contact"}
                data-testid="button-get-started-cta"
              >
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                className="hero-gradient border-2 border-[#ff7033] text-white hover:text-[#ff7033] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                size="lg"
                onClick={() => window.location.href = "/contact"}
                data-testid="button-join-team"
              >
                Join Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Company;