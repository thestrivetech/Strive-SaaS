import Link from "next/link";
import { ArrowRight, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CaseStudies() {
  const caseStudies = [
    {
      id: 1,
      industry: "Healthcare",
      title: "Regional Hospital Network Transformation",
      description:
        "Implemented AI-powered patient management system reducing wait times by 45% and improving patient satisfaction scores.",
      metrics: [
        { icon: TrendingUp, label: "45% reduction", description: "Wait times" },
        { icon: DollarSign, label: "$2.3M saved", description: "Annually" },
        { icon: Clock, label: "3 months", description: "Implementation" },
      ],
      slug: "/solutions/case-studies/healthcare",
    },
    {
      id: 2,
      industry: "Real Estate",
      title: "Property Management Platform",
      description:
        "Built comprehensive CRM and property management system serving 500+ properties and 10,000+ units.",
      metrics: [
        { icon: TrendingUp, label: "300% increase", description: "Efficiency" },
        { icon: DollarSign, label: "$1.8M saved", description: "Operational costs" },
        { icon: Clock, label: "4 months", description: "Deployment" },
      ],
      slug: "/solutions/case-studies/real-estate",
    },
    {
      id: 3,
      industry: "Manufacturing",
      title: "Smart Factory IoT Integration",
      description:
        "Deployed IoT sensors and AI analytics reducing downtime by 60% and increasing production output by 35%.",
      metrics: [
        { icon: TrendingUp, label: "35% increase", description: "Production" },
        { icon: DollarSign, label: "$4.5M saved", description: "Yearly savings" },
        { icon: Clock, label: "6 months", description: "Full rollout" },
      ],
      slug: "/solutions/case-studies/manufacturing",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600">
            Real results from businesses that transformed with our solutions.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {caseStudies.map((study) => (
            <Card key={study.id} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Badge className="w-fit mb-2">{study.industry}</Badge>
                <CardTitle className="text-xl mb-2">{study.title}</CardTitle>
                <CardDescription>{study.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {study.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <metric.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{metric.label}</div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={study.slug} className="flex items-center justify-center gap-2">
                    Read Case Study
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/solutions/case-studies">View All Case Studies</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
