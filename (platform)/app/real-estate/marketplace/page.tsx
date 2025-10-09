import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

/**
 * Marketplace Module Root
 *
 * Redirects to the marketplace dashboard
 */

export const metadata: Metadata = {
  title: 'Tool Marketplace | Strive Tech Platform',
  description: 'Discover and purchase powerful tools to enhance your real estate business. Browse our marketplace of CRM, analytics, marketing, and automation tools.',
  keywords: ['marketplace', 'tools', 'real estate tools', 'business tools', 'CRM', 'analytics', 'marketing automation'],
  openGraph: {
    title: 'Tool Marketplace | Strive Tech Platform',
    description: 'Discover and purchase powerful tools to enhance your real estate business.',
    type: 'website',
  },
};

export default function MarketplacePage() {
  redirect('/real-estate/marketplace/dashboard');
}
