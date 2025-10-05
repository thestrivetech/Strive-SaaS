import { RequireRole } from '@/lib/auth/guards';
import { BasePlatformLayout } from './base-platform-layout';
import { defaultNavItems } from '../shared/navigation/sidebar-nav';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { hasPermissionSync } from '@/lib/auth/rbac';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export async function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Filter nav items based on user permissions
  const filteredNavItems = defaultNavItems.filter((item) => {
    // Hide admin-only items
    if (item.adminOnly) {
      return false;
    }

    // Check permission if specified
    if (item.permission) {
      return hasPermissionSync(user.role as any, item.permission);
    }

    // Items without permissions are visible to all
    return true;
  });

  return (
    <RequireRole role="USER">
      <BasePlatformLayout navItems={filteredNavItems}>
        {children}
      </BasePlatformLayout>
    </RequireRole>
  );
}
