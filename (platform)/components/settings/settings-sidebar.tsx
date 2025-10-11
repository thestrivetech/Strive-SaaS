'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  User,
  Building,
  Users,
  CreditCard,
  Bell,
  Shield,
  Link2,
} from 'lucide-react';

interface SettingsSidebarProps {
  user: {
    name: string | null;
    email: string;
  };
}

const navigationItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Organization',
    href: '/settings/organization',
    icon: Building,
  },
  {
    title: 'Team',
    href: '/settings/team',
    icon: Users,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Connections',
    href: '/settings/connections',
    icon: Link2,
  },
];

export function SettingsSidebar({ user }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 border-r bg-muted/10 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            {user.name || user.email}
          </p>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
