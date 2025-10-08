import { ReactNode } from 'react';

/**
 * CMS & Marketing Module Layout
 *
 * Wraps all CMS & Marketing module pages with consistent layout
 * Includes accessibility features (skip links, semantic HTML)
 */
export default function CMSMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Real Estate</span>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-foreground">CMS & Marketing</span>
      </nav>

      {/* Module Content */}
      <main id="main-content" className="focus:outline-none" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
