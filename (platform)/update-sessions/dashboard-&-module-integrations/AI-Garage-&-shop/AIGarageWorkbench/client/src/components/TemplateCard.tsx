import { cn } from "@/lib/utils";
import { HolographicCard } from "./HolographicCard";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users } from "lucide-react";

interface TemplateCardProps {
  name: string;
  description: string;
  category: string;
  rating?: number;
  usageCount?: number;
  className?: string;
  onUse?: () => void;
}

export function TemplateCard({ 
  name, 
  description, 
  category, 
  rating = 0, 
  usageCount = 0,
  className,
  onUse
}: TemplateCardProps) {
  return (
    <HolographicCard className={cn("flex flex-col", className)}>
      <CardContent className="p-6 flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <Badge variant="outline" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
            {category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          {usageCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{usageCount} uses</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full"
          variant="outline"
          onClick={onUse}
          data-testid={`button-use-template-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Use Template
        </Button>
      </CardFooter>
    </HolographicCard>
  );
}
