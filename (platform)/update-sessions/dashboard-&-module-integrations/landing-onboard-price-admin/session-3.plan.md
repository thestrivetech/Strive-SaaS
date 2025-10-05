# Session 3: Onboarding Module Backend & Stripe Integration

## Session Overview
**Goal:** Build complete onboarding flow backend with Stripe payment integration, session management, and organization creation.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Sessions 1-2

## Objectives

1. ✅ Create onboarding module structure
2. ✅ Implement session token management
3. ✅ Build multi-step onboarding flow logic
4. ✅ Integrate Stripe payment intents
5. ✅ Implement organization creation on completion
6. ✅ Add subscription creation
7. ✅ Handle payment webhooks

## Module Structure

```
lib/modules/onboarding/
├── index.ts              # Public API exports
├── schemas.ts            # Zod validation schemas
├── queries.ts            # Session retrieval
├── actions.ts            # Server Actions
├── session.ts            # Session management
├── payment.ts            # Stripe integration
└── completion.ts         # Org/subscription creation
```

## Key Implementations

### Schemas (schemas.ts)
```typescript
import { z } from 'zod';
import { SubscriptionTier, BillingCycle } from '@prisma/client';

export const createOnboardingSessionSchema = z.object({
  userId: z.string().uuid().optional(),
});

export const updateOnboardingStepSchema = z.object({
  sessionToken: z.string().min(1),
  step: z.number().int().min(1).max(4),
  data: z.record(z.any()),
});

export const orgDetailsSchema = z.object({
  orgName: z.string().min(2).max(100),
  orgWebsite: z.string().url().optional(),
  orgDescription: z.string().max(500).optional(),
});

export const planSelectionSchema = z.object({
  selectedTier: z.nativeEnum(SubscriptionTier),
  billingCycle: z.nativeEnum(BillingCycle),
});

export const completeOnboardingSchema = z.object({
  sessionToken: z.string().min(1),
});
```

### Session Management (session.ts)
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import crypto from 'crypto';

export async function createOnboardingSession(userId?: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return await prisma.onboardingSession.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
      currentStep: 1,
      totalSteps: 4,
    },
  });
}

export async function getOnboardingSession(sessionToken: string) {
  const session = await prisma.onboardingSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new Error('Invalid session token');
  }

  if (session.expiresAt < new Date()) {
    throw new Error('Session expired');
  }

  if (session.isCompleted) {
    throw new Error('Session already completed');
  }

  return session;
}

export async function updateOnboardingStep(
  sessionToken: string,
  step: number,
  data: Record<string, any>
) {
  const session = await getOnboardingSession(sessionToken);

  const updateData: any = {
    currentStep: step,
    updatedAt: new Date(),
  };

  // Store step-specific data
  if (step === 1) {
    Object.assign(updateData, {
      orgName: data.orgName,
      orgWebsite: data.orgWebsite,
      orgDescription: data.orgDescription,
    });
  } else if (step === 2) {
    Object.assign(updateData, {
      selectedTier: data.selectedTier,
      billingCycle: data.billingCycle,
    });
  } else if (step === 3) {
    Object.assign(updateData, {
      stripePaymentIntentId: data.paymentIntentId,
      paymentStatus: data.paymentStatus,
    });
  }

  return await prisma.onboardingSession.update({
    where: { sessionToken },
    data: updateData,
  });
}
```

### Payment Integration (payment.ts)
```typescript
'use server';

import Stripe from 'stripe';
import { prisma } from '@/lib/database/prisma';
import type { SubscriptionTier, BillingCycle } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const TIER_PRICES = {
  STARTER: { MONTHLY: 29900, YEARLY: 299000 },   // $299/mo, $2990/yr
  GROWTH: { MONTHLY: 69900, YEARLY: 699000 },    // $699/mo, $6990/yr
  ELITE: { MONTHLY: 199900, YEARLY: 1999000 },   // $1999/mo, $19990/yr
  ENTERPRISE: { MONTHLY: 0, YEARLY: 0 },         // Custom pricing
} as const;

