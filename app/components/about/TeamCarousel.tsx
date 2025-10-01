"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeamMember {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

const GarrettHeadshot = "/assets/headshots/Garrett-Headshot.webp";
const JeffHeadshot = "/assets/headshots/Jeff-Headshot.webp";
const GrantHeadshot = "/assets/headshots/Grant-Headshot.webp";

export function TeamCarousel() {
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  const teamMembers: TeamMember[] = [
    {
      name: "Garrett Holland",
      title: "Founder & CEO",
      description: "Visionary leader transforming businesses through strategic AI innovation and operational excellence.",
      imageUrl: GarrettHeadshot,
      imageAlt: "Garrett Holland - CEO & Founder headshot"
    },
    {
      name: "Grant Ramey",
      title: "Co-Founder, VP",
      description: "Operational excellence architect scaling breakthrough solutions and delivering measurable results.",
      imageUrl: GrantHeadshot,
      imageAlt: "Grant Ramey - Co-Founder, VP headshot"
    },
    {
      name: "Jeff Meyer",
      title: "Co-Founder, Head of Sales",
      description: "Expert relationship builder driving exponential growth through strategic partnerships and client success.",
      imageUrl: JeffHeadshot,
      imageAlt: "Jeff Meyer - Co-Founder, Head of Sales headshot"
    }
  ];

  const nextTeamMember = () => {
    setCurrentTeamIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevTeamMember = () => {
    setCurrentTeamIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div
          className="text-sm uppercase tracking-wide text-primary font-semibold mb-4"
          data-testid="text-team-label"
        >
          OUR LEADERSHIP
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold mb-6 text-[#020a1c]"
          data-testid="text-team-title"
        >
          Meet Your Transformation Partners
        </h2>
        <p
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          data-testid="text-team-subtitle"
        >
          Trusted advisors to global enterprises, delivering proven growth with every partnership.
        </p>
      </div>

      {/* Mobile: Horizontal Swipe Carousel */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentTeamIndex * 100}%)` }}
          >
            {teamMembers.map((member, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                  <div className="relative overflow-hidden">
                    <Image
                      src={member.imageUrl}
                      alt={member.imageAlt}
                      width={400}
                      height={320}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-t-3xl transition-colors duration-500"></div>
                  </div>

                  <div className="p-6 relative z-10">
                    <h3 className="text-xl font-bold mb-3 text-[#020a1c] group-hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-primary font-bold mb-3 text-base tracking-wide">
                      {member.title}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {member.description}
                    </p>
                    <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-primary to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevTeamMember}
          className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full p-3 hover:scale-110 transition-all duration-300 z-10"
          aria-label="Previous team member"
        >
          <ChevronLeft className="h-8 w-8 text-[#ff7033] hover:text-[#ff7033]/80" />
        </button>

        <button
          onClick={nextTeamMember}
          className="absolute -right-6 top-1/2 -translate-y-1/2 rounded-full p-3 hover:scale-110 transition-all duration-300 z-10"
          aria-label="Next team member"
        >
          <ChevronRight className="h-8 w-8 text-[#ff7033] hover:text-[#ff7033]/80" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {teamMembers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTeamIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTeamIndex
                  ? 'bg-primary scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to team member ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Original Grid Layout */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <div key={index} className="group">
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 overflow-hidden relative h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              <div className="relative overflow-hidden">
                <Image
                  src={member.imageUrl}
                  alt={member.imageAlt}
                  width={400}
                  height={320}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-t-3xl transition-colors duration-500"></div>
              </div>

              <div className="p-8 relative z-10 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-3 text-[#020a1c] group-hover:text-primary transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-primary font-bold mb-4 text-lg tracking-wide">
                  {member.title}
                </p>
                <p className="text-muted-foreground leading-relaxed text-base flex-grow">
                  {member.description}
                </p>
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-primary to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
