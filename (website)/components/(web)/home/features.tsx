import { BrainCircuit, Code2, Workflow, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI Automation",
      description:
        "Streamline workflows with intelligent automation that learns and adapts to your business needs.",
    },
    {
      icon: Code2,
      title: "Custom Software",
      description:
        "Tailored solutions built from the ground up to solve your unique business challenges.",
    },
    {
      icon: Workflow,
      title: "Industry Tools",
      description:
        "Specialized platforms designed for healthcare, real estate, finance, and more industries.",
    },
    {
      icon: Users,
      title: "Expert Consultation",
      description:
        "Strategic guidance from industry experts to maximize your technology investments.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Solutions for Modern Businesses
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to transform your business operations and drive sustainable growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
