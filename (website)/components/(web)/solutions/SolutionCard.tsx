import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SolutionCardProps {
  id: string;
  title: string;
  shortDescription: string;
  icon?: LucideIcon;
  category?: string;
  slug: string;
  featured?: boolean;
}

export function SolutionCard({
  id,
  title,
  shortDescription,
  icon: Icon,
  category,
  slug,
  featured,
}: SolutionCardProps) {
  return (
    <Card
      className={`h-full hover:shadow-xl transition-all duration-300 group ${
        featured ? "border-primary border-2" : ""
      }`}
      data-testid={`solution-card-${id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          {Icon && (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          {featured && <Badge variant="secondary">Featured</Badge>}
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        {category && (
          <Badge variant="outline" className="w-fit mt-2">
            {category}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{shortDescription}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full">
          <Link href={slug} className="flex items-center justify-center gap-2">
            Learn More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
