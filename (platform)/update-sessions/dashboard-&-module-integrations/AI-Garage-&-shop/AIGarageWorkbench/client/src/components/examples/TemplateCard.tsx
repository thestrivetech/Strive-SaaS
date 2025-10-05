import { TemplateCard } from "../TemplateCard";

export default function TemplateCardExample() {
  const templates = [
    {
      name: "Sales Assistant",
      description: "AI-powered sales agent that qualifies leads and schedules meetings",
      category: "sales",
      rating: 4.8,
      usageCount: 234,
    },
    {
      name: "Data Analyst",
      description: "Analyze complex datasets and generate insights automatically",
      category: "analysis",
      rating: 4.9,
      usageCount: 189,
    },
    {
      name: "Content Creator",
      description: "Generate high-quality content for blogs, social media, and marketing",
      category: "content",
      rating: 4.7,
      usageCount: 412,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-background">
      {templates.map((template) => (
        <TemplateCard
          key={template.name}
          name={template.name}
          description={template.description}
          category={template.category}
          rating={template.rating}
          usageCount={template.usageCount}
          onUse={() => console.log(`Using template: ${template.name}`)}
        />
      ))}
    </div>
  );
}
