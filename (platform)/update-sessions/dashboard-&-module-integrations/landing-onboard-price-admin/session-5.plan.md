# Session 5: Pricing Page Implementation & Tier Comparison

## Session Overview
**Goal:** Build the complete pricing page with tier comparison table, feature breakdowns, FAQ section, and seamless integration with onboarding flow.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-4

## Objectives

1. ✅ Create pricing page route
2. ✅ Build tier comparison cards (4 tiers: Starter, Growth, Elite, Enterprise)
3. ✅ Implement feature comparison matrix
4. ✅ Add billing cycle toggle (Monthly/Yearly)
5. ✅ Create FAQ section
6. ✅ Integrate with onboarding flow
7. ✅ Add pricing calculator (optional)
8. ✅ Ensure mobile responsiveness

## Prerequisites

- [x] Landing page complete (Session 4)
- [x] Onboarding backend ready (Session 3)
- [x] Design system established
- [x] Subscription tiers defined in Prisma schema

## Pricing Tiers Structure

```typescript
// Pricing configuration (from integration guide)
const PRICING_TIERS = {
  STARTER: {
    name: 'Starter',
    price: { monthly: 299, yearly: 2990 },
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      'Basic dashboard',
      'Core CRM features',
      'Email support',
      '5GB storage',
    ],
    popular: false,
  },
  GROWTH: {
    name: 'Growth',
    price: { monthly: 699, yearly: 6990 },
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Advanced analytics',
      'All CRM features',
      'Priority support',
      '50GB storage',
      'API access',
      'Custom integrations',
    ],
    popular: true, // Most popular tier
  },
  ELITE: {
    name: 'Elite',
    price: { monthly: 1999, yearly: 19990 },
    description: 'For established teams with advanced needs',
    features: [
      'Up to 100 team members',
      'AI-powered insights',
      'Advanced automation',
      'Dedicated support',
      '200GB storage',
      'Advanced API access',
      'Priority integrations',
      'Custom workflows',
    ],
    popular: false,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For large organizations with custom requirements',
    features: [
      'Unlimited team members',
      'Enterprise-grade security',
      'Custom AI models',
      '24/7 phone support',
      'Unlimited storage',
      'Custom API development',
      'Dedicated success manager',
      'SLA guarantees',
    ],
    popular: false,
  },
};
```

## Component Structure

```
app/(marketing)/pricing/
├── page.tsx                 # Pricing page

components/features/pricing/
├── pricing-tiers.tsx        # Tier comparison cards
├── pricing-toggle.tsx       # Monthly/Yearly toggle
├── pricing-faq.tsx          # FAQ section
├── feature-matrix.tsx       # Feature comparison table
└── pricing-calculator.tsx   # Interactive calculator
```

## Implementation Steps

### Step 1: Create Pricing Page Route

**File:** `app/(marketing)/pricing/page.tsx`

```tsx
import { PricingTiers } from '@/components/features/pricing/pricing-tiers';
import { PricingFAQ } from '@/components/features/pricing/pricing-faq';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Strive',
  description:
    'Simple, transparent pricing. Choose the plan that fits your needs. No hidden fees.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <PricingTiers />

      {/* FAQ Section */}
      <PricingFAQ />
    </div>
  );
}
```

### Step 2: Create Pricing Tiers Component

