/**
 * Organization-Level Role-Based Access Control (Org RBAC)
 *
 * This module handles organization-specific permissions separate from global user roles.
 * Users have TWO roles:
 * 1. Global Role (UserRole) - ADMIN, MODERATOR, EMPLOYEE, CLIENT
 * 2. Organization Role (OrgRole) - OWNER, ADMIN, MEMBER, VIEWER
 *
 * Both roles are checked together to determine final permissions.
 */

import type { UserRole } from './constants';

/**
 * Organization-specific permissions
 * These apply at the organization level, not globally
 */
export type OrgPermission =
  // Member management
  | 'members:invite'
  | 'members:remove'
  | 'members:updateRole'
  // Settings & configuration
  | 'settings:edit'
  | 'settings:billing'
  | 'settings:integrations'
  // Industry features
  | 'industry:enable'
  | 'industry:disable'
  | 'industry:configure'
  // Organization management
  | 'org:delete'
  | 'org:transfer'
  // Tools & marketplace
  | 'tools:install'
  | 'tools:uninstall'
  | 'tools:configure';

/**
 * Organization roles and their permissions
 * Maps each OrgRole to its allowed permissions
 */
export const ORG_ROLE_PERMISSIONS = {
  OWNER: [
    // Full access to everything
    'members:invite',
    'members:remove',
    'members:updateRole',
    'settings:edit',
    'settings:billing',
    'settings:integrations',
    'industry:enable',
    'industry:disable',
    'industry:configure',
    'org:delete',
    'org:transfer',
    'tools:install',
    'tools:uninstall',
    'tools:configure',
  ] as OrgPermission[],

  ADMIN: [
    // Nearly full access, except ownership transfers and org deletion
    'members:invite',
    'members:remove',
    'members:updateRole',
    'settings:edit',
    'settings:integrations',
    'industry:enable',
    'industry:disable',
    'industry:configure',
    'tools:install',
    'tools:uninstall',
    'tools:configure',
    // Cannot: settings:billing, org:delete, org:transfer
  ] as OrgPermission[],

  MEMBER: [
    // Limited permissions - can invite and use tools
    'members:invite',
    'tools:configure',
  ] as OrgPermission[],

  VIEWER: [
    // Read-only - no org-level permissions
  ] as OrgPermission[],
} as const;

/**
 * Organization role type from Prisma schema
 */
export type OrgRole = keyof typeof ORG_ROLE_PERMISSIONS;

/**
 * Check if a user has a specific organization permission
 *
 * This function implements dual-role checking:
 * 1. Global ADMINs bypass all org-level checks (super admins)
 * 2. Otherwise, check the user's organization role permissions
 *
 * @param userRole - Global user role (ADMIN, EMPLOYEE, etc.)
 * @param orgRole - Organization-specific role (OWNER, ADMIN, MEMBER, VIEWER)
 * @param permission - The org permission to check
 * @returns true if user has permission, false otherwise
 *
 * @example
 * ```typescript
 * const canInvite = hasOrgPermission('EMPLOYEE', 'ADMIN', 'members:invite');
 * // Returns: true (org ADMIN can invite)
 *
 * const canBill = hasOrgPermission('EMPLOYEE', 'MEMBER', 'settings:billing');
 * // Returns: false (org MEMBER cannot access billing)
 *
 * const canDelete = hasOrgPermission('ADMIN', 'VIEWER', 'org:delete');
 * // Returns: true (global ADMIN bypasses org role)
 * ```
 */
export function hasOrgPermission(
  userRole: UserRole,
  orgRole: OrgRole,
  permission: OrgPermission
): boolean {
  // Global admins bypass all organization-level permissions
  if (userRole === 'ADMIN') {
    return true;
  }

  // Get permissions for this organization role
  const orgPermissions = ORG_ROLE_PERMISSIONS[orgRole];

  if (!orgPermissions) {
    return false;
  }

  // Check if permission exists in org role's permission list
  return orgPermissions.includes(permission);
}

/**
 * Require org permission or throw error
 *
 * @param userRole - Global user role
 * @param orgRole - Organization role
 * @param permission - Required permission
 * @throws Error if permission not granted
 *
 * @example
 * ```typescript
 * requireOrgPermission('EMPLOYEE', 'MEMBER', 'settings:billing');
 * // Throws: "Forbidden: Missing organization permission settings:billing"
 * ```
 */
export function requireOrgPermission(
  userRole: UserRole,
  orgRole: OrgRole,
  permission: OrgPermission
): void {
  if (!hasOrgPermission(userRole, orgRole, permission)) {
    throw new Error(
      `Forbidden: Missing organization permission ${permission}`
    );
  }
}

/**
 * Check if user can manage organization members
 */
export function canManageMembers(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'members:remove');
}

/**
 * Check if user can invite members
 */
export function canInviteMembers(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'members:invite');
}

/**
 * Check if user can manage billing
 */
export function canManageBilling(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'settings:billing');
}

/**
 * Check if user can manage organization settings
 */
export function canManageOrgSettings(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'settings:edit');
}

/**
 * Check if user can delete the organization
 */
export function canDeleteOrganization(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'org:delete');
}

/**
 * Check if user can install tools
 */
export function canInstallTools(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'tools:install');
}

/**
 * Check if user can enable/disable industries
 */
export function canManageIndustries(userRole: UserRole, orgRole: OrgRole): boolean {
  return hasOrgPermission(userRole, orgRole, 'industry:enable');
}

/**
 * Get all permissions for an organization role
 */
export function getOrgRolePermissions(orgRole: OrgRole): readonly OrgPermission[] {
  return ORG_ROLE_PERMISSIONS[orgRole] || [];
}

/**
 * Check if user is organization owner
 */
export function isOrgOwner(orgRole: OrgRole): boolean {
  return orgRole === 'OWNER';
}

/**
 * Check if user is organization admin (includes OWNER)
 */
export function isOrgAdmin(orgRole: OrgRole): boolean {
  return orgRole === 'OWNER' || orgRole === 'ADMIN';
}
