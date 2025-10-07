// components/HostDependent.tsx
// Server component that renders different homepages based on hostname
// This solves the Next.js build error where (web)/page.tsx and (platform)/page.tsx
// both try to resolve to the same / route

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HostDependent() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')[0] || '';

  // Marketing site (strivetech.ai)
  // Redirect to /about as temporary homepage until web home is restored
  if (host === 'strivetech.ai' || host === 'www.strivetech.ai') {
    redirect('/about');
  }

  // SaaS platform (app.strivetech.ai) - default
  // This covers: app.strivetech.ai, localhost, and any other domains
  // Redirect to real-estate dashboard (middleware will handle auth → login if needed)
  redirect('/real-estate/dashboard');

  // This return is never reached (redirect throws), but satisfies TypeScript
  return null;
}
