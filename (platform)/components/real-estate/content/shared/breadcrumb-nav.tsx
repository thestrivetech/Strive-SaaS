'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Navigation Component
 *
 * Automatically generates breadcrumb trail from current pathname
 * Client component to access usePathname hook
 */
export function BreadcrumbNav() {
  const pathname = usePathname();

  // Parse pathname into breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbs: Array<{ label: string; href: string; current: boolean }> = [];

  // Always start with home/dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/real-estate/dashboard',
    current: false,
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isCurrent = index === segments.length - 1;

    // Format segment label (remove dashes, capitalize)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      href: currentPath,
      current: isCurrent,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/real-estate/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.slice(1).map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.current ? (
            <span className="font-medium text-foreground">{breadcrumb.label}</span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
