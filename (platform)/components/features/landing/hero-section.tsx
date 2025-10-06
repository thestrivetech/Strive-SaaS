'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Main Heading */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Build Better Products,{' '}
            <span className="text-primary">Faster</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl leading-8 text-muted-foreground">
            The enterprise SaaS platform that empowers teams to ship products 10x faster
            with powerful tools and seamless workflows.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto hover-elevate">
            <Link href="/onboarding">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* TODO Session 5: Re-enable once pricing page is built */}
          {/* <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto hover-elevate"
          >
            <Link href="/pricing">View Pricing</Link>
          </Button> */}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16">
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by thousands of teams worldwide
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60">
            {/* Logo placeholders - replace with actual customer logos */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 rounded bg-muted animate-pulse"
                aria-label={`Partner logo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
