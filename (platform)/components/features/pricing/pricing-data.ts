export interface PricingTier {
  name: string;
  price: { monthly: number | string; yearly: number | string };
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaLink: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: { monthly: 299, yearly: 2990 },
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      'Basic dashboard',
      'Core CRM features',
      'Email support',
      '5GB storage',
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=starter',
  },
  {
    name: 'Growth',
    price: { monthly: 699, yearly: 6990 },
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Advanced analytics',
      'All CRM features',
      'Priority support',
      '50GB storage',
      'API access',
      'Custom integrations',
    ],
    popular: true,
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=growth',
  },
  {
    name: 'Elite',
    price: { monthly: 1999, yearly: 19990 },
    description: 'For established teams with advanced needs',
    features: [
      'Up to 100 team members',
      'AI-powered insights',
      'Advanced automation',
      'Dedicated support',
      '200GB storage',
      'Advanced API access',
      'Priority integrations',
      'Custom workflows',
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/onboarding?tier=elite',
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For large organizations with custom requirements',
    features: [
      'Unlimited team members',
      'Enterprise-grade security',
      'Custom AI models',
      '24/7 phone support',
      'Unlimited storage',
      'Custom API development',
      'Dedicated success manager',
      'SLA guarantees',
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact-sales',
  },
];