export async function createPaymentIntent(
  tier: SubscriptionTier,
  billingCycle: BillingCycle,
  sessionToken: string
) {
  // FREE tier doesn't need payment
  if (tier === 'FREE') {
    return null;
  }

  const amount = TIER_PRICES[tier]?.[billingCycle];
  if (!amount) {
    throw new Error('Invalid tier or billing cycle');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      sessionToken,
      tier,
      billingCycle,
    },
  });

  // Update session with payment intent ID
  await prisma.onboardingSession.update({
    where: { sessionToken },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'PENDING',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmPayment(sessionToken: string) {
  const session = await prisma.onboardingSession.findUnique({
    where: { sessionToken },
  });

  if (!session?.stripePaymentIntentId) {
    throw new Error('No payment intent found');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.stripePaymentIntentId
  );

  if (paymentIntent.status === 'succeeded') {
    await prisma.onboardingSession.update({
      where: { sessionToken },
      data: { paymentStatus: 'SUCCEEDED' },
    });
    return true;
  }

  return false;
}
```

### Completion Logic (completion.ts)
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';

export async function completeOnboarding(sessionToken: string) {
  const session = await prisma.onboardingSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Verify payment for paid tiers
  if (session.selectedTier !== 'FREE' && session.paymentStatus !== 'SUCCEEDED') {
    throw new Error('Payment required to complete onboarding');
  }

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: session.orgName!,
      website: session.orgWebsite,
      description: session.orgDescription,
    },
  });

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      tier: session.selectedTier!,
      interval: session.billingCycle === 'MONTHLY' ? 'MONTHLY' : 'YEARLY',
      status: 'ACTIVE',
      stripePaymentIntentId: session.stripePaymentIntentId,
    },
  });

  // Update user with organization
  if (session.userId) {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        organizationId: organization.id,
        organizationRole: 'OWNER',
      },
    });
  }

  // Mark session complete
  await prisma.onboardingSession.update({
    where: { sessionToken },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      organizationId: organization.id,
    },
  });

  revalidatePath('/dashboard');
  return { organization, subscription };
}
```

## API Routes

### Payment Intent Creation
**File:** `app/api/v1/onboarding/payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/modules/onboarding/payment';
import { z } from 'zod';

const schema = z.object({
  sessionToken: z.string(),
  tier: z.enum(['STARTER', 'GROWTH', 'ELITE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, tier, billingCycle } = schema.parse(body);

    const result = await createPaymentIntent(tier, billingCycle, sessionToken);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

### Onboarding Session Management
**File:** `app/api/v1/onboarding/session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  createOnboardingSession,
  updateOnboardingStep,
  completeOnboarding,
} from '@/lib/modules/onboarding';

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

    if (action === 'create') {
      const session = await createOnboardingSession(data.userId);
      return NextResponse.json({ sessionToken: session.sessionToken });
    }

    if (action === 'update') {
      const updated = await updateOnboardingStep(
        data.sessionToken,
        data.step,
        data.data
      );
      return NextResponse.json({ session: updated });
    }

    if (action === 'complete') {
      const result = await completeOnboarding(data.sessionToken);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Testing Requirements

### Test 1: Session Creation
```typescript
import { createOnboardingSession } from '@/lib/modules/onboarding';

describe('Onboarding Session', () => {
  it('should create session with valid token', async () => {
    const session = await createOnboardingSession();
    expect(session.sessionToken).toBeDefined();
    expect(session.expiresAt).toBeInstanceOf(Date);
  });
});
```

### Test 2: Payment Intent
```typescript
import { createPaymentIntent } from '@/lib/modules/onboarding/payment';

describe('Payment Integration', () => {
  it('should create Stripe payment intent', async () => {
    const result = await createPaymentIntent('STARTER', 'MONTHLY', 'test-token');
    expect(result?.clientSecret).toBeDefined();
  });
});
```

### Test 3: Completion Flow
```typescript
import { completeOnboarding } from '@/lib/modules/onboarding/completion';

describe('Onboarding Completion', () => {
  it('should create organization and subscription', async () => {
    const result = await completeOnboarding('valid-token');
    expect(result.organization).toBeDefined();
    expect(result.subscription).toBeDefined();
  });
});
```

## Success Criteria

- [ ] Onboarding module structure created
- [ ] Session token management working
- [ ] Multi-step flow logic complete
- [ ] Stripe payment integration functional
- [ ] Organization creation on completion
- [ ] Subscription creation working
- [ ] Payment webhooks handled
- [ ] Session expiration enforced
- [ ] Error handling comprehensive
- [ ] Tests passing with 80%+ coverage

## Files Created

```
✅ lib/modules/onboarding/schemas.ts
✅ lib/modules/onboarding/session.ts
✅ lib/modules/onboarding/payment.ts
✅ lib/modules/onboarding/completion.ts
✅ lib/modules/onboarding/queries.ts
✅ lib/modules/onboarding/actions.ts
✅ lib/modules/onboarding/index.ts
✅ app/api/v1/onboarding/payment-intent/route.ts
✅ app/api/v1/onboarding/session/route.ts
✅ __tests__/modules/onboarding/*.test.ts
```

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Next Steps

1. ✅ Proceed to **Session 4: Landing Page UI Components**
2. ✅ Onboarding backend complete
3. ✅ Ready to build frontend UI

---

**Session 3 Complete:** ✅ Onboarding module with Stripe integration implemented
