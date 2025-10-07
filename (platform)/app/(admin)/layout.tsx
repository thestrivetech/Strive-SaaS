import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAdminPanel } from '@/lib/auth/rbac';
import { Header } from '@/components/shared/navigation/header';

/**
 * Admin Layout
 *
 * Protected layout for organization-level admin routes
 * - RBAC: Only ADMIN role (organization administrators) can access
 * - Includes header with breadcrumbs and user menu
 * - Note: SUPER_ADMIN uses /platform-admin routes instead
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // RBAC: Only ADMIN can access organization admin panel
  if (!canAccessAdminPanel(user.role)) {
    redirect('/real-estate/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with Breadcrumbs and User Menu */}
      <Header />

      {/* Admin Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
