/**
 * Dashboard Shell Component
 * Wrapper component for dashboard layouts
 */

import { ReactNode } from 'react';
import type { UserRole } from '@/lib/auth/constants';

export interface DashboardShellProps {
  children: ReactNode;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: UserRole;
    subscriptionTier: string;
  };
  organizationId: string;
  navigationItems: Array<{
    title: string;
    href: string;
    icon?: any;
  }>;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return <>{children}</>;
}
