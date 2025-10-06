import { HeroSection } from '@/components/features/landing/hero-section';
import { FeaturesSection } from '@/components/features/landing/features-section';
import { CTASection } from '@/components/features/landing/cta-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strive - Build Better Products, Faster',
  description:
    'The enterprise SaaS platform that empowers teams to ship products 10x faster with powerful tools and seamless workflows.',
  keywords: [
    'SaaS platform',
    'enterprise software',
    'team collaboration',
    'project management',
    'AI-powered tools',
  ],
  openGraph: {
    title: 'Strive - Build Better Products, Faster',
    description:
      'The enterprise SaaS platform that empowers teams to ship products 10x faster with powerful tools and seamless workflows.',
    type: 'website',
    url: 'https://app.strivetech.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive - Build Better Products, Faster',
    description:
      'The enterprise SaaS platform that empowers teams to ship products 10x faster with powerful tools and seamless workflows.',
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
