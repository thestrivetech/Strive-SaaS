import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: string;
  price: string | number;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSelect?: () => void;
}

export function PricingCard({
  tier,
  price,
  description,
  features,
  isFeatured = false,
  onSelect
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative p-6 flex flex-col h-full",
        isFeatured && "border-primary border-2"
      )}
    >
      {isFeatured && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2" data-testid={`text-tier-${tier.toLowerCase()}`}>
          {tier}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-baseline">
          {typeof price === 'number' ? (
            <>
              <span className="text-4xl font-bold" data-testid={`text-price-${tier.toLowerCase()}`}>
                ${price}
              </span>
              <span className="text-sm text-muted-foreground ml-2">/month</span>
            </>
          ) : (
            <span className="text-4xl font-bold">{price}</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isFeatured ? "default" : "outline"}
        className="w-full"
        onClick={onSelect}
        data-testid={`button-select-${tier.toLowerCase()}`}
      >
        Get Started
      </Button>
    </Card>
  );
}
