import { Rocket, Target, TrendingUp } from "lucide-react";

export function VisionTimeline() {
  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description: "Started with a vision to make AI accessible to businesses of all sizes.",
      icon: Rocket,
    },
    {
      year: "2022",
      title: "100 Projects",
      description: "Reached milestone of 100 successful project deliveries across industries.",
      icon: Target,
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanding operations globally with Fortune 500 partnerships.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="py-12">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
        Our Vision & Roadmap
      </h2>
      <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
        From humble beginnings to industry leadership, here's our journey of innovation.
      </p>

      <div className="relative">
        {/* Timeline Line */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>

        {/* Milestones */}
        <div className="space-y-12">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-2">
                  {milestone.year}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-gray-600">{milestone.description}</p>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 relative z-10">
                <milestone.icon className="w-8 h-8 text-white" />
              </div>

              {/* Spacer for alternating layout */}
              <div className="flex-1 hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
