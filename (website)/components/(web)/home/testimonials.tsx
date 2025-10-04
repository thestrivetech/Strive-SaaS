import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        "Strive Tech transformed our operations completely. The AI automation they implemented saved us over $2M annually while improving customer satisfaction by 40%.",
      author: "Sarah Chen",
      role: "CTO, HealthCare Corp",
      company: "Fortune 500 Healthcare Provider",
    },
    {
      id: 2,
      quote:
        "The custom CRM platform built by Strive Tech has been a game-changer. Our team's productivity increased by 300% and we've scaled from 100 to 500+ properties seamlessly.",
      author: "Michael Rodriguez",
      role: "CEO, PropertyMax",
      company: "Leading Real Estate Management",
    },
    {
      id: 3,
      quote:
        "Working with Strive Tech was the best investment we've made. Their team understood our unique challenges and delivered a solution that exceeded our expectations.",
      author: "Jennifer Davis",
      role: "VP of Operations, ManufacturePro",
      company: "Global Manufacturing Leader",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600">
            Trusted by industry leaders across healthcare, real estate, manufacturing, and more.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500 mt-1">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
