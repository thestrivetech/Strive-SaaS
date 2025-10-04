"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Former AI researcher at MIT with 15+ years in enterprise software. Passionate about making AI accessible to all businesses.",
      linkedin: "https://linkedin.com/in/alexjohnson",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Ex-Google engineer specializing in machine learning and cloud architecture. Led development of AI systems serving millions of users.",
      linkedin: "https://linkedin.com/in/sarahchen",
    },
    {
      name: "Michael Rodriguez",
      role: "VP of Engineering",
      bio: "Full-stack expert with deep knowledge in healthcare IT. Built HIPAA-compliant systems for major hospital networks.",
      linkedin: "https://linkedin.com/in/michaelrodriguez",
    },
    {
      name: "Jennifer Davis",
      role: "Head of AI Research",
      bio: "PhD in Computer Science from Stanford. Published researcher in natural language processing and computer vision.",
      linkedin: "https://linkedin.com/in/jenniferdavis",
    },
  ];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % team.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          Meet Our Team
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          World-class experts passionate about transforming businesses through technology.
        </p>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Placeholder Avatar */}
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-4xl font-bold text-primary">
                    {team[currentIndex].name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {team[currentIndex].name}
                </h3>
                <p className="text-primary font-semibold mb-4">{team[currentIndex].role}</p>
                <p className="text-gray-700 mb-6">{team[currentIndex].bio}</p>

                <Button asChild variant="outline" size="sm">
                  <a
                    href={team[currentIndex].linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {team.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to team member ${index + 1}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
