import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { TeamStructure, ExecutionStatus } from '@prisma/client';
import type { TeamFilters, TeamExecutionFilters } from './schemas';

/**
 * Get teams with filtering and pagination
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function getTeams(organizationId: string, filters?: TeamFilters) {
  await setTenantContext({ organizationId });

  const where: any = {
    organization_id: organizationId,
  };

  // Apply filters
  if (filters?.structure) {
    where.structure = filters.structure;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  const orderBy: any = {};
  if (filters?.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || 'desc';
  } else {
    orderBy.created_at = 'desc';
  }

  // Execute query
  const teams = await prisma.agent_teams.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
        },
      },
      members: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatar: true,
              model_config: true,
              capabilities: true,
              status: true,
            },
          },
        },
        orderBy: {
          priority: 'asc',
        },
      },
      _count: {
        select: {
          members: true,
          executions: true,
        },
      },
    },
    orderBy,
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });

  // Apply member count filters (post-query for complex conditions)
  let filteredTeams = teams;
  if (filters?.minMembers !== undefined) {
    filteredTeams = filteredTeams.filter((t) => t._count.members >= filters.minMembers!);
  }
  if (filters?.maxMembers !== undefined) {
    filteredTeams = filteredTeams.filter((t) => t._count.members <= filters.maxMembers!);
  }

  return filteredTeams;
}

/**
 * Get single team by ID with full details
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function getTeamById(teamId: string, organizationId: string) {
  await setTenantContext({ organizationId });

  const team = await prisma.agent_teams.findFirst({
    where: {
      id: teamId,
      organization_id: organizationId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
        },
      },
      members: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              description: true,
              avatar: true,
              personality: true,
              model_config: true,
              capabilities: true,
              status: true,
              execution_count: true,
              success_rate: true,
              avg_response_time: true,
            },
          },
        },
        orderBy: {
          priority: 'asc',
        },
      },
      executions: {
        orderBy: {
          started_at: 'desc',
        },
        take: 10, // Latest 10 executions
      },
      _count: {
        select: {
          members: true,
          executions: true,
        },
      },
    },
  });

  return team;
}

/**
 * Get team statistics for organization
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function getTeamStats(organizationId: string) {
  await setTenantContext({ organizationId });

  const [totalTeams, totalExecutions, structureBreakdown] = await Promise.all([
    // Total teams count
    prisma.agent_teams.count({
      where: { organization_id: organizationId },
    }),

    // Total executions count
    prisma.team_executions.count({
      where: {
        team: {
          organization_id: organizationId,
        },
      },
    }),

    // Teams by structure
    prisma.agent_teams.groupBy({
      by: ['structure'],
      where: { organization_id: organizationId },
      _count: {
        structure: true,
      },
    }),
  ]);

  // Calculate average metrics
  const teams = await prisma.agent_teams.findMany({
    where: { organization_id: organizationId },
    select: {
      success_rate: true,
      execution_count: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  const avgSuccessRate =
    teams.length > 0
      ? teams.reduce((sum, t) => sum + (t.success_rate || 0), 0) / teams.length
      : 0;

  const avgMembersPerTeam =
    teams.length > 0
      ? teams.reduce((sum, t) => sum + t._count.members, 0) / teams.length
      : 0;

  const totalTeamExecutions = teams.reduce((sum, t) => sum + t.execution_count, 0);

  return {
    totalTeams,
    totalExecutions,
    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
    avgMembersPerTeam: Math.round(avgMembersPerTeam * 10) / 10,
    totalTeamExecutions,
    structureBreakdown: structureBreakdown.map((s) => ({
      structure: s.structure,
      count: s._count.structure,
    })),
  };
}

/**
 * Get team executions with filtering and pagination
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function getTeamExecutions(
  teamId: string,
  organizationId: string,
  filters?: TeamExecutionFilters
) {
  await setTenantContext({ organizationId });

  // Verify team ownership
  const team = await prisma.agent_teams.findFirst({
    where: {
      id: teamId,
      organization_id: organizationId,
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  const where: any = {
    team_id: teamId,
  };

  // Apply filters
  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.pattern) {
    where.pattern = filters.pattern;
  }

  const executions = await prisma.team_executions.findMany({
    where,
    orderBy: {
      started_at: 'desc',
    },
    take: filters?.limit || 20,
    skip: filters?.offset || 0,
  });

  // Get total count for pagination
  const total = await prisma.team_executions.count({ where });

  return {
    executions,
    total,
    limit: filters?.limit || 20,
    offset: filters?.offset || 0,
  };
}

/**
 * Get team member by ID
 * Multi-tenancy: Verify through team ownership
 */
export async function getTeamMember(memberId: string, organizationId: string) {
  await setTenantContext({ organizationId });

  const member = await prisma.team_members.findFirst({
    where: {
      id: memberId,
      team: {
        organization_id: organizationId,
      },
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          description: true,
          avatar: true,
          model_config: true,
          capabilities: true,
          status: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          structure: true,
        },
      },
    },
  });

  return member;
}

/**
 * Check if agent is already in team
 * Multi-tenancy: Verify through team ownership
 */
export async function isAgentInTeam(
  teamId: string,
  agentId: string,
  organizationId: string
): Promise<boolean> {
  await setTenantContext({ organizationId });

  const member = await prisma.team_members.findFirst({
    where: {
      team_id: teamId,
      agent_id: agentId,
      team: {
        organization_id: organizationId,
      },
    },
  });

  return member !== null;
}

/**
 * Get teams containing specific agent
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function getTeamsWithAgent(agentId: string, organizationId: string) {
  await setTenantContext({ organizationId });

  const teams = await prisma.agent_teams.findMany({
    where: {
      organization_id: organizationId,
      members: {
        some: {
          agent_id: agentId,
        },
      },
    },
    include: {
      members: {
        where: {
          agent_id: agentId,
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          executions: true,
        },
      },
    },
  });

  return teams;
}
