'use server';

import { prisma } from '@/lib/database/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import {
  createOrganizationSchema,
  inviteTeamMemberSchema,
  updateMemberRoleSchema,
  type CreateOrganizationInput,
  type InviteTeamMemberInput,
  type UpdateMemberRoleInput
} from './schemas';
import { revalidatePath } from 'next/cache';
import { OrgRole } from '@prisma/client';

export async function createOrganization(input: CreateOrganizationInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = createOrganizationSchema.parse(input);

  // Check if slug is already taken
  const existingOrg = await prisma.organizations.findUnique({
    where: { slug: validated.slug },
  });

  if (existingOrg) {
    throw new Error('Organization slug already taken');
  }

  // Create organization and add user as owner
  const org = await prisma.organizations.create({
    data: {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      billing_email: validated.billingEmail,
      organization_members: {
        create: {
          user_id: user.id,
          role: OrgRole.OWNER,
        },
      },
    },
    include: {
      organization_members: true,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return org;
}

export async function inviteTeamMember(input: InviteTeamMemberInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = inviteTeamMemberSchema.parse(input);

  // Check if user has permission to invite (must be OWNER or ADMIN)
  const currentMember = await prisma.organization_members.findFirst({
    where: {
      user_id: user.id,
      organization_id: validated.organizationId,
    },
  });

  if (!currentMember || (currentMember.role !== OrgRole.OWNER && currentMember.role !== OrgRole.ADMIN)) {
    throw new Error('Insufficient permissions');
  }

  // Check if user already exists
  let invitedUser = await prisma.users.findUnique({
    where: { email: validated.email },
  });

  // If user doesn't exist, create a placeholder user
  if (!invitedUser) {
    invitedUser = await prisma.users.create({
      data: {
        email: validated.email,
        role: 'USER',
      },
    });
  }

  // Check if user is already a member
  const existingMember = await prisma.organization_members.findFirst({
    where: {
      user_id: invitedUser.id,
      organization_id: validated.organizationId,
    },
  });

  if (existingMember) {
    throw new Error('User is already a member of this organization');
  }

  // Add user to organization
  const member = await prisma.organization_members.create({
    data: {
      user_id: invitedUser.id,
      organization_id: validated.organizationId,
      role: validated.role as OrgRole,
    },
    include: {
      users: true,
    },
  });

  revalidatePath('/settings');

  return member;
}

export async function updateMemberRole(input: UpdateMemberRoleInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = updateMemberRoleSchema.parse(input);

  // Get the member to update
  const memberToUpdate = await prisma.organization_members.findUnique({
    where: { id: validated.memberId },
  });

  if (!memberToUpdate) {
    throw new Error('Member not found');
  }

  // Check if current user has permission (must be OWNER or ADMIN)
  const currentMember = await prisma.organization_members.findFirst({
    where: {
      user_id: user.id,
      organization_id: memberToUpdate.organization_id,
    },
  });

  if (!currentMember || (currentMember.role !== OrgRole.OWNER && currentMember.role !== OrgRole.ADMIN)) {
    throw new Error('Insufficient permissions');
  }

  // Can't change owner's role
  if (memberToUpdate.role === OrgRole.OWNER) {
    throw new Error('Cannot change owner role');
  }

  // Update role
  const updatedMember = await prisma.organization_members.update({
    where: { id: validated.memberId },
    data: { role: validated.role as OrgRole },
    include: { users: true },
  });

  revalidatePath('/settings');

  return updatedMember;
}

export async function removeMemberFromOrganization(memberId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get the member to remove
  const memberToRemove = await prisma.organization_members.findUnique({
    where: { id: memberId },
  });

  if (!memberToRemove) {
    throw new Error('Member not found');
  }

  // Check if current user has permission (must be OWNER or ADMIN)
  const currentMember = await prisma.organization_members.findFirst({
    where: {
      user_id: user.id,
      organization_id: memberToRemove.organization_id,
    },
  });

  if (!currentMember || (currentMember.role !== OrgRole.OWNER && currentMember.role !== OrgRole.ADMIN)) {
    throw new Error('Insufficient permissions');
  }

  // Can't remove owner
  if (memberToRemove.role === OrgRole.OWNER) {
    throw new Error('Cannot remove owner from organization');
  }

  await prisma.organization_members.delete({
    where: { id: memberId },
  });

  revalidatePath('/settings');

  return { success: true };
}