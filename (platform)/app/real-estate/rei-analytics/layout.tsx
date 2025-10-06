import { ReactNode } from 'react';

/**
 * REI Analytics Module Layout
 *
 * Layout wrapper for REI Analytics module
 * Future: Add breadcrumbs, module navigation
 */
export default function REIAnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* TODO: Add breadcrumbs */}
      {/* TODO: Add module-specific navigation if needed */}
      {children}
    </div>
  );
}
