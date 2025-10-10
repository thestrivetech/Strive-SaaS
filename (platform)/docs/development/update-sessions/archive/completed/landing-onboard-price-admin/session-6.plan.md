# Session 6: Onboarding Flow UI (Multi-Step Wizard)

## Session Overview
**Goal:** Build complete multi-step onboarding wizard UI with organization setup, plan selection, payment integration, and completion flow.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** Sessions 1-5 (Backend + Pricing page)

## Objectives

1. ✅ Create onboarding route structure
2. ✅ Build multi-step wizard layout with progress tracking
3. ✅ Implement Step 1: Organization Details form
4. ✅ Implement Step 2: Plan Selection (from pricing tiers)
5. ✅ Implement Step 3: Payment Form (Stripe integration)
6. ✅ Implement Step 4: Completion & Success
7. ✅ Add step validation and error handling
8. ✅ Integrate with backend onboarding module

## Prerequisites

- [x] Onboarding backend complete (Session 3)
- [x] Pricing page complete (Session 5)
- [x] Stripe publishable key configured
- [x] shadcn/ui form components installed
- [x] React Hook Form + Zod setup

## Onboarding Flow Steps

```
Step 1: Organization Details
  - Organization name
  - Website (optional)
  - Description (optional)

Step 2: Plan Selection
  - Display 4 tiers (Starter, Growth, Elite, Enterprise)
  - Monthly/Yearly toggle
  - Pre-select tier from URL param if available

Step 3: Payment
  - Stripe payment form (for paid tiers)
  - Free tier skips this step
  - Collect payment method

Step 4: Completion
  - Processing state
  - Success confirmation
  - Redirect to dashboard
```

## Component Structure

```
app/(auth)/onboarding/
├── page.tsx                  # Main onboarding page
├── layout.tsx                # Onboarding layout

components/features/onboarding/
├── onboarding-layout.tsx     # Wizard container
├── onboarding-progress.tsx   # Step indicator
├── org-details-form.tsx      # Step 1 form
├── plan-selection-form.tsx   # Step 2 selection
├── payment-form.tsx          # Step 3 Stripe
├── onboarding-complete.tsx   # Step 4 success
└── onboarding-nav.tsx        # Back/Next navigation
```

## Implementation Steps

### Step 1: Create Onboarding Layout

**File:** `app/(auth)/onboarding/layout.tsx`

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started - Strive',
  description: 'Set up your Strive account in minutes',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
```

### Step 2: Create Onboarding Progress Indicator

**File:** `components/features/onboarding/onboarding-progress.tsx`

```tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  steps,
}: OnboardingProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isComplete
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 sm:w-24 transition-all ${
                    isComplete ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Step 3: Create Onboarding Wizard Container

**File:** `components/features/onboarding/onboarding-layout.tsx`

```tsx
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
```

### Step 4: Create Step 1 - Organization Details Form

**File:** `components/features/onboarding/org-details-form.tsx`

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';

const orgDetailsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
});

type OrgDetailsFormData = z.infer<typeof orgDetailsSchema>;

interface OrgDetailsFormProps {
  onNext: (data: OrgDetailsFormData) => void;
  initialData?: Partial<OrgDetailsFormData>;
}

