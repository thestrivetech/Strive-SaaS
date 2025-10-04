import type { User, OrganizationMember, Organization } from '@prisma/client';

/**
 * User type with loaded organization member relationship
 * This type represents a user with their organization memberships eagerly loaded
 */
export type UserWithOrganization = User & {
  organizationMembers: Array<
    OrganizationMember & {
      organization: Organization;
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
  if (!user.organizationMembers || user.organizationMembers.length === 0) {
    throw new Error('User has no organization memberships');
  }

  // Return the first organization (primary)
  return user.organizationMembers[0].organization.id;
}

/**
 * Get the user's primary organization
 *
 * @param user - User with organization memberships loaded
 * @returns The primary organization
 * @throws Error if user has no organization memberships
 */
export function getUserOrganization(user: UserWithOrganization): Organization {
  if (!user.organizationMembers || user.organizationMembers.length === 0) {
    throw new Error('User has no organization memberships');
  }

  return user.organizationMembers[0].organization;
}

/**
 * Get all organizations the user belongs to
 *
 * @param user - User with organization memberships loaded
 * @returns Array of all organizations the user is a member of
 */
export function getUserOrganizations(user: UserWithOrganization): Organization[] {
  return user.organizationMembers.map(member => member.organization);
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
  return user.organizationMembers.some(
    member => member.organization.id === organizationId
  );
}
