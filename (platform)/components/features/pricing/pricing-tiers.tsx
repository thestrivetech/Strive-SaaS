'use client';

import React, { useState } from 'react';
import { PricingToggle } from './pricing-toggle';
import { PricingCard } from './pricing-card';
import { PRICING_TIERS } from './pricing-data';

type BillingCycle = 'monthly' | 'yearly';

function calculateSavings(monthly: number, yearly: number): number {
  const monthlyCost = monthly * 12;
  const savings = monthlyCost - yearly;
  return Math.round((savings / monthlyCost) * 100);
}

export function PricingTiers() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <section className="px-6 pb-24 sm:pb-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Billing Toggle */}
        <div className="mb-12 flex justify-center">
          <PricingToggle
            billingCycle={billingCycle}
            onToggle={setBillingCycle}
          />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => {
            const price = tier.price[billingCycle];
            const savingsPercentage =
              typeof tier.price.monthly === 'number' &&
              typeof tier.price.yearly === 'number'
                ? calculateSavings(tier.price.monthly, tier.price.yearly)
                : undefined;

            return (
              <PricingCard
                key={tier.name}
                name={tier.name}
                price={price}
                description={tier.description}
                features={tier.features}
                popular={tier.popular}
                ctaText={tier.ctaText}
                ctaLink={tier.ctaLink}
                billingCycle={billingCycle}
                savingsPercentage={savingsPercentage}
              />
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
