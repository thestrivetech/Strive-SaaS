'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  'reid': 'REID Dashboard',
  'dashboard': 'Overview',
  'heatmap': 'Market Heatmap',
  'demographics': 'Demographics',
  'schools': 'School Districts',
  'trends': 'Market Trends',
  'roi': 'ROI Simulator',
  'ai-profiles': 'AI Market Profiles',
  'alerts': 'Market Alerts',
  'reports': 'Market Reports',
};

export function REIDBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb path
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    return { path, label, segment };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        href="/real-estate/user-dashboard"
        className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isREID = crumb.segment === 'reid' || crumb.segment === 'dashboard';

        // Skip 'real-estate' in breadcrumb display
        if (crumb.segment === 'real-estate') return null;

        return (
          <div key={crumb.path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {isLast ? (
              <span className="text-cyan-400 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.path}
                className={cn(
                  'hover:text-cyan-400 transition-colors',
                  isREID ? 'text-slate-300' : 'text-slate-400'
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