**File:** `components/features/pricing/pricing-tiers.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { PricingToggle } from './pricing-toggle';

type BillingCycle = 'monthly' | 'yearly';

interface PricingTier {
  name: string;
  price: { monthly: number | string; yearly: number | string };
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: { monthly: 299, yearly: 2990 },
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      'Basic dashboard',
      'Core CRM features',
      'Email support',
      '5GB storage',
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=starter',
  },
  {
    name: 'Growth',
    price: { monthly: 699, yearly: 6990 },
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Advanced analytics',
      'All CRM features',
      'Priority support',
      '50GB storage',
      'API access',
      'Custom integrations',
    ],
    popular: true,
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=growth',
  },
  {
    name: 'Elite',
    price: { monthly: 1999, yearly: 19990 },
    description: 'For established teams with advanced needs',
    features: [
      'Up to 100 team members',
      'AI-powered insights',
      'Advanced automation',
      'Dedicated support',
      '200GB storage',
      'Advanced API access',
      'Priority integrations',
      'Custom workflows',
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=elite',
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For large organizations with custom requirements',
    features: [
      'Unlimited team members',
      'Enterprise-grade security',
      'Custom AI models',
      '24/7 phone support',
      'Unlimited storage',
      'Custom API development',
      'Dedicated success manager',
      'SLA guarantees',
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact-sales',
  },
];

export function PricingTiers() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return `$${price.toLocaleString()}`;
  };

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

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
          {TIERS.map((tier) => {
            const price = tier.price[billingCycle];
            const isCustom = price === 'Custom';

            return (
              <Card
                key={tier.name}
                className={`relative hover-elevate transition-all duration-200 ${
                  tier.popular
                    ? 'border-primary shadow-lg ring-1 ring-primary/20 scale-105'
                    : 'border-border'
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">
                    {tier.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold tracking-tight">
                      {formatPrice(price)}
                    </span>
                    {!isCustom && (
                      <span className="text-sm font-medium text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>

                  {/* Savings Badge */}
                  {billingCycle === 'yearly' &&
                    !isCustom &&
                    typeof tier.price.monthly === 'number' &&
                    typeof tier.price.yearly === 'number' && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Save{' '}
                          {calculateSavings(
                            tier.price.monthly,
                            tier.price.yearly
                          )}
                          %
                        </Badge>
                      </div>
                    )}

                  <p className="mt-4 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    asChild
                    className={`w-full hover-elevate ${
                      tier.popular
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                    }`}
                  >
                    <Link href={tier.ctaLink}>{tier.ctaText}</Link>
                  </Button>

                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
```

### Step 3: Create Billing Toggle Component

**File:** `components/features/pricing/pricing-toggle.tsx`

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PricingToggleProps {
  billingCycle: 'monthly' | 'yearly';
  onToggle: (cycle: 'monthly' | 'yearly') => void;
}

export function PricingToggle({ billingCycle, onToggle }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border bg-muted p-1">
      <Button
        variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('monthly')}
        className="transition-all"
      >
        Monthly
      </Button>
      <Button
        variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('yearly')}
        className="transition-all"
      >
        Yearly
        <span className="ml-1.5 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
          Save 20%
        </span>
      </Button>
    </div>
  );
}
```

### Step 4: Create FAQ Section

**File:** `components/features/pricing/pricing-faq.tsx`

```tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. If you upgrade, you\'ll be prorated for the current period.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, all paid plans come with a 14-day free trial. No credit card required to start. You can explore all features before committing.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data is safely stored for 30 days after cancellation, giving you time to export or reactivate your account. After 30 days, data is permanently deleted.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact support for a full refund within the first 30 days.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and ACH transfers for annual plans. Enterprise plans can pay via invoice.',
  },
  {
    question: 'Can I get a custom plan?',
    answer:
      'Yes! Enterprise plans are fully customizable. Contact our sales team to discuss your specific requirements and we\'ll create a plan that fits your needs.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use bank-level encryption (AES-256), SOC 2 Type II compliance, and multi-tenant isolation. Your data is yours and is never shared.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'Starter and Growth plans include email support (24-48 hour response). Elite plans get priority support (4-hour response). Enterprise plans get dedicated support with 24/7 phone access.',
  },
];

export function PricingFAQ() {
  return (
    <section className="px-6 py-24 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, index) => (
            <Card key={index} className="hover-elevate">
              <AccordionItem value={`item-${index}`} className="border-none">
                <CardContent className="pt-6 pb-0">
                  <AccordionTrigger className="hover:no-underline">
                    <h3 className="font-semibold text-lg text-left">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pt-2">{faq.answer}</p>
                  </AccordionContent>
                </CardContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### Step 5: Create Feature Comparison Matrix (Optional)

**File:** `components/features/pricing/feature-matrix.tsx`

```tsx
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

const FEATURE_MATRIX = {
  'Core Features': {
    'Basic Dashboard': ['starter', 'growth', 'elite', 'enterprise'],
    'CRM System': ['starter', 'growth', 'elite', 'enterprise'],
    'Project Management': ['starter', 'growth', 'elite', 'enterprise'],
    'Email Support': ['starter', 'growth', 'elite', 'enterprise'],
  },
  'Advanced Features': {
    'Advanced Analytics': ['growth', 'elite', 'enterprise'],
    'API Access': ['growth', 'elite', 'enterprise'],
    'Custom Integrations': ['growth', 'elite', 'enterprise'],
    'AI-Powered Insights': ['elite', 'enterprise'],
    'Advanced Automation': ['elite', 'enterprise'],
    'Custom AI Models': ['enterprise'],
  },
  'Support': {
    'Email Support': ['starter', 'growth', 'elite', 'enterprise'],
    'Priority Support': ['growth', 'elite', 'enterprise'],
    'Dedicated Support': ['elite', 'enterprise'],
    '24/7 Phone Support': ['enterprise'],
    'Success Manager': ['enterprise'],
  },
};

const TIERS = ['starter', 'growth', 'elite', 'enterprise'];

export function FeatureMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-semibold">Feature</th>
            {TIERS.map((tier) => (
              <th key={tier} className="text-center p-4 font-semibold capitalize">
                {tier}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(FEATURE_MATRIX).map(([category, features]) => (
            <React.Fragment key={category}>
              <tr className="bg-muted/50">
                <td colSpan={5} className="p-4 font-semibold">
                  {category}
                </td>
              </tr>
              {Object.entries(features).map(([feature, tiers]) => (
                <tr key={feature} className="border-b hover:bg-muted/30">
                  <td className="p-4">{feature}</td>
                  {TIERS.map((tier) => (
                    <td key={tier} className="text-center p-4">
                      {tiers.includes(tier) ? (
                        <Check className="inline h-5 w-5 text-primary" />
                      ) : (
                        <X className="inline h-5 w-5 text-muted-foreground/30" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Testing & Validation

### Test 1: Pricing Display
```typescript
// __tests__/components/pricing/pricing-tiers.test.tsx
import { render, screen } from '@testing-library/react';
import { PricingTiers } from '@/components/features/pricing/pricing-tiers';

describe('PricingTiers', () => {
  it('should display all 4 pricing tiers', () => {
    render(<PricingTiers />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('should mark Growth as most popular', () => {
    render(<PricingTiers />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });
});
```

### Test 2: Billing Toggle
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingToggle } from '@/components/features/pricing/pricing-toggle';

describe('PricingToggle', () => {
  it('should toggle between monthly and yearly', () => {
    const onToggle = jest.fn();
    render(<PricingToggle billingCycle="monthly" onToggle={onToggle} />);

    const yearlyButton = screen.getByText('Yearly');
    fireEvent.click(yearlyButton);

    expect(onToggle).toHaveBeenCalledWith('yearly');
  });
});
```

### Test 3: Integration with Onboarding
```typescript
// Test that pricing links correctly pass tier parameter
it('should link to onboarding with tier parameter', () => {
  render(<PricingTiers />);
  const starterCTA = screen.getByText('Start Free Trial');
  expect(starterCTA).toHaveAttribute('href', '/onboarding?tier=starter');
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Pricing page route created (`app/(marketing)/pricing/page.tsx`)
- [ ] All 4 tiers displayed with correct pricing
- [ ] Growth tier marked as "Most Popular"
- [ ] Billing toggle switches between monthly/yearly
- [ ] Yearly pricing shows savings percentage
- [ ] FAQ section with accordion functionality
- [ ] All CTA links point to onboarding with tier parameter
- [ ] Mobile responsive (cards stack on mobile)
- [ ] Accessibility: keyboard navigation, ARIA labels
- [ ] No console errors or warnings

**Quality Checks:**
- [ ] Price formatting correct ($299, not $299.00)
- [ ] Savings calculation accurate (20% for yearly)
- [ ] Hover effects smooth (elevation)
- [ ] Card scaling for popular tier
- [ ] FAQ accordion animations
- [ ] Enterprise "Contact Sales" link correct

## Files Created/Modified

```
✅ app/(marketing)/pricing/page.tsx
✅ components/features/pricing/pricing-tiers.tsx
✅ components/features/pricing/pricing-toggle.tsx
✅ components/features/pricing/pricing-faq.tsx
✅ components/features/pricing/feature-matrix.tsx
✅ __tests__/components/pricing/pricing-tiers.test.tsx
✅ __tests__/components/pricing/pricing-toggle.test.tsx
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Onboarding Flow UI**
2. ✅ Pricing page complete with tier comparison
3. ✅ Ready to build multi-step onboarding wizard

---

**Session 5 Complete:** ✅ Pricing page with tier comparison and FAQ implemented
