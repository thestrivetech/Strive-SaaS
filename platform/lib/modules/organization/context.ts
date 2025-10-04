'use server';

import { cookies } from 'next/headers';
import { getUserOrganizations } from './queries';

const CURRENT_ORG_COOKIE = 'current_organization_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function setCurrentOrganization(organizationId: string, userId: string) {
  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(userId);
  const hasAccess = userOrgs.some((org) => org.organizationId === organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return { success: true };
}

export async function getCurrentOrganizationId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const orgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

  if (orgId) {
    // Verify user still has access
    const userOrgs = await getUserOrganizations(userId);
    const hasAccess = userOrgs.some((org) => org.organizationId === orgId);

    if (hasAccess) {
      return orgId;
    }
  }

  // Fallback to first organization
  const userOrgs = await getUserOrganizations(userId);
  if (userOrgs.length > 0) {
    const firstOrgId = userOrgs[0].organizationId;
    // Set cookie for next time
    const cookieStore = await cookies();
    cookieStore.set(CURRENT_ORG_COOKIE, firstOrgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return firstOrgId;
  }

  return null;
}

export async function getActiveOrganization(userId: string) {
  const orgId = await getCurrentOrganizationId(userId);

  if (!orgId) {
    return null;
  }

  const userOrgs = await getUserOrganizations(userId);
  const orgMembership = userOrgs.find((org) => org.organizationId === orgId);

  return orgMembership?.organization || null;
}