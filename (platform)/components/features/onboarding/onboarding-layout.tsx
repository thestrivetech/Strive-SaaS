'use client';

import React from 'react';
import { OnboardingProgress } from './onboarding-progress';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = ['Organization', 'Plan', 'Payment', 'Complete'];

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={STEPS}
      />

      {/* Content Card */}
      <Card className="shadow-xl">
        <CardContent className="p-8 sm:p-12">
          {children}
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{' '}
          <a href="/support" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
