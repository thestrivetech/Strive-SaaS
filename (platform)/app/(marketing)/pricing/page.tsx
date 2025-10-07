import { PricingTiers } from '@/components/features/pricing/pricing-tiers';
import { PricingFAQ } from '@/components/features/pricing/pricing-faq';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Strive',
  description:
    'Simple, transparent pricing. Choose the plan that fits your needs. No hidden fees.',
  keywords: [
    'pricing',
    'plans',
    'subscription',
    'SaaS pricing',
    'team pricing',
    'enterprise pricing',
  ],
  openGraph: {
    title: 'Pricing - Strive',
    description:
      'Simple, transparent pricing. Choose the plan that fits your needs. No hidden fees.',
    type: 'website',
    url: 'https://app.strivetech.ai/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Strive',
    description:
      'Simple, transparent pricing. Choose the plan that fits your needs. No hidden fees.',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <PricingTiers />

      {/* FAQ Section */}
      <PricingFAQ />
    </div>
  );
}
