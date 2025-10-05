import { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const tiers = [
  {
    id: "CUSTOM",
    name: "Custom",
    price: "Contact Us",
    description: "Tailored solutions for unique needs",
    features: ["Custom features", "Dedicated support", "Flexible pricing", "Custom SLA"]
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 29,
    description: "Perfect for small teams",
    features: ["Up to 5 users", "10GB storage", "Email support", "Basic analytics", "API access"]
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: 99,
    description: "For growing businesses",
    features: ["Up to 20 users", "100GB storage", "Priority support", "Advanced analytics", "API access", "Custom integrations"],
    featured: true
  },
  {
    id: "ELITE",
    name: "Elite",
    price: 199,
    description: "For established companies",
    features: ["Up to 50 users", "500GB storage", "24/7 support", "Advanced analytics", "API access", "Custom integrations", "SSO"]
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 499,
    description: "For large organizations",
    features: ["Unlimited users", "Unlimited storage", "24/7 dedicated support", "Advanced analytics", "API access", "Custom integrations", "SSO", "White-label", "SLA guarantee"]
  }
];

const comparisonFeatures = [
  { name: "Users", custom: "Custom", starter: "5", growth: "20", elite: "50", enterprise: "Unlimited" },
  { name: "Storage", custom: "Custom", starter: "10GB", growth: "100GB", elite: "500GB", enterprise: "Unlimited" },
  { name: "Email Support", custom: true, starter: true, growth: true, elite: true, enterprise: true },
  { name: "Priority Support", custom: true, starter: false, growth: true, elite: true, enterprise: true },
  { name: "24/7 Support", custom: true, starter: false, growth: false, elite: true, enterprise: true },
  { name: "Basic Analytics", custom: true, starter: true, growth: true, elite: true, enterprise: true },
  { name: "Advanced Analytics", custom: true, starter: false, growth: true, elite: true, enterprise: true },
  { name: "API Access", custom: true, starter: true, growth: true, elite: true, enterprise: true },
  { name: "Custom Integrations", custom: true, starter: false, growth: true, elite: true, enterprise: true },
  { name: "SSO", custom: true, starter: false, growth: false, elite: true, enterprise: true },
  { name: "White-label", custom: true, starter: false, growth: false, elite: false, enterprise: true },
  { name: "SLA Guarantee", custom: true, starter: false, growth: false, elite: false, enterprise: true }
];

export default function PricingPage() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Strive Tech</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">Choose the plan that fits your needs. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              isFeatured={tier.featured}
              onSelect={() => console.log(`Selected ${tier.name}`)}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            data-testid="button-toggle-comparison"
          >
            {showComparison ? "Hide" : "Show"} Feature Comparison
          </Button>
        </div>

        {showComparison && (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Feature</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Custom</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Starter</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Growth</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Elite</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-6 py-3 text-sm font-medium">{feature.name}</td>
                    {["custom", "starter", "growth", "elite", "enterprise"].map((tier) => (
                      <td key={tier} className="px-6 py-3 text-center">
                        {typeof feature[tier as keyof typeof feature] === "boolean" ? (
                          feature[tier as keyof typeof feature] ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature[tier as keyof typeof feature] as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
