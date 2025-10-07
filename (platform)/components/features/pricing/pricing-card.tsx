import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingCardProps {
  name: string;
  price: number | string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaLink: string;
  billingCycle: 'monthly' | 'yearly';
  savingsPercentage?: number;
}

function formatPrice(amount: number | string): string {
  if (typeof amount === 'string') return amount;
  return `$${amount.toLocaleString()}`;
}

function CardHeaderContent({
  name,
  price,
  billingCycle,
  savingsPercentage,
  description,
}: {
  name: string;
  price: number | string;
  billingCycle: 'monthly' | 'yearly';
  savingsPercentage?: number;
  description: string;
}) {
  const isCustom = price === 'Custom';

  return (
    <CardHeader className="text-center pb-8">
      <CardTitle className="text-2xl font-bold">{name}</CardTitle>
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

      {savingsPercentage && billingCycle === 'yearly' && !isCustom && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            Save {savingsPercentage}%
          </Badge>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </CardHeader>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <div key={feature} className="flex items-start gap-3">
          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  );
}

export function PricingCard({
  name,
  price,
  description,
  features,
  popular,
  ctaText,
  ctaLink,
  billingCycle,
  savingsPercentage,
}: PricingCardProps) {
  return (
    <Card
      className={`relative hover-elevate transition-all duration-200 ${
        popular
          ? 'border-primary shadow-lg ring-1 ring-primary/20 scale-105'
          : 'border-border'
      }`}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}

      <CardHeaderContent
        name={name}
        price={price}
        billingCycle={billingCycle}
        savingsPercentage={savingsPercentage}
        description={description}
      />

      <CardContent className="space-y-6">
        <Button
          asChild
          className={`w-full hover-elevate ${
            popular
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
          }`}
        >
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>

        <FeatureList features={features} />
      </CardContent>
    </Card>
  );
}
