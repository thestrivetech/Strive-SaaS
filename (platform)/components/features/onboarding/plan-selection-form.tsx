'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { PricingToggle } from '../pricing/pricing-toggle';

type BillingCycle = 'MONTHLY' | 'YEARLY';
type SubscriptionTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';

interface PlanSelectionFormProps {
  onNext: (tier: SubscriptionTier, billingCycle: BillingCycle) => void;
  onBack: () => void;
  selectedTier?: string | null;
}

const TIERS = [
  {
    tier: 'STARTER' as SubscriptionTier,
    name: 'Starter',
    price: { MONTHLY: 299, YEARLY: 2990 },
    features: ['Up to 5 team members', 'Basic dashboard', 'Core CRM', 'Email support'],
  },
  {
    tier: 'GROWTH' as SubscriptionTier,
    name: 'Growth',
    price: { MONTHLY: 699, YEARLY: 6990 },
    features: ['Up to 25 members', 'Advanced analytics', 'API access', 'Priority support'],
    popular: true,
  },
  {
    tier: 'ELITE' as SubscriptionTier,
    name: 'Elite',
    price: { MONTHLY: 1999, YEARLY: 19990 },
    features: ['Up to 100 members', 'AI insights', 'Custom workflows', 'Dedicated support'],
  },
];

export function PlanSelectionForm({
  onNext,
  onBack,
  selectedTier,
}: PlanSelectionFormProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selected, setSelected] = useState<SubscriptionTier | null>(
    (selectedTier as SubscriptionTier) || null
  );

  const handleContinue = () => {
    if (selected) {
      onNext(selected, billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Choose your plan
        </h2>
        <p className="text-muted-foreground mt-2">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <PricingToggle
          billingCycle={billingCycle}
          onToggle={setBillingCycle as any}
        />
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const price = tier.price[billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY'];
          const isSelected = selected === tier.tier;

          return (
            <Card
              key={tier.tier}
              className={`relative cursor-pointer transition-all hover-elevate ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border'
              } ${tier.popular ? 'scale-105' : ''}`}
              onClick={() => setSelected(tier.tier)}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="hover-elevate">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="hover-elevate"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
