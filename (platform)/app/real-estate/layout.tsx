import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { DashboardContent } from '@/components/shared/dashboard/DashboardContent';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

/**
 * Real Estate Industry Layout
 *
 * Provides consistent glass morphism design across all real estate routes
 * - Glass morphism sidebar with neon accents
 * - TopBar with search, notifications, and user menu
 * - Particle background effect
 * - Command bar (Cmd+K)
 * - Mobile bottom navigation
 * - Auth protection (redirects to login if not authenticated)
 */
export default async function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ TEMPORARY: Skip auth layout logic on localhost for presentation
  // The middleware already bypasses auth, so we need to handle the case where user is null
  const isLocalhost = typeof window === 'undefined' &&
    (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

  // Auth check
  const user = await getCurrentUser();

  if (!user && !isLocalhost) {
    redirect('/login');
  }

  // Mock user for localhost showcase
  let displayUser: UserWithOrganization;
  let organizationId: string;

  if (!user && isLocalhost) {
    // Mock user for localhost
    displayUser = {
      id: 'demo-user',
      clerk_user_id: null,
      email: 'demo@strivetech.ai',
      name: 'Demo User',
      avatar_url: null,
      role: 'USER' as const,
      subscription_tier: 'ELITE' as const,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      organization_members: [],
    };
    organizationId = 'demo-org';
  } else {
    // Type guard: at this point user must exist (or we would have redirected)
    if (!user) {
      redirect('/login');
    }

    displayUser = user;
    organizationId = user.organization_members[0]?.organization_id;

    if (!organizationId) {
      redirect('/onboarding/organization');
    }
  }

  return (
    <DashboardContent user={displayUser} organizationId={organizationId}>
      {children}
    </DashboardContent>
  );
}
