import { redirect } from 'next/navigation';

/**
 * CMS & Marketing Module Root
 *
 * Redirects to the module's main dashboard
 */
export default function CMSMarketingPage() {
  redirect('/real-estate/cms-marketing/cms-dashboard');
}
