import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessPlatformAdmin } from '@/lib/auth/rbac';
import { Header } from '@/components/shared/navigation/header';

/**
 * Platform Admin Layout
 *
 * Protected layout for SUPER_ADMIN users only
 * - RBAC: Only SUPER_ADMIN role can access
 * - Platform-wide administration and monitoring
 * - Includes header with breadcrumbs and user menu
 *
 * Note: Only 2 SUPER_ADMIN accounts should exist
 * Access: Available ONLY through user profile dropdown
 */
export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // RBAC: Only SUPER_ADMIN can access platform admin
  if (!canAccessPlatformAdmin(user.role)) {
    redirect('/real-estate/user-dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with Breadcrumbs and User Menu */}
      <Header />

      {/* Platform Admin Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">Platform Administration</h1>
            <p className="text-sm text-muted-foreground mt-1">
              SUPER_ADMIN access - Platform-wide monitoring and management
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
