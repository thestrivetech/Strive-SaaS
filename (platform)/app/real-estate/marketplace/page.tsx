import { redirect } from 'next/navigation';

/**
 * Marketplace Module Root
 *
 * Redirects to the marketplace dashboard
 */
export default function MarketplacePage() {
  redirect('/real-estate/marketplace/dashboard');
}
