"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, BarChart3, Wrench, Filter, Globe, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

// Import data
import { Resource, resources } from "@/data/resources";
import { Quiz, allQuizzes } from "@/data/resources/quizzes";
import { featuredResource } from "@/data/resources/featured";
import { ethicalAIImplementation } from "@/data/resources/whitepapers";
import { SubFilterBar } from "@/components/ui/sub-filter-bar";
import { WhitepaperViewer } from "@/components/(web)/resources/WhitepaperViewer";

// Import new components
import { QuizModal } from "@/components/(web)/resources/QuizModal";
import { FeaturedResource } from "@/components/(web)/resources/FeaturedResource";
import { NewsletterSection } from "@/components/(web)/resources/NewsletterSection";
import { ResourceGrid } from "@/components/(web)/resources/ResourceGrid";
// import { useResourceFilters } from "@/lib/hooks/useResourceFilters"; // TODO: Create in Session 2

const Resources = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showWhitepaperViewer, setShowWhitepaperViewer] = useState(false);

  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Use the custom hook for filtering
  const { subFilter, setSubFilter, subFilterOptions, filteredResources } = useResourceFilters(activeFilter);

  const filters = [
    { name: "All", icon: null },
    { name: "Blog Posts", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { name: "Whitepapers", icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: "Case Studies", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { name: "Tools & Tech", icon: <Wrench className="h-4 w-4 mr-2" /> },
    { name: "Quizzes", icon: <BrainCircuit className="h-4 w-4 mr-2" /> },
  ];

  // Handle URL params for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const tech = urlParams.get('tech');

    if (filterParam === 'tools-tech') {
      setActiveFilter('Tools & Tech');
    }

    if (tech && filterParam === 'tools-tech') {
      setTimeout(() => {
        const techResource = filteredResources.find(r =>
          r.tags?.some(tag => tag.toLowerCase() === tech.toLowerCase())
        );
        if (techResource) {
          setSelectedResource(techResource);
        }
      }, 500);
    }
  }, []);

  const handleResourceClick = (resource: Resource) => {
    if (resource.externalLink) {
      window.open(resource.externalLink, '_blank');
    } else {
      setSelectedResource(resource);
      if (resource.type === "Whitepaper") {
        setShowWhitepaperViewer(true);
      }
    }
  };

  const handleQuizStart = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-12 sm:py-14 md:py-16 lg:py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full animate-ping opacity-60"
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
                <BookOpen className="text-primary h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 animate-pulse" />
                <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-white px-4">
              Business <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block pb-2">Intelligence</span> Hub
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#94a3b8] max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 px-4">
              Gain exclusive strategies, actionable research, and expert insights to guide your team through every stage of digital transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                onClick={() => router.push('/contact')}
              >
                Unlock Actionable Insights
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hero-gradient border-2 border-[#ff7033] text-white hover:text-[#ff7033] px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                onClick={() => document.getElementById('resource-library')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Let's Learn
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Library Section */}
      <section id="resource-library" className="py-16 bg-[#ffffffeb] shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          {activeFilter === "All" && (
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">
                Explore Our Resource Library
              </h2>
              <p className="text-slate-600 text-lg">
                Find tailored playbooks, case studies, and guides, each designed to help you solve your top business challenges with AI.
              </p>
            </div>
          )}

          {/* Featured Resource */}
          {(activeFilter === "All" || activeFilter === "Whitepapers") && (
            <FeaturedResource
              resource={featuredResource}
              onView={() => {
                setSelectedResource(ethicalAIImplementation);
                setShowWhitepaperViewer(true);
              }}
            />
          )}

          {/* Filter Buttons */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <Button
                variant={activeFilter === "All" ? "default" : "outline"}
                onClick={() => setActiveFilter("All")}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeFilter === "All"
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'border-primary/20 text-foreground hover:border-primary hover:text-primary hover:scale-105'
                }`}
              >
                <Globe className="h-4 w-4" />
                All
              </Button>
              <Select value={activeFilter === "All" ? "" : activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className={`w-auto min-w-[60px] px-2 py-1 text-sm transition-all duration-200 ${
                  activeFilter !== "All" ? "bg-primary text-white shadow-lg scale-105" : ""
                }`}>
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    <span className="text-xs">
                      {activeFilter !== "All" ? filters.find(f => f.name === activeFilter)?.name : "Filter"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filters.filter(f => f.name !== "All").map((filter) => (
                    <SelectItem key={filter.name} value={filter.name}>
                      <div className="flex items-center gap-2">
                        {filter.icon}
                        <span>{filter.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SubFilter Bar */}
          {activeFilter !== "All" && subFilterOptions.length > 1 && (
            <div className="mb-8">
              <SubFilterBar
                searchTerm={subFilter.searchTerm}
                selectedCategory={subFilter.category}
                options={subFilterOptions}
                onSearchChange={(term) => setSubFilter(prev => ({ ...prev, searchTerm: term }))}
                onCategoryChange={(category) => setSubFilter(prev => ({ ...prev, category }))}
                maxVisibleCategories={5}
              />
            </div>
          )}

          {/* Resource Grid */}
          <ResourceGrid
            resources={filteredResources}
            activeFilter={activeFilter}
            onResourceClick={handleResourceClick}
            onQuizStart={handleQuizStart}
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Quiz Modal */}
      <QuizModal
        selectedQuiz={selectedQuiz}
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setSelectedQuiz(null);
        }}
      />

      {/* Whitepaper Viewer */}
      {showWhitepaperViewer && selectedResource && (
        <WhitepaperViewer
          resource={selectedResource}
          onClose={() => {
            setShowWhitepaperViewer(false);
            setSelectedResource(null);
          }}
        />
      )}
    </div>
  );
};

export default Resources;
