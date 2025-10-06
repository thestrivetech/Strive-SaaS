import { redirect } from 'next/navigation';

/**
 * REI Analytics Module Root
 *
 * Redirects to main dashboard page
 */
export default function REIAnalyticsPage() {
  redirect('/real-estate/rei-analytics/dashboard');
}
