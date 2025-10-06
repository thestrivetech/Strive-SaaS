import { prisma } from '@/lib/database/prisma';
import type { organizations, organization_members, users } from '@prisma/client';

export async function getOrganization(orgId: string): Promise<organizations | null> {
  return prisma.organizations.findUnique({
    where: { id: orgId },
  });
}

export async function getOrganizationBySlug(slug: string): Promise<organizations | null> {
  return prisma.organizations.findUnique({
    where: { slug },
  });
}

export async function getUserOrganizations(userId: string): Promise<(organization_members & { organizations: organizations })[]> {
  return prisma.organization_members.findMany({
    where: { user_id: userId },
    include: { organizations: true },
    orderBy: { joined_at: 'desc' },
  });
}

export async function getOrganizationMembers(orgId: string): Promise<(organization_members & { users: users })[]> {
  return prisma.organization_members.findMany({
    where: { organization_id: orgId },
    include: { users: true },
    orderBy: { joined_at: 'asc' },
  });
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const existing = await prisma.organizations.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing;
}

export async function getUserRoleInOrganization(userId: string, orgId: string) {
  const member = await prisma.organization_members.findFirst({
    where: {
      user_id: userId,
      organization_id: orgId,
    },
    select: {
      role: true,
    },
  });
  return member?.role;
}