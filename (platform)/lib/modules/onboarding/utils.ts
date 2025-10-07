import type { SubscriptionTier, BillingCycle } from '@prisma/client';

/**
 * Onboarding Module - Pricing Utilities
 *
 * Pure utility functions for pricing calculations (no server-only code)
 */

// ============================================================================
// Pricing Configuration
// ============================================================================

/**
 * Tier pricing in cents (USD)
 * Amounts match the 6-tier pricing structure from platform docs
 */
export const TIER_PRICES: Record<
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
// Price Calculation Utilities
// ============================================================================

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

/**
 * Calculate price in cents (for Stripe)
 * @param tier - Subscription tier
 * @param billingCycle - Billing cycle
 * @returns Price in cents
 */
export function calculatePriceCents(
  tier: SubscriptionTier,
  billingCycle: BillingCycle
): number {
  return TIER_PRICES[tier]?.[billingCycle] || 0;
}
