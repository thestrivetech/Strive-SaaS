import { prisma } from '@/lib/database/prisma';

export async function getDashboardStats(organizationId: string) {
  const [
    customerCount,
    projectCount,
    activeProjects,
    totalTasks,
    completedTasks,
    teamMemberCount,
    recentActivity
  ] = await Promise.all([
    // Total customers
    prisma.customers.count({
      where: { organization_id: organizationId },
    }),

    // Total projects
    prisma.projects.count({
      where: { organization_id: organizationId },
    }),

    // Active projects
    prisma.projects.count({
      where: {
        organization_id: organizationId,
        status: 'ACTIVE',
      },
    }),

    // Total tasks
    prisma.tasks.count({
      where: {
        projects: {
          organization_id: organizationId,
        },
      },
    }),

    // Completed tasks
    prisma.tasks.count({
      where: {
        projects: {
          organization_id: organizationId,
        },
        status: 'DONE',
      },
    }),

    // Team members
    prisma.organization_members.count({
      where: { organization_id: organizationId },
    }),

    // Recent activity (last 10 items)
    prisma.activity_logs.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        users: {
          select: {
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }),
  ]);

  // Calculate revenue (simplified - you'd want more complex logic in production)
  const organization = await prisma.organizations.findUnique({
    where: { id: organizationId },
    include: {
      subscriptions: true,
    },
  });

  let monthlyRevenue = 0;
  if (organization?.subscriptions) {
    // This is simplified - in reality you'd calculate based on actual subscription data
    const tierPricing: Record<string, number> = {
      FREE: 0,
      BASIC: 299,
      PRO: 699,
      ENTERPRISE: 1499,
    };
    monthlyRevenue = tierPricing[organization.subscriptions.tier] || 0;
  }

  return {
    revenue: monthlyRevenue,
    customers: customerCount,
    projects: projectCount,
    activeProjects,
    tasks: totalTasks,
    completedTasks,
    teamMembers: teamMemberCount,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    recentActivity,
  };
}

export async function getActivityFeed(organizationId: string, limit: number = 20) {
  return prisma.activity_logs.findMany({
    where: { organization_id: organizationId },
    orderBy: { created_at: 'desc' },
    take: limit,
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
}

/**
 * Get activity logs for a specific resource or all resources in an organization
 */
export async function getActivityLogs(
  organizationId: string,
  resourceType?: string,
  resourceId?: string,
  limit: number = 50
) {
  const where: any = { organization_id: organizationId };

  if (resourceType) {
    where.resource_type = resourceType;
  }

  if (resourceId) {
    where.resource_id = resourceId;
  }

  return prisma.activity_logs.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: limit,
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
}