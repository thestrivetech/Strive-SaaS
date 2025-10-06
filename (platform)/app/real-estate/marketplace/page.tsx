import { redirect } from 'next/navigation';

/**
 * Marketplace Root Page
 * Redirects to marketplace dashboard
 */
export default function MarketplacePage() {
  redirect('/real-estate/marketplace/dashboard');
}
