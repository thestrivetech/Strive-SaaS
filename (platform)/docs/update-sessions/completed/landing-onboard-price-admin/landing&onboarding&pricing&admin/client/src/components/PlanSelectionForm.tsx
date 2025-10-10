import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingCard } from "./PricingCard";

type Tier = "CUSTOM" | "STARTER" | "GROWTH" | "ELITE" | "ENTERPRISE";

const tiers = [
  {
    id: "CUSTOM" as Tier,
    name: "Custom",
    price: "Contact Us",
    description: "Tailored solutions",
    features: ["Custom features", "Dedicated support", "Flexible pricing"]
  },
  {
    id: "STARTER" as Tier,
    name: "Starter",
    price: 29,
    description: "Perfect for small teams",
    features: ["Up to 5 users", "10GB storage", "Email support", "Basic analytics"]
  },
  {
    id: "GROWTH" as Tier,
    name: "Growth",
    price: 99,
    description: "For growing businesses",
    features: ["Up to 20 users", "100GB storage", "Priority support", "Advanced analytics", "API access"],
    featured: true
  },
  {
    id: "ELITE" as Tier,
    name: "Elite",
    price: 199,
    description: "For established companies",
    features: ["Up to 50 users", "500GB storage", "24/7 support", "Custom integrations", "SSO"]
  },
  {
    id: "ENTERPRISE" as Tier,
    name: "Enterprise",
    price: 499,
    description: "For large organizations",
    features: ["Unlimited users", "Unlimited storage", "Dedicated support", "SLA guarantee", "White-label"]
  }
];

interface PlanSelectionFormProps {
  onNext: (tier: Tier) => void;
  onBack: () => void;
}

export function PlanSelectionForm({ onNext, onBack }: PlanSelectionFormProps) {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the plan that best fits your needs</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={selectedTier === tier.id ? "ring-2 ring-primary rounded-lg" : ""}
          >
            <PricingCard
              tier={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              isFeatured={tier.featured}
              onSelect={() => setSelectedTier(tier.id)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          Back
        </Button>
        <Button 
          onClick={() => selectedTier && onNext(selectedTier)}
          disabled={!selectedTier}
          data-testid="button-next"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
