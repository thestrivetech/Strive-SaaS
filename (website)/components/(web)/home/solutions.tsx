import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Solutions() {
  const solutions = [
    {
      id: "ai-automation",
      title: "AI Automation",
      description: "Streamline workflows and boost productivity with intelligent automation.",
      slug: "/solutions/ai-automation",
    },
    {
      id: "healthcare",
      title: "Healthcare Solutions",
      description: "HIPAA-compliant systems for modern healthcare providers.",
      slug: "/solutions/healthcare",
    },
    {
      id: "real-estate",
      title: "Real Estate",
      description: "Property management and CRM tools for real estate professionals.",
      slug: "/solutions/real-estate",
    },
    {
      id: "financial",
      title: "Financial Services",
      description: "Secure, scalable solutions for financial institutions.",
      slug: "/solutions/financial",
    },
    {
      id: "manufacturing",
      title: "Manufacturing",
      description: "IoT and automation solutions for manufacturing efficiency.",
      slug: "/solutions/manufacturing",
    },
    {
      id: "retail",
      title: "Retail & E-commerce",
      description: "Omnichannel solutions to drive sales and customer engagement.",
      slug: "/solutions/retail",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Solutions by Industry
          </h2>
          <p className="text-lg text-gray-600">
            Specialized tools and platforms tailored to your industry's unique challenges.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {solutions.map((solution) => (
            <Card
              key={solution.id}
              className="hover:shadow-xl transition-all duration-300 group"
            >
              <CardHeader>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {solution.title}
                </CardTitle>
                <CardDescription>{solution.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href={solution.slug} className="flex items-center justify-center gap-2">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/solutions">View All Solutions</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
