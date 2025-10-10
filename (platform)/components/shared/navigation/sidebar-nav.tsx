'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Bot,
  Wrench,
  Shield,
  Settings,
  BarChart,
  Calculator,
  Megaphone,
  ShoppingBag,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Permission } from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  adminOnly?: boolean;
  badge?: string;
}

interface SidebarNavProps {
  items: NavItem[];
}

export const defaultNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/real-estate/user-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'CRM',
    href: '/real-estate/crm/dashboard',
    icon: Users,
    permission: 'canManageCustomers',
  },
  {
    title: 'Workspace',
    href: '/real-estate/workspace/dashboard',
    icon: FileText,
    permission: 'canManageCustomers',
  },
  {
    title: 'AI Hub',
    href: '/real-estate/ai-hub/dashboard',
    icon: Bot,
    permission: 'canManageAI',
    badge: 'Coming Soon',
  },
  {
    title: 'REID Dashboard',
    href: '/real-estate/reid/dashboard',
    icon: TrendingUp,
    permission: 'canManageCustomers',
    badge: 'ELITE',
  },
  {
    title: 'Analytics',
    href: '/real-estate/rei-analytics/dashboard',
    icon: BarChart,
    permission: 'canManageCustomers',
    badge: 'Coming Soon',
  },
  {
    title: 'Expense & Tax',
    href: '/real-estate/expense-tax/dashboard',
    icon: Calculator,
    permission: 'canManageCustomers',
    badge: 'Coming Soon',
  },
  {
    title: 'ContentPilot-CMS',
    href: '/real-estate/cms-marketing/dashboard',
    icon: FileText,
    permission: 'canManageCustomers',
  },
  {
    title: 'Marketplace',
    href: '/real-estate/marketplace/dashboard',
    icon: ShoppingBag,
    permission: 'canManageAI',
    badge: 'Coming Soon',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'canManageSettings',
  },
];

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/real-estate/user-dashboard" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span>Strive Tech</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.title}
              </div>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
