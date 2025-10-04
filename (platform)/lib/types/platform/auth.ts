/**
 * Authentication and user-related types for the platform
 * Centralized auth types for consistent use across the application
 */

import type { User, Organization, OrganizationMember } from '@prisma/client';

/**
 * User type with loaded organization member relationship
 * This type represents a user with their organization memberships eagerly loaded
 *
 * Note: This is the canonical type definition. lib/auth/user-helpers.ts should
 * re-export this type rather than defining it.
 */
export type UserWithOrganization = User & {
  organizationMembers: Array<
    OrganizationMember & {
      organization: Organization;
    }
  >;
};

/**
 * User roles within an organization
 */
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Permission actions for RBAC
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Resource types that can be protected by RBAC
 */
export type ProtectedResource =
  | 'customer'
  | 'project'
  | 'task'
  | 'organization'
  | 'user'
  | 'billing'
  | 'settings'
  | 'ai-conversation'
  | 'attachment'
  | 'notification';

/**
 * Permission check result
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Session data structure
 */
export interface SessionData {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRole;
  expiresAt: Date;
}
