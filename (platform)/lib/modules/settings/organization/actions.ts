'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';
type UpdateOrganizationInput = any;
type InviteTeamMemberInput = any;
type UpdateMemberRoleInput = any;
type RemoveMemberInput = any;
export async function updateOrganization(data: UpdateOrganizationInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only ADMIN and SUPER_ADMIN can update organization
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const validated = data;

    const updated = await prisma.organizations.update({
      where: { id: user.organization_id },
      data: {
        name: validated.name,
        description: validated.description,
      },
    });

    revalidatePath('/settings/organization');

    return { success: true, organization: updated };
  } catch (error) {
    console.error('updateOrganization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update organization',
    };
  }
}

export async function inviteTeamMember(data: InviteTeamMemberInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only ADMIN and SUPER_ADMIN can invite members
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only administrators can invite team members' };
    }

    const validated = data;

    // Check if user already exists with this email
    const existingUser = await prisma.users.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      // Check if already a member of this organization
      const existingMember = await prisma.organization_members.findFirst({
        where: {
          user_id: existingUser.id,
          organization_id: user.organization_id,
        },
      });

      if (existingMember) {
        return { success: false, error: 'User is already a member of this organization' };
      }

      // Add existing user to organization
      await prisma.organization_members.create({
        data: {
          user_id: existingUser.id,
          organization_id: user.organization_id,
          role: validated.role,
        },
      });
    } else {
      // For now, return error - full invitation system with email would be implemented later
      return {
        success: false,
        error: 'User does not exist. Full invitation system not yet implemented.',
      };
    }

    revalidatePath('/settings/team');

    return { success: true, message: 'Team member invited successfully' };
  } catch (error) {
    console.error('inviteTeamMember error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite team member',
    };
  }
}

export async function updateMemberRole(data: UpdateMemberRoleInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only ADMIN and SUPER_ADMIN can change roles
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const validated = data;

    // Prevent changing your own role
    if (validated.userId === user.id) {
      return { success: false, error: 'You cannot change your own role' };
    }

    // Verify the target user is in the same organization
    const targetMember = await prisma.organization_members.findFirst({
      where: {
        user_id: validated.userId,
        organization_id: user.organization_id,
      },
    });

    if (!targetMember) {
      return { success: false, error: 'User is not a member of your organization' };
    }

    // Prevent changing OWNER role
    if (targetMember.role === 'OWNER') {
      return { success: false, error: 'Cannot change the role of the organization owner' };
    }

    // Update member role
    await prisma.organization_members.update({
      where: { id: targetMember.id },
      data: { role: validated.newRole },
    });

    revalidatePath('/settings/team');

    return { success: true, message: 'Member role updated successfully' };
  } catch (error) {
    console.error('updateMemberRole error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update member role',
    };
  }
}

export async function removeMember(data: RemoveMemberInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only ADMIN and SUPER_ADMIN can remove members
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const validated = data;

    // Prevent removing yourself
    if (validated.userId === user.id) {
      return { success: false, error: 'You cannot remove yourself from the organization' };
    }

    // Verify the target user is in the same organization
    const targetMember = await prisma.organization_members.findFirst({
      where: {
        user_id: validated.userId,
        organization_id: user.organization_id,
      },
    });

    if (!targetMember) {
      return { success: false, error: 'User is not a member of your organization' };
    }

    // Prevent removing OWNER
    if (targetMember.role === 'OWNER') {
      return { success: false, error: 'Cannot remove the organization owner' };
    }

    // Remove from organization
    await prisma.organization_members.delete({
      where: { id: targetMember.id },
    });

    revalidatePath('/settings/team');

    return { success: true, message: 'Member removed successfully' };
  } catch (error) {
    console.error('removeMember error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove member',
    };
  }
}
