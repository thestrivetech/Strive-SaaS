import { Card, CardContent } from "@/components/ui/card";

export function CompanyStory() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>

          <div className="space-y-6 text-lg text-gray-700">
            <p>
              Strive Tech was born from a simple observation: businesses of all sizes struggle to
              implement AI and automation effectively. While the technology exists, the gap between
              potential and reality remains vast.
            </p>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-xl font-semibold text-primary mb-4">
                  "We don't just build software—we transform businesses."
                </p>
                <p className="text-gray-700">
                  This philosophy drives everything we do, from our first client meeting to
                  post-deployment support.
                </p>
              </CardContent>
            </Card>

            <p>
              Today, we've helped over 200 businesses across healthcare, real estate, manufacturing,
              and finance implement AI solutions that deliver measurable results. Our team of experts
              combines deep technical knowledge with industry-specific expertise to create solutions
              that truly work.
            </p>

            <p>
              But we're just getting started. As AI continues to evolve, so do we—constantly learning,
              innovating, and pushing boundaries to help our clients stay ahead.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
