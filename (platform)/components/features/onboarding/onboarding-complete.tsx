'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingCompleteProps {
  onComplete: () => void;
  orgData: { name: string };
}

export function OnboardingComplete({
  onComplete,
  orgData,
}: OnboardingCompleteProps) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to Strive!
        </h2>
        <p className="text-xl text-muted-foreground mt-4">
          Your organization <strong>{orgData.name}</strong> is all set up.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4 text-left">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Organization Created</p>
            <p className="text-sm text-muted-foreground">
              Your workspace is ready to use
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Subscription Active</p>
            <p className="text-sm text-muted-foreground">
              14-day free trial started
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Dashboard Ready</p>
            <p className="text-sm text-muted-foreground">
              Everything is configured and ready to go
            </p>
          </div>
        </div>
      </div>

      <Button size="lg" onClick={onComplete} className="hover-elevate mt-8">
        Go to Dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
