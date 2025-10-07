import { ReactNode } from 'react';
import { SidebarNav, defaultNavItems } from '@/components/shared/navigation/sidebar-nav';
import { Header } from '@/components/shared/navigation/header';

/**
 * Platform Layout Component
 *
 * Reusable layout wrapper for platform pages
 * - Sidebar navigation
 * - Header with breadcrumbs and user menu
 * - Responsive content area
 *
 * Usage:
 * ```tsx
 * <PlatformLayout navItems={customNavItems}>
 *   <YourPageContent />
 * </PlatformLayout>
 * ```
 */

interface PlatformLayoutProps {
  children: ReactNode;
  navItems?: Array<{
    title: string;
    href: string;
    icon: any;
    badge?: string;
  }>;
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

export function PlatformLayout({
  children,
  navItems = defaultNavItems,
  maxWidth = 'full',
}: PlatformLayoutProps) {
  const maxWidthClass = {
    full: 'w-full',
    '7xl': 'max-w-7xl mx-auto',
    '6xl': 'max-w-6xl mx-auto',
    '5xl': 'max-w-5xl mx-auto',
  }[maxWidth];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarNav items={navItems} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with Breadcrumbs and User Menu */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className={maxWidthClass}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
