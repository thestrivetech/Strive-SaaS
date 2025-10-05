# Session 10: Admin API Routes & Webhooks

## Session Overview
**Goal:** Complete admin API infrastructure with comprehensive routes for user management, organization management, and Stripe webhook handlers for payment events.

**Duration:** 3-4 hours
**Complexity:** Medium-High
**Dependencies:** Sessions 1-9

## Objectives

1. ✅ Create complete admin users API routes
2. ✅ Create complete admin organizations API routes
3. ✅ Implement user suspend/reactivate endpoints
4. ✅ Implement organization management endpoints
5. ✅ Add Stripe webhook handler for payment events
6. ✅ Add audit logging to all admin actions
7. ✅ Implement rate limiting for admin endpoints
8. ✅ Add comprehensive error handling

## Prerequisites

- [x] Admin backend modules complete (Session 2)
- [x] Admin UI complete (Sessions 7-9)
- [x] Stripe integration ready (Session 3)
- [x] Rate limiting middleware available

## API Routes Structure

```
Admin API Routes:
- GET /api/v1/admin/users
- POST /api/v1/admin/users/suspend
- POST /api/v1/admin/users/reactivate
- DELETE /api/v1/admin/users/:id

- GET /api/v1/admin/organizations
- PATCH /api/v1/admin/organizations/:id
- DELETE /api/v1/admin/organizations/:id

- GET /api/v1/admin/audit-logs
- GET /api/v1/admin/metrics

Webhooks:
- POST /api/webhooks/stripe (payment events)
```

## Implementation Steps

### Step 1: Create Admin Users API Routes

