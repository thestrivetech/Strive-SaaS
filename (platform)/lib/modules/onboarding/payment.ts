'use server';

import Stripe from 'stripe';
import { prisma } from '@/lib/database/prisma';
import type { SubscriptionTier, BillingCycle } from '@prisma/client';

/**
 * Onboarding Module - Stripe Payment Integration
 *
 * Handles payment intent creation and confirmation for onboarding
 */

// ============================================================================
// Stripe Client
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// ============================================================================
// Pricing Configuration
// ============================================================================

/**
 * Tier pricing in cents (USD)
 * Amounts match the 6-tier pricing structure from platform docs
 */
const TIER_PRICES: Record<
  SubscriptionTier,
  { MONTHLY: number; YEARLY: number }
> = {
  FREE: { MONTHLY: 0, YEARLY: 0 },
  CUSTOM: { MONTHLY: 0, YEARLY: 0 }, // Pay-per-use marketplace
  STARTER: { MONTHLY: 29900, YEARLY: 299000 }, // $299/mo, $2,990/yr
  GROWTH: { MONTHLY: 69900, YEARLY: 699000 }, // $699/mo, $6,990/yr
  ELITE: { MONTHLY: 99900, YEARLY: 999000 }, // $999/mo, $9,990/yr
  ENTERPRISE: { MONTHLY: 0, YEARLY: 0 }, // Custom pricing
} as const;

// ============================================================================
// Payment Intent Creation
// ============================================================================

/**
 * Create Stripe payment intent for onboarding
 * @param tier - Selected subscription tier
 * @param billingCycle - MONTHLY or YEARLY
 * @param sessionToken - Onboarding session token
 * @returns Payment intent client secret and ID
 */
export async function createPaymentIntent(
  tier: SubscriptionTier,
  billingCycle: BillingCycle,
  sessionToken: string
) {
  // FREE and CUSTOM tiers don't require upfront payment
  if (tier === 'FREE' || tier === 'CUSTOM') {
    return null;
  }

  const amount = TIER_PRICES[tier]?.[billingCycle];

  if (!amount || amount === 0) {
    throw new Error('Invalid tier or billing cycle for payment');
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      sessionToken,
      tier,
      billingCycle,
      purpose: 'onboarding',
    },
  });

  // Update onboarding session with payment intent
  await prisma.onboarding_sessions.update({
    where: { session_token: sessionToken },
    data: {
      stripe_payment_intent_id: paymentIntent.id,
      payment_status: 'PENDING',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

// ============================================================================
// Payment Confirmation
// ============================================================================

/**
 * Confirm payment intent status
 * @param sessionToken - Onboarding session token
 * @returns True if payment succeeded
 */
export async function confirmPayment(sessionToken: string): Promise<boolean> {
  const session = await prisma.onboarding_sessions.findUnique({
    where: { session_token: sessionToken },
  });

  if (!session?.stripe_payment_intent_id) {
    throw new Error('No payment intent found for this session');
  }

  // Retrieve payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.stripe_payment_intent_id
  );

  // Update session based on payment status
  const paymentSucceeded = paymentIntent.status === 'succeeded';

  await prisma.onboarding_sessions.update({
    where: { session_token: sessionToken },
    data: {
      payment_status: paymentSucceeded ? 'SUCCEEDED' : paymentIntent.status.toUpperCase() as any,
    },
  });

  return paymentSucceeded;
}

/**
 * Get payment intent status
 * @param paymentIntentId - Stripe payment intent ID
 */
export async function getPaymentIntentStatus(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  };
}

/**
 * Calculate price for display
 * @param tier - Subscription tier
 * @param billingCycle - Billing cycle
 * @returns Price in dollars
 */
export function calculatePrice(
  tier: SubscriptionTier,
  billingCycle: BillingCycle
): number {
  const amount = TIER_PRICES[tier]?.[billingCycle] || 0;
  return amount / 100; // Convert cents to dollars
}
