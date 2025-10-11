import { prisma } from '@/lib/database/prisma';

/**
 * Get subscription from database
 */
export async function getSubscription(organizationId: string) {
  const subscription = await prisma.subscriptions.findUnique({
    where: { organization_id: organizationId },
    select: {
      id: true,
      tier: true,
      status: true,
      current_period_start: true,
      current_period_end: true,
      cancel_at_period_end: true,
      stripe_subscription_id: true,
      metadata: true,
    },
  });

  if (!subscription) {
    // Return default for organizations without subscription
    return {
      tier: 'STARTER' as const,
      status: 'trial' as const,
      billingCycle: 'monthly' as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      seats: 1,
      price: 0,
    };
  }

  // Map database subscription to UI format
  const tierPricing = {
    FREE: 0,
    CUSTOM: 0,
    STARTER: 299,
    GROWTH: 699,
    ELITE: 999,
    ENTERPRISE: 0,
  };

  return {
    tier: subscription.tier,
    status: subscription.status.toLowerCase() as 'active' | 'canceled' | 'past_due' | 'trial',
    billingCycle: 'monthly' as const, // TODO: Add billing_cycle to subscriptions table
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    seats: (subscription.metadata as any)?.seats || 1,
    price: tierPricing[subscription.tier as keyof typeof tierPricing] || 0,
  };
}

/**
 * Get payment methods from Stripe
 * TODO: Implement Stripe API integration
 */
export async function getPaymentMethods(organizationId: string) {
  // Query subscription to get Stripe customer ID
  const subscription = await prisma.subscriptions.findUnique({
    where: { organization_id: organizationId },
    select: { stripe_customer_id: true },
  });

  if (!subscription?.stripe_customer_id) {
    return [];
  }

  // TODO: Query Stripe API for payment methods
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const paymentMethods = await stripe.paymentMethods.list({
  //   customer: subscription.stripe_customer_id,
  //   type: 'card',
  // });

  return [];
}

/**
 * Get invoices from Stripe
 * TODO: Implement Stripe API integration
 */
export async function getInvoices(organizationId: string) {
  // Query subscription to get Stripe customer ID
  const subscription = await prisma.subscriptions.findUnique({
    where: { organization_id: organizationId },
    select: { stripe_customer_id: true },
  });

  if (!subscription?.stripe_customer_id) {
    return [];
  }

  // TODO: Query Stripe API for invoices
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const invoices = await stripe.invoices.list({
  //   customer: subscription.stripe_customer_id,
  //   limit: 10,
  // });

  return [];
}
