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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Permission } from '@/lib/auth/rbac';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  adminOnly?: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
}

export const defaultNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: Users,
    permission: 'canManageCustomers',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    permission: 'canManageProjects',
  },
  {
    title: 'Transactions',
    href: '/real-estate/transactions',
    icon: FileText,
    permission: 'canManageCustomers',
  },
  {
    title: 'AI Assistant',
    href: '/ai',
    icon: Bot,
    permission: 'canManageAI',
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
    permission: 'canManageAI',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'canManageSettings',
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    adminOnly: true,
  },
];

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
