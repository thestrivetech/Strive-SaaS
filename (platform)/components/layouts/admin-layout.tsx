import { RequireRole } from '@/lib/auth/guards';
import { BasePlatformLayout } from './base-platform-layout';
import { defaultNavItems } from '../shared/navigation/sidebar-nav';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { hasPermissionSync } from '@/lib/auth/rbac';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Filter nav items based on admin permissions
  const filteredNavItems = defaultNavItems.filter((item) => {
    // Admin can see all items
    if (user.role === 'ADMIN') {
      return true;
    }

    // Shouldn't reach here, but safety check
    if (item.adminOnly) {
      return false;
    }

    if (item.permission) {
      return hasPermissionSync(user.role as any, item.permission);
    }

    return true;
  });

  return (
    <RequireRole role="ADMIN">
      <BasePlatformLayout navItems={filteredNavItems}>
        {children}
      </BasePlatformLayout>
    </RequireRole>
  );
}
