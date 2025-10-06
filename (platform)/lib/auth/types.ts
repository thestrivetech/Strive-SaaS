import type { users, organization_members, organizations, subscriptions } from '@prisma/client';
import type { UserRole, OrgRole } from './constants';

/**
 * User with organization relationship loaded
 * This is the base type returned from getCurrentUser()
 */
export type UserWithOrganization = users & {
  organization_members: Array<
    organization_members & {
      organizations: organizations & {
        subscriptions: subscriptions | null;
      };
    }
  >;
};

/**
 * Enhanced user type with convenient property accessors
 * This provides camelCase getters for commonly accessed properties
 *
 * Used throughout the application to avoid type errors when accessing
 * user properties like organizationId, subscriptionTier, etc.
 */
export interface EnhancedUser {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User display name */
  name: string | null;
  /** User avatar URL */
  avatar_url: string | null;
  /** Global user role (SUPER_ADMIN, ADMIN, MODERATOR, USER) */
  role: UserRole;
  /** Global role (alias for role) */
  globalRole: UserRole;
  /** User subscription tier (from users table) */
  subscription_tier: string;
  /** Subscription tier (camelCase accessor) */
  subscriptionTier: string;
  /** Organization ID (from primary organization) */
  organizationId: string;
  /** Organization role (OWNER, ADMIN, MEMBER, VIEWER) */
  organizationRole: OrgRole;
  /** Is user active */
  is_active: boolean;
  /** Created at timestamp */
  created_at: Date;
  /** Updated at timestamp */
  updated_at: Date;
  /** Full user object with relationships */
  _raw: UserWithOrganization;
}

/**
 * Convert UserWithOrganization to EnhancedUser
 * This function extracts commonly needed properties and provides
 * convenient accessors to avoid repetitive null checks
 *
 * @param user - User with organization relationships loaded
 * @returns Enhanced user object with camelCase property accessors
 * @throws Error if user has no organization memberships
 */
export function enhanceUser(user: UserWithOrganization): EnhancedUser {
  if (!user.organization_members || user.organization_members.length === 0) {
    throw new Error('User has no organization memberships');
  }

  const primaryOrgMember = user.organization_members[0];
  const primaryOrg = primaryOrgMember.organizations;
  const subscription = primaryOrg.subscriptions;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role as UserRole,
    globalRole: user.role as UserRole,
    subscription_tier: subscription?.tier || user.subscription_tier,
    subscriptionTier: subscription?.tier || user.subscription_tier,
    organizationId: primaryOrg.id,
    organizationRole: primaryOrgMember.role,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    _raw: user,
  };
}

/**
 * Type guard to check if a value is an EnhancedUser
 */
export function isEnhancedUser(value: unknown): value is EnhancedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'organizationId' in value &&
    'subscriptionTier' in value &&
    'organizationRole' in value
  );
}
