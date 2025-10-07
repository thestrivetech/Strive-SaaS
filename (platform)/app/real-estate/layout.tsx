import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { SidebarNav, defaultNavItems } from '@/components/shared/navigation/sidebar-nav';
import { Header } from '@/components/shared/navigation/header';
import { getNavigationItems } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/constants';
import * as LucideIcons from 'lucide-react';

/**
 * Real Estate Industry Layout
 *
 * Provides consistent navigation and layout for all real estate routes
 * - Sidebar navigation with role-based filtering
 * - Header with breadcrumbs and user menu
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

  // ⚠️ TEMPORARY: Use mock navigation for localhost showcase
  if (!user && isLocalhost) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation - Mock for localhost */}
        <SidebarNav items={defaultNavItems} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header with Breadcrumbs and User Menu */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Type guard: at this point user must exist (or we would have redirected/returned)
  if (!user) {
    redirect('/login');
  }

  // Get role-based navigation items
  const navItems = getNavigationItems(user.role as UserRole);

  // Map RBAC navigation items to SidebarNav format
  // Convert icon string names to actual Lucide components
  const sidebarItems = navItems.map((item) => {
    // Get the icon component from Lucide by name
    const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;

    return {
      title: item.title,
      href: item.href,
      icon: IconComponent,
      badge: item.badge,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarNav items={sidebarItems.length > 0 ? sidebarItems : defaultNavItems} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with Breadcrumbs and User Menu */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
