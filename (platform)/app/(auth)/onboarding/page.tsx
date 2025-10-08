'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OnboardingLayout } from '@/components/features/onboarding/onboarding-layout';
import { OrgDetailsForm } from '@/components/features/onboarding/org-details-form';
import { PlanSelectionForm } from '@/components/features/onboarding/plan-selection-form';
import { PaymentForm } from '@/components/features/onboarding/payment-form';
import { OnboardingComplete } from '@/components/features/onboarding/onboarding-complete';

type Step = 1 | 2 | 3 | 4;

function OnboardingContent() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    org: { name: '', website: '', description: '' },
    tier: tierParam || null,
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
  });

  // Create onboarding session on mount
  useEffect(() => {
    async function createSession() {
      try {
        const response = await fetch('/api/v1/onboarding/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' }),
        });
        const data = await response.json();
        setSessionToken(data.sessionToken);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    }
    createSession();
  }, []);

  const handleOrgNext = async (data: any) => {
    setFormData({ ...formData, org: data });

    // Update session
    if (sessionToken) {
      try {
        await fetch('/api/v1/onboarding/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            sessionToken,
            step: 1,
            data,
          }),
        });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }

    setCurrentStep(2);
  };

  const handlePlanNext = async (tier: string, billingCycle: string) => {
    setFormData({ ...formData, tier, billingCycle: billingCycle as 'MONTHLY' | 'YEARLY' });

    // Update session
    if (sessionToken) {
      try {
        await fetch('/api/v1/onboarding/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            sessionToken,
            step: 2,
            data: { selectedTier: tier, billingCycle },
          }),
        });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }

    // Create payment intent for paid tiers
    if (tier !== 'FREE' && sessionToken) {
      try {
        const response = await fetch('/api/v1/onboarding/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            tier,
            billingCycle,
          }),
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      }
    }

    setCurrentStep(3);
  };

  const handlePaymentNext = async () => {
    // Complete onboarding
    if (sessionToken) {
      try {
        await fetch('/api/v1/onboarding/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            sessionToken,
          }),
        });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    }

    setCurrentStep(4);
  };

  const handleComplete = () => {
    window.location.href = '/real-estate/dashboard';
  };

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={4}>
      {currentStep === 1 && (
        <OrgDetailsForm
          onNext={handleOrgNext}
          initialData={formData.org}
        />
      )}

      {currentStep === 2 && (
        <PlanSelectionForm
          onNext={handlePlanNext}
          onBack={() => setCurrentStep(1)}
          selectedTier={formData.tier}
        />
      )}

      {currentStep === 3 && (
        <PaymentForm
          onNext={handlePaymentNext}
          onBack={() => setCurrentStep(2)}
          planData={formData}
          clientSecret={clientSecret || undefined}
        />
      )}

      {currentStep === 4 && (
        <OnboardingComplete
          onComplete={handleComplete}
          orgData={formData.org}
        />
      )}
    </OnboardingLayout>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
