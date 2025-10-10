/**
 * Onboarding Payment Module
 * Handles payment calculations and processing during onboarding
 */

/**
 * Calculate price based on subscription tier and seat count
 * @param tier - Subscription tier
 * @param seats - Number of seats
 * @returns Total price per month
 */
export function calculatePrice(tier: string, seats: number): number {
  const prices: Record<string, number> = {
    FREE: 0,
    CUSTOM: 0, // Pay-per-use, calculated separately
    STARTER: 299,
    GROWTH: 699,
    ELITE: 999,
    ENTERPRISE: 0, // Custom pricing
  };

  const basePrice = prices[tier] || 0;
  return basePrice * seats;
}

/**
 * Calculate annual price with discount
 * @param tier - Subscription tier
 * @param seats - Number of seats
 * @param discountPercent - Discount percentage (default 20%)
 * @returns Annual price
 */
export function calculateAnnualPrice(
  tier: string,
  seats: number,
  discountPercent: number = 20
): number {
  const monthlyPrice = calculatePrice(tier, seats);
  const annualPrice = monthlyPrice * 12;
  const discount = annualPrice * (discountPercent / 100);
  return annualPrice - discount;
}

/**
 * Get pricing details for a tier
 * @param tier - Subscription tier
 * @returns Pricing details
 */
export function getPricingDetails(tier: string): {
  name: string;
  basePrice: number;
  features: string[];
  recommended?: boolean;
} {
  const pricing = {
    FREE: {
      name: 'Free',
      basePrice: 0,
      features: ['Dashboard access', 'Profile management', 'Limited features'],
    },
    CUSTOM: {
      name: 'Custom',
      basePrice: 0,
      features: ['Pay-per-use', 'Marketplace access', 'Flexible pricing'],
    },
    STARTER: {
      name: 'Starter',
      basePrice: 299,
      features: ['CRM', 'Transactions', 'CMS', 'Email support'],
    },
    GROWTH: {
      name: 'Growth',
      basePrice: 699,
      features: ['Everything in Starter', 'AI Tools', 'Analytics', 'Priority support'],
      recommended: true,
    },
    ELITE: {
      name: 'Elite',
      basePrice: 999,
      features: ['Everything in Growth', 'All tools', 'Custom integrations', 'Dedicated support'],
    },
    ENTERPRISE: {
      name: 'Enterprise',
      basePrice: 0,
      features: ['Unlimited everything', 'Custom SLA', 'Dedicated account manager', 'Custom pricing'],
    },
  };

  return pricing[tier as keyof typeof pricing] || pricing.FREE;
}
