'use server';

import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getDashboardStats, getActivityFeed } from './queries';
import { getUserOrganizations } from '../organization/queries';

export async function fetchDashboardData() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  // Get user's organizations
  const organizations = await getUserOrganizations(currentUser.id);

  if (organizations.length === 0) {
    // Return empty stats if user has no organization
    return {
      stats: {
        revenue: 0,
        customers: 0,
        projects: 0,
        activeProjects: 0,
        tasks: 0,
        completedTasks: 0,
        teamMembers: 0,
        taskCompletionRate: 0,
        recentActivity: [],
      },
      organization: null,
    };
  }

  // Get stats for the first organization (or the selected one from context)
  const primaryOrg = organizations[0].organization;
  const stats = await getDashboardStats(primaryOrg.id);

  return {
    stats,
    organization: primaryOrg,
  };
}

export async function fetchActivityFeed(limit: number = 20) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const organizations = await getUserOrganizations(currentUser.id);

  if (organizations.length === 0) {
    return [];
  }

  const primaryOrg = organizations[0].organization;
  return getActivityFeed(primaryOrg.id, limit);
}