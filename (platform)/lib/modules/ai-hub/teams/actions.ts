'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberSchema,
  executeTeamSchema,
  type CreateTeamInput,
  type UpdateTeamInput,
  type AddTeamMemberInput,
  type UpdateTeamMemberInput,
  type ExecuteTeamInput,
} from './schemas';
import { executeTeam as runTeam } from './execution';
import { validateTeamStructure } from './utils';

/**
 * Create a new agent team
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function createTeam(input: CreateTeamInput) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized: AI Hub management requires GROWTH tier and Admin role');
  }

  const validated = createTeamSchema.parse(input);

  await setTenantContext({ organizationId: user.organizationId });

  const team = await prisma.agent_teams.create({
    data: {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: validated.name,
      description: validated.description,
      structure: validated.structure,
      coordination: validated.coordination as any,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
      members: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatar: true,
              model_config: true,
              status: true,
            },
          },
        },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return team;
}

/**
 * Update an existing agent team
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function updateTeam(input: UpdateTeamInput) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateTeamSchema.parse(input);
  const { id, ...updateData } = validated;

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership
  const existing = await prisma.agent_teams.findFirst({
    where: { id, organization_id: user.organizationId },
    include: {
      members: true,
    },
  });

  if (!existing) {
    throw new Error('Team not found');
  }

  // Validate structure if changed
  if (updateData.structure && existing.members.length > 0) {
    const structureValidation = validateTeamStructure(
      updateData.structure,
      existing.members.map((m) => ({ role: m.role, agent_id: m.agent_id }))
    );

    if (!structureValidation.valid) {
      throw new Error(structureValidation.error);
    }
  }

  const team = await prisma.agent_teams.update({
    where: { id },
    data: {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.structure && { structure: updateData.structure }),
      ...(updateData.coordination && { coordination: updateData.coordination as any }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
      members: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatar: true,
              model_config: true,
              status: true,
            },
          },
        },
        orderBy: {
          priority: 'asc',
        },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath(`/real-estate/ai-hub/teams/${id}`);
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return team;
}

/**
 * Add a member to a team
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function addTeamMember(input: AddTeamMemberInput) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = addTeamMemberSchema.parse(input);

  await setTenantContext({ organizationId: user.organizationId });

  // Verify team ownership
  const team = await prisma.agent_teams.findFirst({
    where: { id: validated.teamId, organization_id: user.organizationId },
    include: { members: true },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Verify agent ownership
  const agent = await prisma.ai_agents.findFirst({
    where: { id: validated.agentId, organization_id: user.organizationId },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  // Check if agent already in team
  const existingMember = team.members.find((m) => m.agent_id === validated.agentId);
  if (existingMember) {
    throw new Error('Agent is already a member of this team');
  }

  // Validate structure with new member
  const updatedMembers = [
    ...team.members.map((m) => ({ role: m.role, agent_id: m.agent_id })),
    { role: validated.role, agent_id: validated.agentId },
  ];

  const structureValidation = validateTeamStructure(team.structure, updatedMembers);
  if (!structureValidation.valid) {
    throw new Error(structureValidation.error);
  }

  const member = await prisma.team_members.create({
    data: {
      id: `team_member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      team_id: validated.teamId,
      agent_id: validated.agentId,
      role: validated.role,
      priority: validated.priority,
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
          model_config: true,
          status: true,
        },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath(`/real-estate/ai-hub/teams/${validated.teamId}`);

  return member;
}

/**
 * Update a team member's role or priority
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: Verify through team ownership
 */
export async function updateTeamMember(input: UpdateTeamMemberInput) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateTeamMemberSchema.parse(input);
  const { id, ...updateData } = validated;

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership through team
  const member = await prisma.team_members.findFirst({
    where: {
      id,
      team: {
        organization_id: user.organizationId,
      },
    },
    include: {
      team: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Team member not found');
  }

  // Validate structure if role is changed
  if (updateData.role) {
    const updatedMembers = member.team.members.map((m) =>
      m.id === id
        ? { role: updateData.role!, agent_id: m.agent_id }
        : { role: m.role, agent_id: m.agent_id }
    );

    const structureValidation = validateTeamStructure(member.team.structure, updatedMembers);
    if (!structureValidation.valid) {
      throw new Error(structureValidation.error);
    }
  }

  const updated = await prisma.team_members.update({
    where: { id },
    data: {
      ...(updateData.role && { role: updateData.role }),
      ...(updateData.priority !== undefined && { priority: updateData.priority }),
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
          model_config: true,
          status: true,
        },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath(`/real-estate/ai-hub/teams/${member.team_id}`);

  return updated;
}

/**
 * Remove a member from a team
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: Verify through team ownership
 */
export async function removeTeamMember(memberId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership through team
  const member = await prisma.team_members.findFirst({
    where: {
      id: memberId,
      team: {
        organization_id: user.organizationId,
      },
    },
    include: {
      team: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Team member not found');
  }

  // Validate structure after removal
  const remainingMembers = member.team.members
    .filter((m) => m.id !== memberId)
    .map((m) => ({ role: m.role, agent_id: m.agent_id }));

  if (remainingMembers.length > 0) {
    const structureValidation = validateTeamStructure(member.team.structure, remainingMembers);
    if (!structureValidation.valid) {
      throw new Error(
        `Cannot remove member: ${structureValidation.error}. Adjust team structure or add replacement member first.`
      );
    }
  }

  await prisma.team_members.delete({
    where: { id: memberId },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath(`/real-estate/ai-hub/teams/${member.team_id}`);

  return { success: true };
}

/**
 * Execute a team task
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeTeam(input: ExecuteTeamInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = executeTeamSchema.parse(input);

  const execution = await runTeam(
    validated.teamId,
    user.organizationId,
    validated.task,
    validated.context,
    validated.patternOverride
  );

  revalidatePath(`/real-estate/ai-hub/teams/${validated.teamId}`);
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return execution;
}

/**
 * Delete an agent team
 * RBAC: Requires AI Hub management access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function deleteTeam(teamId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized: Admin permissions required');
  }

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership
  const existing = await prisma.agent_teams.findFirst({
    where: { id: teamId, organization_id: user.organizationId },
  });

  if (!existing) {
    throw new Error('Team not found');
  }

  // Delete team (members and executions will cascade)
  await prisma.agent_teams.delete({
    where: { id: teamId },
  });

  revalidatePath('/real-estate/ai-hub/teams');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return { success: true };
}
