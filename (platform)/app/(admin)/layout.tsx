import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAdminPanel } from '@/lib/auth/rbac';
import { Header } from '@/components/shared/navigation/header';

/**
 * Organization Admin Layout
 *
 * Protected layout for organization-level admin routes
 * - RBAC: ADMIN and SUPER_ADMIN can access
 * - Manage organization settings, members, and features
 * - Includes header with breadcrumbs and user menu
 * - Note: SUPER_ADMIN also has access to /platform-admin for platform-wide management
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // RBAC: ADMIN and SUPER_ADMIN can access organization admin panel
  if (!canAccessAdminPanel(user.role)) {
    redirect('/real-estate/user-dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with Breadcrumbs and User Menu */}
      <Header />

      {/* Organization Admin Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Organization Administration</h1>
            <p className="text-sm text-muted-foreground">Manage your organization settings and members</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
