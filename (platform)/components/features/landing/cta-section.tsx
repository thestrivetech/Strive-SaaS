'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  'No credit card required',
  '14-day free trial',
  'Cancel anytime',
  'Full feature access',
];

export function CTASection() {
  return (
    <section className="px-6 py-24 sm:py-32 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Ready to get started?
        </h2>
        <p className="mt-6 text-xl text-muted-foreground">
          Join thousands of teams already building better products with Strive.
        </p>

        {/* Benefits List */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-10">
          <Button asChild size="lg" className="hover-elevate">
            <Link href="/onboarding">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required • Free 14-day trial
        </p>
      </div>
    </section>
  );
}
