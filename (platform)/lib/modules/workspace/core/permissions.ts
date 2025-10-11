import type { users, organization_members } from '@prisma/client';

/**
 * Transaction module permission constants
 */
export const TRANSACTION_PERMISSIONS = {
  VIEW_LOOPS: 'transactions:view_loops',
  CREATE_LOOPS: 'transactions:create_loops',
  UPDATE_LOOPS: 'transactions:update_loops',
  DELETE_LOOPS: 'transactions:delete_loops',
  MANAGE_ALL: 'transactions:manage_all', // Super Admin only

  // Listing permissions
  VIEW_LISTINGS: 'transactions:view_listings',
  CREATE_LISTINGS: 'transactions:create_listings',
  UPDATE_LISTINGS: 'transactions:update_listings',
  DELETE_LISTINGS: 'transactions:delete_listings',
  PUBLISH_LISTINGS: 'transactions:publish_listings',
} as const;

export type TransactionPermission = typeof TRANSACTION_PERMISSIONS[keyof typeof TRANSACTION_PERMISSIONS];

/**
 * User type with organization member relationship
 */
interface UserWithRole extends users {
  organization_members?: organization_members[] | null;
}

/**
 * Check if user has permission for transactions module
 *
 * Implements dual-role RBAC:
 * - Global UserRole (SUPER_ADMIN, ADMIN, MODERATOR, USER)
 * - Organization OrgRole (OWNER, ADMIN, MEMBER, VIEWER)
 *
 * @param user - User with organization memberships
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export function hasTransactionPermission(
  user: UserWithRole,
  permission: TransactionPermission
): boolean {
  // SUPER_ADMIN role has all permissions
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // USER, MODERATOR, and ADMIN can access transactions
  const allowedRoles = ['USER', 'MODERATOR', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return false;
  }

  // Get organization-level role
  const orgMember = user.organization_members?.[0];
  const orgRole = orgMember?.role;

  switch (permission) {
    case TRANSACTION_PERMISSIONS.VIEW_LOOPS:
      // All employees can view (any org role)
      return orgRole !== undefined;

    case TRANSACTION_PERMISSIONS.CREATE_LOOPS:
      // Members and above can create
      return orgRole ? ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.UPDATE_LOOPS:
      // Members and above can update
      return orgRole ? ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.DELETE_LOOPS:
      // Only owners and admins can delete
      return orgRole ? ['OWNER', 'ADMIN'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.MANAGE_ALL:
      // Platform admins or org owners (ADMIN role already returned true above)
      return orgRole === 'OWNER';

    // Listing permissions
    case TRANSACTION_PERMISSIONS.VIEW_LISTINGS:
      // All employees can view listings (any org role)
      return orgRole !== undefined;

    case TRANSACTION_PERMISSIONS.CREATE_LISTINGS:
      // Members and above can create listings
      return orgRole ? ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.UPDATE_LISTINGS:
      // Members and above can update listings
      return orgRole ? ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.DELETE_LISTINGS:
      // Only owners and admins can delete listings
      return orgRole ? ['OWNER', 'ADMIN'].includes(orgRole) : false;

    case TRANSACTION_PERMISSIONS.PUBLISH_LISTINGS:
      // Only owners and admins can publish listings
      return orgRole ? ['OWNER', 'ADMIN'].includes(orgRole) : false;

    default:
      return false;
  }
}

/**
 * Check if user can modify a specific loop
 * User must be either:
 * - The creator of the loop, OR
 * - Have DELETE_LOOPS permission (org owner/admin)
 *
 * @param user - User with organization memberships
 * @param loop - Loop object with createdBy field
 * @returns True if user can modify the loop
 */
export function canModifyLoop(
  user: UserWithRole,
  loop: { created_by: string }
): boolean {
  // Creator can always modify their own loops
  if (loop.created_by === user.id) {
    return true;
  }

  // Org admins/owners can modify any loop
  return hasTransactionPermission(user, TRANSACTION_PERMISSIONS.DELETE_LOOPS);
}

/**
 * Check if user can access Workspace module
 * Requires GROWTH tier or higher
 *
 * @param user - User with subscription tier
 * @returns True if user has required subscription tier
 */
export function canAccessWorkspaceModule(user: UserWithRole): boolean {
  // Check dual-role RBAC first
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    return false;
  }

  // Check subscription tier (GROWTH minimum)
  const allowedTiers = ['GROWTH', 'ELITE', 'ENTERPRISE'];
  return allowedTiers.includes(user.subscription_tier);
}

// Alias for backward compatibility
export const canAccessTransactionModule = canAccessWorkspaceModule;

/**
 * Throw error if user cannot access transaction module
 * Use this in Server Actions to enforce tier access
 *
 * @param user - User with subscription tier
 * @throws Error if user lacks required tier
 */
export function requireTransactionAccess(user: UserWithRole): void {
  if (!canAccessTransactionModule(user)) {
    throw new Error(
      'Access denied: Transaction Management requires GROWTH tier or higher. ' +
      'Please upgrade your subscription to access this feature.'
    );
  }
}
