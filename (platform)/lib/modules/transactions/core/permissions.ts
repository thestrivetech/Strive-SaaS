import type { users, organization_members } from '@prisma/client';

/**
 * Transaction module permission constants
 */
export const TRANSACTION_PERMISSIONS = {
  VIEW_LOOPS: 'transactions:view_loops',
  CREATE_LOOPS: 'transactions:create_loops',
  UPDATE_LOOPS: 'transactions:update_loops',
  DELETE_LOOPS: 'transactions:delete_loops',
  MANAGE_ALL: 'transactions:manage_all', // Admin only
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
 * - Global UserRole (ADMIN, EMPLOYEE, etc.)
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
  // ADMIN role has all permissions
  if (user.role === 'ADMIN') {
    return true;
  }

  // Only EMPLOYEE can access transactions (ADMIN already handled above)
  if (user.role !== 'EMPLOYEE') {
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
