import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/database/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook signature missing');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

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
    console.log(`Processing Stripe event: ${event.type}`);

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
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const sessionToken = paymentIntent.metadata.sessionToken;

  if (sessionToken) {
    try {
      // Update onboarding session
      await prisma.onboarding_sessions.update({
        where: { session_token: sessionToken },
        data: {
          payment_status: 'SUCCEEDED',
          stripe_payment_intent_id: paymentIntent.id,
        },
      });

      console.log(`Payment succeeded for session: ${sessionToken}`);
    } catch (error: any) {
      console.error('Failed to update onboarding session:', error);
    }
  } else {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const sessionToken = paymentIntent.metadata.sessionToken;

  if (sessionToken) {
    try {
      await prisma.onboarding_sessions.update({
        where: { session_token: sessionToken },
        data: {
          payment_status: 'FAILED',
        },
      });

      console.log(`Payment failed for session: ${sessionToken}`);
    } catch (error: any) {
      console.error('Failed to update onboarding session:', error);
    }
  } else {
    console.log(`Payment failed: ${paymentIntent.id}`);
  }
}

/**
 * Handle subscription create/update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find organization by Stripe customer ID
    const org = await prisma.organizations.findFirst({
      where: {
        subscriptions: {
          stripe_customer_id: customerId,
        },
      },
    });

    if (!org) {
      console.warn(`Organization not found for Stripe customer: ${customerId}`);
      return;
    }

    // Determine subscription tier from metadata
    const tier = (subscription.metadata.tier || 'STARTER') as any;

    // Extract period dates - access directly from subscription object
    const periodStart = (subscription as any).current_period_start as number;
    const periodEnd = (subscription as any).current_period_end as number;

    // Upsert subscription
    await prisma.subscriptions.upsert({
      where: { organization_id: org.id },
      update: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        current_period_start: new Date(periodStart * 1000),
        current_period_end: new Date(periodEnd * 1000),
        updated_at: new Date(),
      },
      create: {
        organization_id: org.id,
        tier,
        status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        current_period_start: new Date(periodStart * 1000),
        current_period_end: new Date(periodEnd * 1000),
      },
    });

    console.log(`Subscription updated for organization: ${org.name}`);
  } catch (error: any) {
    console.error('Failed to update subscription:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const org = await prisma.organizations.findFirst({
      where: {
        subscriptions: {
          stripe_customer_id: customerId,
        },
      },
    });

    if (!org) {
      console.warn(`Organization not found for Stripe customer: ${customerId}`);
      return;
    }

    await prisma.subscriptions.update({
      where: { organization_id: org.id },
      data: {
        status: 'CANCELLED',
        cancel_at_period_end: true,
      },
    });

    console.log(`Subscription cancelled for organization: ${org.name}`);
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
  }
}