**File:** `app/api/v1/admin/users/suspend/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageUsers } from '@/lib/auth/rbac';
import { suspendUser } from '@/lib/modules/admin';
import { z } from 'zod';

const suspendSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  suspendUntil: z.coerce.date().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    // RBAC check
    if (!canManageUsers(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validated = suspendSchema.parse(body);

    // Suspend user
    const user = await suspendUser(validated);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Suspend user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/admin/users/reactivate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageUsers } from '@/lib/auth/rbac';
import { reactivateUser } from '@/lib/modules/admin';
import { z } from 'zod';

const reactivateSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canManageUsers(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = reactivateSchema.parse(body);

    const user = await reactivateUser(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error: any) {
    console.error('Reactivate user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/admin/users/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageUsers } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { logAdminAction } from '@/lib/modules/admin/audit';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canManageUsers(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Prevent deleting own account
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    // Log action
    await logAdminAction({
      action: 'USER_DELETE',
      description: `Deleted user: ${user.email}`,
      targetType: 'user',
      targetId: userId,
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Admin Organizations API Routes

**File:** `app/api/v1/admin/organizations/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageOrganizations } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { logAdminAction } from '@/lib/modules/admin/audit';
import { z } from 'zod';

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  website: z.string().url().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canManageOrganizations(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true },
        },
        subscription: {
          select: {
            tier: true,
            status: true,
            interval: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                globalRole: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canManageOrganizations(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateOrgSchema.parse(body);

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: validated,
    });

    // Log action
    await logAdminAction({
      action: 'ORG_UPDATE',
      description: `Updated organization: ${organization.name}`,
      targetType: 'organization',
      targetId: organization.id,
      metadata: validated,
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error: any) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canManageOrganizations(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.delete({
      where: { id: params.id },
    });

    // Log action
    await logAdminAction({
      action: 'ORG_DELETE',
      description: `Deleted organization: ${organization.name}`,
      targetType: 'organization',
      targetId: organization.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
```

### Step 3: Create Audit Logs API Route

**File:** `app/api/v1/admin/audit-logs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canViewAuditLogs } from '@/lib/auth/rbac';
import { getAdminActionLogs } from '@/lib/modules/admin/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canViewAuditLogs(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      action: searchParams.get('action') || undefined,
      adminId: searchParams.get('adminId') || undefined,
      targetType: searchParams.get('targetType') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: Number(searchParams.get('limit')) || 100,
    };

    const logs = await getAdminActionLogs(filters);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
```

### Step 4: Create Stripe Webhook Handler

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/database/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const sessionToken = paymentIntent.metadata.sessionToken;

  if (sessionToken) {
    // Update onboarding session
    await prisma.onboardingSession.update({
      where: { sessionToken },
      data: {
        paymentStatus: 'SUCCEEDED',
        stripePaymentIntentId: paymentIntent.id,
      },
    });
  }

  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const sessionToken = paymentIntent.metadata.sessionToken;

  if (sessionToken) {
    await prisma.onboardingSession.update({
      where: { sessionToken },
      data: {
        paymentStatus: 'FAILED',
      },
    });
  }

  console.log(`Payment failed: ${paymentIntent.id}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by Stripe customer ID
  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (org) {
    await prisma.subscription.upsert({
      where: { organizationId: org.id },
      update: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        organizationId: org.id,
        tier: 'STARTER', // Should be determined from subscription metadata
        status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        interval: subscription.items.data[0].price.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (org) {
    await prisma.subscription.update({
      where: { organizationId: org.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }

  console.log(`Subscription cancelled: ${subscription.id}`);
}
```

### Step 5: Add Rate Limiting Middleware (Optional but Recommended)

**File:** `lib/middleware/rate-limit.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(options: {
  interval: number; // milliseconds
  maxRequests: number;
}) {
  return async (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;

    // Clean up old entries
    if (store[key] && store[key].resetAt < now) {
      delete store[key];
    }

    // Initialize or increment
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetAt: now + options.interval,
      };
    } else {
      store[key].count++;
    }

    // Check limit
    if (store[key].count > options.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    return null; // Allow request
  };
}
```

## Testing Requirements

### Test 1: User Suspension
```typescript
// Test suspend endpoint
it('should suspend user with valid request', async () => {
  const response = await fetch('/api/v1/admin/users/suspend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-123',
      reason: 'Violation of TOS',
    }),
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.user.isSuspended).toBe(true);
});
```

### Test 2: Webhook Signature Verification
```typescript
// Test Stripe webhook signature
it('should reject invalid webhook signatures', async () => {
  const response = await fetch('/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'stripe-signature': 'invalid_signature',
    },
    body: JSON.stringify({ type: 'payment_intent.succeeded' }),
  });

  expect(response.status).toBe(400);
});
```

### Test 3: RBAC Enforcement
```typescript
// Test admin access required
it('should reject non-admin users', async () => {
  // Mock non-admin user
  const response = await fetch('/api/v1/admin/users/suspend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'user-123', reason: 'Test' }),
  });

  expect(response.status).toBe(401);
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] User suspend/reactivate endpoints functional
- [ ] Organization CRUD endpoints complete
- [ ] Audit logs endpoint returns filtered data
- [ ] Stripe webhook handler processes events
- [ ] Webhook signature verification working
- [ ] RBAC enforced on all admin routes
- [ ] Audit logging on all admin actions
- [ ] Error handling comprehensive
- [ ] Rate limiting implemented (optional)
- [ ] No console errors in webhook processing

**Quality Checks:**
- [ ] Input validation with Zod
- [ ] Proper HTTP status codes
- [ ] Detailed error messages (dev only)
- [ ] Database transactions where needed
- [ ] Idempotent webhook handlers
- [ ] Logging for debugging

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Files Created/Modified

```
✅ app/api/v1/admin/users/suspend/route.ts
✅ app/api/v1/admin/users/reactivate/route.ts
✅ app/api/v1/admin/users/[id]/route.ts
✅ app/api/v1/admin/organizations/[id]/route.ts
✅ app/api/v1/admin/audit-logs/route.ts
✅ app/api/webhooks/stripe/route.ts
✅ lib/middleware/rate-limit.ts
✅ __tests__/api/admin/*.test.ts
✅ __tests__/api/webhooks/stripe.test.ts
```

## Webhook Testing (Local Development)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.updated
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 11: Navigation & Route Integration**
2. ✅ Admin API infrastructure complete
3. ✅ Ready to integrate all routes into navigation

---

**Session 10 Complete:** ✅ Admin API routes and Stripe webhooks implemented
