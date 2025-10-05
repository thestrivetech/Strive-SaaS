import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { formatPrice } from "@/lib/format";
import ToolBadge from "./ToolBadge";
import type { MarketplaceItem } from "@/data/marketplace-items";

interface ToolCardProps {
  item: MarketplaceItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onViewDetails: (item: MarketplaceItem) => void;
}

export default function ToolCard({ item, isSelected, onToggle, onViewDetails }: ToolCardProps) {
  const Icon = getIcon(item.icon);

  return (
    <Card 
      className="p-6 hover-elevate transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(item)}
      data-testid={`card-tool-${item.id}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-lg bg-primary/10 p-3 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="font-mono text-lg font-semibold text-foreground">
            {formatPrice(item.price)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-card-foreground leading-tight">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <ToolBadge key={tag} tag={tag} />
          ))}
        </div>

        <Button
          variant={isSelected ? "secondary" : "default"}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          data-testid={`button-toggle-${item.id}`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added to Plan
            </>
          ) : (
            "Add to Plan"
          )}
        </Button>
      </div>
    </Card>
  );
}
