import { RequireRole } from '@/lib/auth/guards';
import { BasePlatformLayout } from './base-platform-layout';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { LayoutDashboard, FileText, MessageSquare } from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export async function ClientLayout({ children }: ClientLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Simplified nav items for clients
  const clientNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'My Projects',
      href: '/projects',
      icon: FileText,
    },
    {
      title: 'Support',
      href: '/support',
      icon: MessageSquare,
    },
  ];

  return (
    <RequireRole role="USER">
      <BasePlatformLayout navItems={clientNavItems}>
        {children}
      </BasePlatformLayout>
    </RequireRole>
  );
}
