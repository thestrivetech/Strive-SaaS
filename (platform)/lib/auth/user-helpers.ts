import type { users, organization_members, organizations } from '@prisma/client';

/**
 * User type with loaded organization member relationship
 * This type represents a user with their organization memberships eagerly loaded
 */
export type UserWithOrganization = users & {
  organization_members: Array<
    organization_members & {
      organizations: organizations;
    }
  >;
};

/**
 * Get the user's primary organization ID
 * Assumes user belongs to at least one organization
 *
 * @param user - User with organization memberships loaded
 * @returns The primary organization ID
 * @throws Error if user has no organization memberships
 */
export function getUserOrganizationId(user: UserWithOrganization): string {
  if (!user.organization_members || user.organization_members.length === 0) {
    throw new Error('User has no organization memberships');
  }

  // Return the first organization (primary)
  return user.organization_members[0].organizations.id;
}

/**
 * Get the user's primary organization
 *
 * @param user - User with organization memberships loaded
 * @returns The primary organization
 * @throws Error if user has no organization memberships
 */
export function getUserOrganization(user: UserWithOrganization): organizations {
  if (!user.organization_members || user.organization_members.length === 0) {
    throw new Error('User has no organization memberships');
  }

  return user.organization_members[0].organizations;
}

/**
 * Get all organizations the user belongs to
 *
 * @param user - User with organization memberships loaded
 * @returns Array of all organizations the user is a member of
 */
export function getUserOrganizations(user: UserWithOrganization): organizations[] {
  return user.organization_members.map(member => member.organizations);
}

/**
 * Check if user belongs to a specific organization
 *
 * @param user - User with organization memberships loaded
 * @param organizationId - The organization ID to check
 * @returns True if user belongs to the organization, false otherwise
 */
export function userBelongsToOrganization(
  user: UserWithOrganization,
  organizationId: string
): boolean {
  return user.organization_members.some(
    member => member.organizations.id === organizationId
  );
}
