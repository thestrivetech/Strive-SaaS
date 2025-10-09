import { redirect } from 'next/navigation';

/**
 * AI Hub Root Page
 *
 * Redirects to the AI Hub dashboard
 */
export default function AIHubPage() {
  redirect('/real-estate/ai-hub/ai-hub-dashboard');
}
