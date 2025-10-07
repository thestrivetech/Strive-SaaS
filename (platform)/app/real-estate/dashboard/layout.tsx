import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard Layout
 *
 * Enforces authentication and organization membership for dashboard access
 * All dashboard routes are protected through this layout
 *
 * @protected - Requires valid session and organization membership
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Enforce authentication
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure user has organization membership
  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
