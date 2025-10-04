import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  href?: string;
}

interface ResourceGridProps {
  resources: ResourceItem[];
  title?: string;
}

export function ResourceGrid({ resources, title }: ResourceGridProps) {
  return (
    <section className="py-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Link key={resource.id} href={resource.href || "#"}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                {resource.type && <Badge className="w-fit mb-2">{resource.type}</Badge>}
                <CardTitle className="text-xl">{resource.title}</CardTitle>
                {resource.description && (
                  <CardDescription>{resource.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
