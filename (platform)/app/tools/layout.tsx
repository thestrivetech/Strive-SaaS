import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getNavigationItems, canAccessRoute } from '@/lib/auth/rbac';
import { UserRole } from '@/lib/auth/constants';
import DashboardShell from '@/components/(platform)/layouts/dashboard-shell';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication
  const session = await requireAuth();

  // Get current user with organization data
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's organization
  const userOrg = user.organization_members[0];
  if (!userOrg) {
    redirect('/onboarding/organization');
  }

  // Check if user can access tools
  const canAccess = await canAccessRoute('/tools');
  if (!canAccess) {
    redirect('/dashboard');
  }

  // Get navigation items based on user role
  const navigationItems = getNavigationItems(user.role as UserRole);

  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        avatarUrl: user.avatar_url,
        role: user.role as UserRole,
        subscriptionTier: user.subscription_tier || 'FREE',
      }}
      organizationId={userOrg.organization_id}
      navigationItems={navigationItems}
    >
      {children}
    </DashboardShell>
  );
}