export function OrgDetailsForm({ onNext, initialData }: OrgDetailsFormProps) {
  const form = useForm<OrgDetailsFormData>({
    resolver: zodResolver(orgDetailsSchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tell us about your organization
        </h2>
        <p className="text-muted-foreground mt-2">
          This information helps us customize your experience.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          {/* Organization Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormDescription>
                  The name of your company or team
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://acme.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your organization..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Maximum 500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="hover-elevate">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### Step 5: Create Step 2 - Plan Selection Form

**File:** `components/features/onboarding/plan-selection-form.tsx`

```tsx
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
```

### Step 6: Create Step 3 - Payment Form (Stripe)

**File:** `components/features/onboarding/payment-form.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  onNext: () => void;
  onBack: () => void;
  planData: {
    tier: string | null;
    billingCycle: string;
    org: { name: string };
  };
  clientSecret?: string;
}

function PaymentFormContent({ onNext, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/onboarding/complete`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Complete Setup'}
          <Lock className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  if (!props.clientSecret) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Loading payment form...</h2>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Payment Information
        </h2>
        <p className="text-muted-foreground mt-2">
          Enter your payment details to complete setup.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Secured by Stripe. Your information is encrypted.</span>
        </div>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <PaymentFormContent {...props} />
      </Elements>
    </div>
  );
}
```

### Step 7: Create Step 4 - Completion

**File:** `components/features/onboarding/onboarding-complete.tsx`

```tsx
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
```

### Step 8: Assemble Main Onboarding Page

**File:** `app/(auth)/onboarding/page.tsx`

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OnboardingLayout } from '@/components/features/onboarding/onboarding-layout';
import { OrgDetailsForm } from '@/components/features/onboarding/org-details-form';
import { PlanSelectionForm } from '@/components/features/onboarding/plan-selection-form';
import { PaymentForm } from '@/components/features/onboarding/payment-form';
import { OnboardingComplete } from '@/components/features/onboarding/onboarding-complete';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
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
      const response = await fetch('/api/v1/onboarding/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const data = await response.json();
      setSessionToken(data.sessionToken);
    }
    createSession();
  }, []);

  const handleOrgNext = async (data: any) => {
    setFormData({ ...formData, org: data });

    // Update session
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

    setCurrentStep(2);
  };

  const handlePlanNext = async (tier: string, billingCycle: string) => {
    setFormData({ ...formData, tier, billingCycle });

    // Update session
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

    // Create payment intent for paid tiers
    if (tier !== 'FREE') {
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
    }

    setCurrentStep(3);
  };

  const handlePaymentNext = async () => {
    // Complete onboarding
    await fetch('/api/v1/onboarding/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete',
        sessionToken,
      }),
    });

    setCurrentStep(4);
  };

  const handleComplete = () => {
    window.location.href = '/dashboard';
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
```

## Testing Requirements

### Test 1: Multi-Step Navigation
```typescript
// Test step progression
it('should navigate through all steps', async () => {
  render(<OnboardingPage />);

  // Fill org details
  fireEvent.change(screen.getByLabelText(/organization name/i), {
    target: { value: 'Test Org' }
  });
  fireEvent.click(screen.getByText('Continue'));

  // Should show plan selection
  expect(screen.getByText('Choose your plan')).toBeInTheDocument();
});
```

### Test 2: Form Validation
```typescript
// Test org details validation
it('should show validation errors', async () => {
  render(<OrgDetailsForm onNext={jest.fn()} />);

  fireEvent.click(screen.getByText('Continue'));

  expect(await screen.findByText(/organization name must be at least 2 characters/i))
    .toBeInTheDocument();
});
```

### Test 3: Stripe Integration
```typescript
// Test payment intent creation
it('should create payment intent for paid tiers', async () => {
  const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ clientSecret: 'pi_test_secret' }),
  } as any);

  // Select Growth tier
  // Verify payment intent created
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Onboarding route created (`app/(auth)/onboarding/page.tsx`)
- [ ] Progress indicator shows all 4 steps
- [ ] Step 1: Org details form with validation
- [ ] Step 2: Plan selection with tier cards
- [ ] Step 3: Stripe payment form integration
- [ ] Step 4: Success/completion screen
- [ ] Back/Next navigation functional
- [ ] URL params pre-select tier (from pricing page)
- [ ] Session token created and managed
- [ ] Payment intent created for paid tiers
- [ ] Onboarding completion creates org + subscription
- [ ] Mobile responsive design
- [ ] No console errors

**Quality Checks:**
- [ ] Form validation with Zod schemas
- [ ] Error handling on API failures
- [ ] Loading states during async operations
- [ ] Stripe payment secure (HTTPS only)
- [ ] Accessibility: keyboard navigation, ARIA
- [ ] Progress indicator updates correctly

## Environment Variables Required

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Files Created/Modified

```
✅ app/(auth)/onboarding/layout.tsx
✅ app/(auth)/onboarding/page.tsx
✅ components/features/onboarding/onboarding-layout.tsx
✅ components/features/onboarding/onboarding-progress.tsx
✅ components/features/onboarding/org-details-form.tsx
✅ components/features/onboarding/plan-selection-form.tsx
✅ components/features/onboarding/payment-form.tsx
✅ components/features/onboarding/onboarding-complete.tsx
✅ __tests__/components/onboarding/wizard.test.tsx
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 7: Admin Dashboard UI & Layout**
2. ✅ Onboarding wizard complete
3. ✅ Ready to build admin dashboard interface

---

**Session 6 Complete:** ✅ Multi-step onboarding wizard with Stripe payment integration implemented
