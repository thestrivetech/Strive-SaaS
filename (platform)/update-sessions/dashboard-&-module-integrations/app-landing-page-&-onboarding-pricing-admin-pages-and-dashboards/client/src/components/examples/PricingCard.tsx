import { PricingCard } from "../PricingCard";

export default function PricingCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
      <PricingCard
        tier="Starter"
        price={29}
        description="Perfect for small teams"
        features={[
          "Up to 5 users",
          "10GB storage",
          "Email support",
          "Basic analytics"
        ]}
        onSelect={() => console.log("Starter selected")}
      />
      <PricingCard
        tier="Growth"
        price={99}
        description="For growing businesses"
        features={[
          "Up to 20 users",
          "100GB storage",
          "Priority support",
          "Advanced analytics",
          "API access"
        ]}
        isFeatured
        onSelect={() => console.log("Growth selected")}
      />
      <PricingCard
        tier="Enterprise"
        price="Custom"
        description="For large organizations"
        features={[
          "Unlimited users",
          "Unlimited storage",
          "24/7 dedicated support",
          "Custom integrations",
          "SLA guarantee"
        ]}
        onSelect={() => console.log("Enterprise selected")}
      />
    </div>
  );
}
