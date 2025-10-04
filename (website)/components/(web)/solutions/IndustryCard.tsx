import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface IndustryCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  solutions?: number;
}

export function IndustryCard({
  id,
  title,
  description,
  icon: Icon,
  href,
  solutions,
}: IndustryCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 group cursor-pointer">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
            {title}
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </CardTitle>
          <CardDescription>{description}</CardDescription>
          {solutions !== undefined && (
            <div className="mt-4 text-sm text-muted-foreground">
              {solutions} {solutions === 1 ? "solution" : "solutions"} available
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
