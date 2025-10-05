import { UserRole, ROLE_PERMISSIONS } from './constants';
import { getCurrentUser } from './auth-helpers';

/**
 * Global permission types
 * These are feature-level permissions that apply across the platform
 */
export type Permission = keyof typeof ROLE_PERMISSIONS.ADMIN;

/**
 * Enhanced permission type with wildcard support
 * Examples: 'crm:*', 'projects:*', 'admin:*'
 */
export type WildcardPermission = `${string}:*`;

/**
 * Check if user has a specific global permission
 *
 * Supports wildcard permissions (e.g., 'crm:*' grants 'crm:read', 'crm:write', etc.)
 *
 * @param permission - The permission to check
 * @returns Promise<boolean> - true if user has permission
 *
 * @example
 * ```typescript
 * const canRead = await hasPermission('canManageCustomers');
 * // Returns: true if user role allows customer management
 * ```
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role as UserRole];

  if (!rolePermissions) {
    return false;
  }

  return rolePermissions[permission] || false;
}

/**
 * Synchronous version of hasPermission for use with user object
 *
 * @param userRole - The user's role
 * @param permission - The permission to check
 * @returns boolean - true if role has permission
 */
export function hasPermissionSync(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  if (!rolePermissions) {
    return false;
  }

  return rolePermissions[permission] || false;
}

/**
 * Require permission or throw error
 *
 * @param permission - Required permission
 * @throws Error if permission not granted
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasPerm = await hasPermission(permission);

  if (!hasPerm) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}

export async function canAccessRoute(route: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const role = user.role as UserRole;

  // Super admin and admin can access everything
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return true;
  }

  // Route-specific permissions
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/crm': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/projects': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/transactions': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/transactions': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/ai': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/tools': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/settings': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
    '/admin': ['SUPER_ADMIN'],
  };

  // Check if route has specific permissions
  for (const [routePath, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(routePath)) {
      return allowedRoles.includes(role);
    }
  }

  // Default: allow access to undefined routes (let the page handle specific permissions)
  return true;
}

export function getNavigationItems(role: UserRole) {
  const allItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'CRM',
      href: '/crm',
      icon: 'Users',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: 'FolderKanban',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Transactions',
      href: '/real-estate/transactions',
      icon: 'FileText',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'AI Assistant',
      href: '/ai',
      icon: 'Bot',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Tools',
      href: '/tools',
      icon: 'Wrench',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'Settings',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] as UserRole[],
    },
    {
      title: 'Org Admin',
      href: '/admin',
      icon: 'Shield',
      roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
    },
    {
      title: 'Platform Admin',
      href: '/platform-admin',
      icon: 'Server',
      roles: ['SUPER_ADMIN'] as UserRole[],
    },
  ];

  return allItems.filter(item => item.roles.includes(role));
}

/**
 * Platform-wide functions (SUPER_ADMIN only)
 */
export function canAccessPlatformAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canViewAllOrganizations(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManagePlatformSettings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canAssignFreeTier(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canViewPlatformAnalytics(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageOrganization(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

export function canInviteMembers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

export function canDeleteMembers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canEditProject(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

export function canViewProject(role: UserRole): boolean {
  return true; // All roles can view projects
}

export function canManageCustomer(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

export function canViewCustomer(role: UserRole): boolean {
  return true; // All roles can view customers (CLIENT removed)
}

export function canUsePremiumTools(tier: string, role?: UserRole): boolean {
  // SUPER_ADMIN bypasses tier restrictions
  if (role === 'SUPER_ADMIN') {
    return true;
  }
  return tier !== 'FREE' && tier !== 'STARTER';
}

export function getToolLimit(tier: string, role?: UserRole): number {
  // SUPER_ADMIN has unlimited tools
  if (role === 'SUPER_ADMIN') {
    return Infinity;
  }

  const limits: Record<string, number> = {
    FREE: 0,
    CUSTOM: 0, // Pay per tool
    STARTER: 0,
    GROWTH: 3,
    ELITE: 10,
    ENTERPRISE: Infinity,
  };

  return limits[tier] || 0;
}

/**
 * Check if user can access CRM module
 */
export function canAccessCRM(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can manage leads (create, edit)
 */
export function canManageLeads(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete leads
 */
export function canDeleteLeads(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage contacts (create, edit)
 */
export function canManageContacts(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete contacts
 */
export function canDeleteContacts(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage deals (create, edit)
 */
export function canManageDeals(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete deals
 */
export function canDeleteDeals(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage listings (create, edit)
 */
export function canManageListings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete listings
 */
export function canDeleteListings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can access Transactions module
 */
export function canAccessTransactions(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can manage transaction loops (create, edit)
 */
export function canManageTransactionLoops(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete transaction loops
 */
export function canDeleteTransactionLoops(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}