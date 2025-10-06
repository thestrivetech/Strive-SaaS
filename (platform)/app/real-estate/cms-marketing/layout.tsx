import { ReactNode } from 'react';

/**
 * CMS & Marketing Module Layout
 *
 * Wraps all CMS & Marketing module pages with consistent layout
 */
export default function CMSMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Real Estate</span>
        <span>/</span>
        <span className="font-medium text-foreground">CMS & Marketing</span>
      </div>

      {/* Module Content */}
      {children}
    </div>
  );
}
