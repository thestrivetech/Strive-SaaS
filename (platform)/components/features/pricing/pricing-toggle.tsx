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
          Save 17%
        </span>
      </Button>
    </div>
  );
}
