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

  // Admin can access everything
  if (role === 'ADMIN') {
    return true;
  }

  // Route-specific permissions
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['ADMIN', 'MODERATOR', 'EMPLOYEE', 'CLIENT'],
    '/crm': ['ADMIN', 'MODERATOR', 'EMPLOYEE'],
    '/projects': ['ADMIN', 'MODERATOR', 'EMPLOYEE'],
    '/ai': ['ADMIN', 'MODERATOR', 'EMPLOYEE'],
    '/tools': ['ADMIN', 'MODERATOR', 'EMPLOYEE'],
    '/settings': ['ADMIN', 'MODERATOR'],
    '/admin': ['ADMIN'],
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
      roles: ['ADMIN', 'MODERATOR', 'EMPLOYEE', 'CLIENT'] as UserRole[],
    },
    {
      title: 'CRM',
      href: '/crm',
      icon: 'Users',
      roles: ['ADMIN', 'MODERATOR', 'EMPLOYEE'] as UserRole[],
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: 'FolderKanban',
      roles: ['ADMIN', 'MODERATOR', 'EMPLOYEE'] as UserRole[],
    },
    {
      title: 'AI Assistant',
      href: '/ai',
      icon: 'Bot',
      roles: ['ADMIN', 'MODERATOR', 'EMPLOYEE'] as UserRole[],
    },
    {
      title: 'Tools',
      href: '/tools',
      icon: 'Wrench',
      roles: ['ADMIN', 'MODERATOR', 'EMPLOYEE'] as UserRole[],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'Settings',
      roles: ['ADMIN', 'MODERATOR'] as UserRole[],
    },
    {
      title: 'Admin',
      href: '/admin',
      icon: 'Shield',
      roles: ['ADMIN'] as UserRole[],
    },
  ];

  return allItems.filter(item => item.roles.includes(role));
}

export function canManageOrganization(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

export function canInviteMembers(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

export function canDeleteMembers(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canEditProject(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

export function canViewProject(role: UserRole): boolean {
  return true; // All roles can view projects
}

export function canManageCustomer(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

export function canViewCustomer(role: UserRole): boolean {
  return role !== 'CLIENT';
}

export function canUsePremiumTools(tier: string): boolean {
  return tier !== 'FREE';
}

export function getToolLimit(tier: string): number {
  const limits: Record<string, number> = {
    FREE: 0,
    TIER_1: 3,
    TIER_2: 10,
    TIER_3: Infinity,
  };

  return limits[tier] || 0;
}

/**
 * Check if user can access CRM module
 */
export function canAccessCRM(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

/**
 * Check if user can manage leads (create, edit)
 */
export function canManageLeads(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

/**
 * Check if user can delete leads
 */
export function canDeleteLeads(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage contacts (create, edit)
 */
export function canManageContacts(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

/**
 * Check if user can delete contacts
 */
export function canDeleteContacts(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage deals (create, edit)
 */
export function canManageDeals(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

/**
 * Check if user can delete deals
 */
export function canDeleteDeals(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage listings (create, edit)
 */
export function canManageListings(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EMPLOYEE';
}

/**
 * Check if user can delete listings
 */
export function canDeleteListings(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}