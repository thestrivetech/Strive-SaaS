import { prisma } from '@/lib/database/prisma';

export async function getOrganization(organizationId: string) {
  return await prisma.organizations.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      description: true,
      created_at: true,
      updated_at: true,
    },
  });
}

export async function getOrganizationMembers(organizationId: string) {
  const members = await prisma.organization_members.findMany({
    where: { organization_id: organizationId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      },
    },
    orderBy: {
      joined_at: 'asc',
    },
  });

  return members.map((member: { id: string; role: string; joined_at: Date; users: { id: string; name: string; email: string; avatar_url: string | null; is_active: boolean } }) => ({
    id: member.id,
    role: member.role,
    joined_at: member.joined_at,
    users: {
      id: member.users.id,
      name: member.users.name,
      email: member.users.email,
      avatar_url: member.users.avatar_url,
      is_active: member.users.is_active,
    },
  }));
}

export async function getOrganizationStats(organizationId: string) {
  const totalMembers = await prisma.organization_members.count({
    where: { organization_id: organizationId },
  });

  const adminCount = await prisma.organization_members.count({
    where: {
      organization_id: organizationId,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  const activeCount = await prisma.organization_members.count({
    where: {
      organization_id: organizationId,
      users: {
        is_active: true,
      },
    },
  });

  return {
    totalMembers,
    adminCount,
    activeCount,
  };
}
