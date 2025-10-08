// app/page.tsx
// Root redirect page - redirects to appropriate dashboard based on user role

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to Real Estate dashboard by default
  // Middleware will handle auth and role-based redirects
  redirect('/real-estate/dashboard');
}
