"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filter, CheckCircle, ArrowRight } from "lucide-react";
import { MetaTags } from "@/components/seo/meta-tags";
import { useSEO } from "@/hooks/use-seo";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/solutions/HeroSection";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { IndustryCard } from "@/components/solutions/IndustryCard";
import { UnifiedFilterDropdown, type FilterSelection } from "@/components/filters/unified-filter-dropdown";
import { solutions, type Solution, solutionTypeOptions } from "@/data/solutions";
import { industryCards } from "@/data/industry-cards";
import { industryOptions } from "@/data/industries";

const Solutions = () => {
  const router = useRouter();
  const { seoConfig } = useSEO();
  const [selectedFilter, setSelectedFilter] = useState<FilterSelection>({type: 'all', value: 'All'});
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const solutionParam = urlParams.get('solution');
    const industry = urlParams.get('industry');

    if (solutionParam) {
      const targetSolution = solutions.find(solution =>
        solution.title.toLowerCase().includes(solutionParam.toLowerCase())
      );
      if (targetSolution) {
        setSelectedSolution(targetSolution);
        setTimeout(() => {
          document.querySelector(`[data-testid="solution-card-${targetSolution.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    if (industry) {
      const industryOption = industryOptions.find(option =>
        option.value.toLowerCase() === industry.toLowerCase()
      );
      if (industryOption) {
        setSelectedFilter({type: 'industry', value: industryOption.value});
        window.history.replaceState({}, document.title, '/solutions');
      }
    }
  }, []);

  const getFilteredContent = () => {
    let contentItems: any[] = [];

    if (selectedFilter.type === 'all') {
      contentItems = [...solutions, ...industryCards];
    } else if (selectedFilter.type === 'industry') {
      if (selectedFilter.value === 'all-industries') {
        contentItems = [...industryCards];
      } else {
        const industryMapping: { [key: string]: string[] } = {
          "healthcare": ["Healthcare"], "finance": ["Financial Services", "Finance", "Banking"],
          "manufacturing": ["Manufacturing", "Smart Manufacturing"], "retail": ["Retail", "E-commerce"],
          "technology": ["Technology", "Technology Companies", "All Software Development", "Enterprise Cybersecurity", "Executive Support", "Sales", "Customer Service", "Smart Cities", "All Knowledge-Intensive Industries"],
          "education": ["Education"], "real-estate": ["Real Estate", "Smart Buildings"],
          "legal": ["Legal", "Legal Services"], "logistics": ["Logistics", "Supply Chain", "Logistics & Supply Chain"],
          "hospitality": ["Hospitality", "Hospitality & Tourism", "Smart Home"],
          "energy": ["Energy", "Energy & Utilities"],
          "government": ["Government", "Government & Public Sector", "Security Operations Centers", "Incident Response Teams"],
          "insurance": ["Insurance"], "automotive": ["Automotive", "Autonomous Vehicles"],
          "agriculture": ["Agriculture"],
          "media": ["Media", "Media & Entertainment", "Content and Media", "Content Creation", "All Content-Driven Industries", "Marketing"],
          "gaming": ["Gaming"], "esports": ["eSports"], "nonprofit": ["Non-profit", "Non-profit Organizations"],
          "telecommunications": ["Telecommunications"], "transportation": ["Transportation"]
        };

        const targetIndustries = industryMapping[selectedFilter.value] || [];
        const relevantSolutions = solutions.filter(solution =>
          solution.applicableIndustries?.some(industry =>
            targetIndustries.some(targetIndustry =>
              industry.toLowerCase().includes(targetIndustry.toLowerCase()) ||
              targetIndustry.toLowerCase().includes(industry.toLowerCase())
            )
          )
        );

        const relevantIndustryCard = industryCards.find(card => card.industryValue === selectedFilter.value);
        contentItems = [...relevantSolutions, ...(relevantIndustryCard ? [relevantIndustryCard] : [])];
      }
    } else if (selectedFilter.type === 'solution') {
      if (selectedFilter.value === 'all-solutions') {
        contentItems = [...solutions];
      } else {
        const solutionType = solutionTypeOptions.find(opt => opt.value === selectedFilter.value);
        contentItems = solutions.filter(solution => solution.category === solutionType?.label);
      }
    }

    return contentItems;
  };

  const filteredContent = getFilteredContent();
  const filteredSolutions = filteredContent.filter(item => item.type !== 'industry');

  const handleFilterBySolution = (category: string) => {
    const matchingOption = solutionTypeOptions.find(opt =>
      opt.label.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(opt.label.toLowerCase())
    );
    if (matchingOption) {
      setSelectedFilter({type: 'solution', value: matchingOption.value});
    }
  };

  return (
    <>
      <MetaTags seo={seoConfig} />

      <div className="pt-16">
        <HeroSection
          onGetCustomSolution={() => router.push('/request')}
          onExploreSolutions={() => document.getElementById('solutions-grid')?.scrollIntoView({ behavior: 'smooth' })}
        />

        <section className="py-12 sm:py-14 md:py-16 lg:py-20 bg-[#ffffffeb]" id="solutions-grid">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-7 md:mb-8">
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Discover Your Perfect AI Tool: Choose your industry to see tailored strategies, or browse by solution type to find specific capabilities across all sectors.
              </p>
            </div>

            <UnifiedFilterDropdown
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              solutionCount={filteredSolutions.length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-8">
              {filteredContent.map((item) => (
                item.type === 'industry' ? (
                  <IndustryCard
                    key={item.id}
                    industry={item}
                    onSelect={setSelectedIndustry}
                    onFilterByIndustry={(value) => setSelectedFilter({type: 'industry', value})}
                  />
                ) : (
                  <SolutionCard
                    key={item.id}
                    solution={item}
                    onSelect={setSelectedSolution}
                    onFilterBySolution={handleFilterBySolution}
                    onNavigateToResources={(industry) => router.push(`/resources?tech=${encodeURIComponent(industry)}`)}
                  />
                )
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No solutions found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more solutions.</p>
              </div>
            )}
          </div>
        </section>

        {/* Solution Modal */}
        <Dialog open={!!selectedSolution} onOpenChange={() => setSelectedSolution(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            {selectedSolution && (
              <>
                <DialogTitle className="flex items-center gap-4 text-2xl font-bold mb-2">
                  {selectedSolution.icon} {selectedSolution.title}
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground mb-6">
                  {selectedSolution.fullDescription}
                </DialogDescription>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-foreground">Key Features</h4>
                    <ul className="space-y-3">
                      {selectedSolution.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-foreground">
                      {selectedSolution.type === 'product' ? 'Applicable Industries' : 'Tools'}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedSolution.applicableIndustries.map((industry: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary"
                          onClick={() => {
                            setSelectedSolution(null);
                            router.push(`/resources?tech=${encodeURIComponent(industry)}`);
                          }}
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="text-lg font-semibold mb-4 text-foreground">Performance Metrics</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedSolution.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-semibold text-primary">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
                  {selectedSolution.hasDemo ? (
                    <>
                      <Button
                        size="lg"
                        className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-sm font-semibold min-h-[48px]"
                        onClick={() => setSelectedSolution(null)}
                      >
                        View {selectedSolution.demoType} Demo
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 text-sm font-semibold min-h-[48px]"
                        onClick={() => router.push('/request')}
                      >
                        Request Custom Demo
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="w-full sm:flex-1 bg-primary hover:bg-primary/90 px-6 py-3 text-sm font-semibold min-h-[48px]"
                        onClick={() => router.push('/request')}
                      >
                        Request Demo
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 text-sm font-semibold min-h-[48px]"
                        onClick={() => router.push('/contact')}
                      >
                        Contact Sales
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Industry Detail Modal */}
        <Dialog open={!!selectedIndustry} onOpenChange={(open) => !open && setSelectedIndustry(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedIndustry && (
              <>
                <div className="pb-6 border-b">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">{selectedIndustry.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-foreground">{selectedIndustry.title}</h2>
                        <Badge variant="secondary" className="px-3 py-1">Industry Focus</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedIndustry.fullDescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-6 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Key AI Applications</h4>
                      <ul className="space-y-3">
                        {selectedIndustry.keyApplications?.map((app: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Recommended Tools</h4>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedIndustry.primarySolutions?.map((solution: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            onClick={() => {
                              const targetSolution = solutions.find(s =>
                                s.category.toLowerCase().includes(solution.toLowerCase()) ||
                                solution.toLowerCase().includes(s.category.toLowerCase())
                              );
                              if (targetSolution) {
                                setSelectedIndustry(null);
                                setSelectedSolution(targetSolution);
                              }
                            }}
                          >
                            {solution}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedIndustry.benefits && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Key Benefits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedIndustry.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex items-center justify-between">
                  <Button
                    onClick={() => {
                      setSelectedIndustry(null);
                      setSelectedFilter({type: 'industry', value: selectedIndustry.industryValue});
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    View All {selectedIndustry.title} Tools
                  </Button>

                  <Button
                    onClick={() => {
                      setSelectedIndustry(null);
                      router.push('/request');
                    }}
                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Solutions;
