'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Plus, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  icon: any;
  label: string;
  href: string;
}

/**
 * MobileBottomNav Component
 *
 * Fixed bottom navigation for mobile devices
 * Only visible on screens smaller than lg breakpoint
 *
 * Features:
 * - Touch-friendly sizing
 * - Active state highlighting
 * - Glass morphism with backdrop blur
 * - Fixed positioning at bottom
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      href: '/real-estate/dashboard',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      href: '/real-estate/rei-analytics/dashboard',
    },
    {
      id: 'add',
      icon: Plus,
      label: 'Add',
      href: '#',
    },
    {
      id: 'alerts',
      icon: Bell,
      label: 'Alerts',
      href: '#',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      href: '/settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border p-4 lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          const content = (
            <Button
              variant="ghost"
              className={cn(
                'flex flex-col items-center gap-1 p-2 h-auto hover:bg-muted/30',
                active && 'text-primary'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  active ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Button>
          );

          if (item.href === '#') {
            return (
              <div key={item.id} className="flex-1 flex justify-center">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.id} href={item.href} className="flex-1 flex justify-center">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
