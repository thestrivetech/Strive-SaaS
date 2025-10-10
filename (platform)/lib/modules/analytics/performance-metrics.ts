import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';

/**
 * Performance Analytics Module
 *
 * Provides agent performance tracking:
 * - Individual agent metrics
 * - Team leaderboard
 * - Activity tracking
 *
 * All queries automatically filtered by organization via withTenantContext
 */

export interface AgentMetrics {
  leads: number;
  contacts: number;
  dealsWon: number;
  dealsLost: number;
  revenue: number;
  winRate: number;
  activities: number;
}

export interface AgentPerformance {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  metrics: AgentMetrics;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Get performance metrics for all agents in the organization
 *
 * @param timeRange - Date range for metrics
 * @returns Array of agent performance data, sorted by revenue
 */
export async function getAgentPerformance(
  timeRange: TimeRange
): Promise<AgentPerformance[]> {
  return withTenantContext(async () => {
    // Get all agents in organization
    const orgMembers = await prisma.organization_members.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    const agentMetrics = await Promise.all(
      orgMembers.map(async (member: any) => {
        const userId = member.user_id;

        const [
          leadsCount,
          contactsCount,
          dealsWon,
          dealsLost,
          revenue,
          activitiesCount,
        ] = await Promise.all([
          // Leads assigned to agent in time range
          prisma.leads.count({
            where: {
              assigned_to_id: userId,
              created_at: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          // Total contacts assigned to agent
          prisma.contacts.count({
            where: { assigned_to_id: userId },
          }),

          // Deals won in time range
          prisma.deals.count({
            where: {
              assigned_to_id: userId,
              status: 'WON',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          // Deals lost in time range
          prisma.deals.count({
            where: {
              assigned_to_id: userId,
              status: 'LOST',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),

          // Revenue generated in time range
          prisma.deals.aggregate({
            where: {
              assigned_to_id: userId,
              status: 'WON',
              actual_close_date: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
            _sum: { value: true },
          }),

          // Activities created in time range
          prisma.activities.count({
            where: {
              created_by_id: userId,
              created_at: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          }),
        ]);

        const winRate =
          dealsWon + dealsLost > 0 ? (dealsWon / (dealsWon + dealsLost)) * 100 : 0;

        return {
          user: member.users,
          metrics: {
            leads: leadsCount,
            contacts: contactsCount,
            dealsWon,
            dealsLost,
            revenue: Number(revenue._sum.value || 0),
            winRate,
            activities: activitiesCount,
          },
        };
      })
    );

    // Sort by revenue descending
    return agentMetrics.sort((a, b) => b.metrics.revenue - a.metrics.revenue);
  });
}

/**
 * Get performance metrics for a specific agent
 *
 * @param userId - User ID of the agent
 * @param timeRange - Date range for metrics
 * @returns Agent performance data
 */
export async function getAgentPerformanceById(
  userId: string,
  timeRange: TimeRange
): Promise<AgentPerformance | null> {
  return withTenantContext(async () => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
      },
    });

    if (!user) {
      return null;
    }

    const [
      leadsCount,
      contactsCount,
      dealsWon,
      dealsLost,
      revenue,
      activitiesCount,
    ] = await Promise.all([
      prisma.leads.count({
        where: {
          assigned_to_id: userId,
          created_at: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      }),

      prisma.contacts.count({
        where: { assigned_to_id: userId },
      }),

      prisma.deals.count({
        where: {
          assigned_to_id: userId,
          status: 'WON',
          actual_close_date: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      }),

      prisma.deals.count({
        where: {
          assigned_to_id: userId,
          status: 'LOST',
          actual_close_date: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      }),

      prisma.deals.aggregate({
        where: {
          assigned_to_id: userId,
          status: 'WON',
          actual_close_date: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _sum: { value: true },
      }),

      prisma.activities.count({
        where: {
          created_by_id: userId,
          created_at: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      }),
    ]);

    const winRate =
      dealsWon + dealsLost > 0 ? (dealsWon / (dealsWon + dealsLost)) * 100 : 0;

    return {
      user,
      metrics: {
        leads: leadsCount,
        contacts: contactsCount,
        dealsWon,
        dealsLost,
        revenue: Number(revenue._sum.value || 0),
        winRate,
        activities: activitiesCount,
      },
    };
  });
}

/**
 * Get team-wide activity statistics
 *
 * @param timeRange - Date range for metrics
 * @returns Activity breakdown by type
 */
export async function getTeamActivityStats(
  timeRange: TimeRange
): Promise<Array<{ type: string; count: number }>> {
  return withTenantContext(async () => {
    const activities = await prisma.activities.groupBy({
      by: ['type'],
      where: {
        created_at: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      _count: { id: true },
    });

    return activities.map((activity: any) => ({
      type: activity.type,
      count: activity._count.id,
    }));
  });
}
