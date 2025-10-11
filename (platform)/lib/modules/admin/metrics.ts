'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canViewPlatformMetrics } from '@/lib/auth/rbac';
import { cache } from 'react';
import { Prisma } from '@prisma/client';

/**
 * Get dashboard overview with latest metrics
 */
export const getDashboardOverview = cache(async function() {
  const user = await getCurrentUser();

  if (!user || !canViewPlatformMetrics(user.role)) {
    throw new Error('Unauthorized: Admin access required');
  }

  const [metrics, dbStats, securityAlerts] = await Promise.all([
    getPlatformMetrics(),
    getDatabaseStats(),
    getSecurityAlertCount(),
  ]);

  return {
    overview: {
      totalOrganizations: metrics.total_orgs,
      totalUsers: metrics.total_users,
      monthlyRevenue: Number(metrics.mrr_cents),
      activeSubscriptions: await getActiveSubscriptionCount(),
      systemHealth: 99.9, // Placeholder - implement uptime monitoring
      securityAlerts: securityAlerts,
      superAdminCount: await getSuperAdminCount(),
    },
    database: {
      size: dbStats.size,
      totalRecords: dbStats.totalRecords,
      dailyGrowth: dbStats.dailyGrowth,
    },
    metrics,
  };
});

/**
 * Get latest platform metrics (cached 1 hour)
 */
export const getPlatformMetrics = cache(async function() {
  const user = await getCurrentUser();

  if (!user || !canViewPlatformMetrics(user.role)) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Get latest metrics
  const latest = await prisma.platform_metrics.findFirst({
    orderBy: { date: 'desc' },
  });

  // If no metrics exist or metrics are older than 1 hour, calculate fresh
  if (!latest || Date.now() - latest.date.getTime() > 3600000) {
    return await calculatePlatformMetrics();
  }

  return latest;
});

/**
 * Calculate fresh platform metrics
 */
export async function calculatePlatformMetrics() {
  const user = await getCurrentUser();

  if (!user || !canViewPlatformMetrics(user.role)) {
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate user metrics
  const [totalUsers, newUsers] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({
      where: { created_at: { gte: today } },
    }),
  ]);

  // Active users = users who have been active (placeholder - requires activity tracking)
  // TODO: Implement proper activity tracking via activity_logs table
  const activeUsers = 0;

  // Calculate organization metrics
  const [totalOrgs, newOrgs] = await Promise.all([
    prisma.organizations.count(),
    prisma.organizations.count({
      where: { created_at: { gte: today } },
    }),
  ]);

  // Active orgs = organizations with active members (placeholder)
  // TODO: Implement proper activity tracking
  const activeOrgs = 0;

  // Calculate subscription metrics
  const activeSubscriptions = await prisma.subscriptions.findMany({
    where: { status: 'ACTIVE' },
    select: {
      tier: true,
    },
  });

  // MRR/ARR calculation (placeholder - requires Stripe integration)
  // TODO: Get actual revenue data from Stripe
  const mrrCents = 0;
  const arrCents = 0;

  // Calculate churn rate (simplified - last 30 days)
  const cancelledSubs = await prisma.subscriptions.count({
    where: {
      status: 'CANCELLED',
      updated_at: { gte: thirtyDaysAgo },
    },
  });
  const churnRate = totalOrgs > 0 ? (cancelledSubs / totalOrgs) * 100 : 0;

  // Tier distribution
  const tierCounts = activeSubscriptions.reduce((acc: Record<string, number>, sub: Prisma.Subscription) => {
    const tier = sub.tier.toLowerCase() + 'Count';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total storage (placeholder - implement based on storage strategy)
  const totalStorage = BigInt(0); // TODO: Calculate from Supabase storage

  // Calculate API calls today (placeholder - implement with rate limiting tracking)
  const apiCalls = 0; // TODO: Get from rate limiting logs

  // Save metrics
  const metrics = await prisma.platform_metrics.create({
    data: {
      date: now,
      total_users: totalUsers,
      active_users: activeUsers,
      new_users: newUsers,
      total_orgs: totalOrgs,
      active_orgs: activeOrgs,
      new_orgs: newOrgs,
      mrr_cents: BigInt(mrrCents),
      arr_cents: BigInt(arrCents),
      churn_rate: churnRate,
      free_count: tierCounts.freeCount || 0,
      starter_count: tierCounts.starterCount || 0,
      growth_count: tierCounts.growthCount || 0,
      elite_count: tierCounts.eliteCount || 0,
      enterprise_count: tierCounts.enterpriseCount || 0,
      total_storage: totalStorage,
      api_calls: apiCalls,
    },
  });

  return metrics;
}

/**
 * Get metrics history (last N days)
 */
export async function getMetricsHistory(days: number = 30) {
  const user = await getCurrentUser();

  if (!user || !canViewPlatformMetrics(user.role)) {
    throw new Error('Unauthorized');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.platform_metrics.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });
}

/**
 * Helper: Get active subscription count
 */
async function getActiveSubscriptionCount(): Promise<number> {
  return await prisma.subscriptions.count({
    where: { status: 'ACTIVE' },
  });
}

/**
 * Helper: Get security alert count
 */
async function getSecurityAlertCount(): Promise<number> {
  return await prisma.system_alerts.count({
    where: {
      is_active: true,
      level: { in: ['CRITICAL', 'ERROR'] },
    },
  });
}

/**
 * Helper: Get super admin count
 */
async function getSuperAdminCount(): Promise<number> {
  return await prisma.users.count({
    where: { role: 'SUPER_ADMIN' },
  });
}

/**
 * Helper: Get database statistics
 */
async function getDatabaseStats() {
  // Get approximate record counts across key tables
  const [
    usersCount,
    orgsCount,
    projectsCount,
    transactionsCount,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.organizations.count(),
    prisma.projects.count(),
    prisma.transactions.count(),
  ]);

  const totalRecords = usersCount + orgsCount + projectsCount + transactionsCount;

  // Database size would require raw SQL query to PostgreSQL
  // Placeholder for now - implement with Supabase API
  const size = '0 GB';
  const dailyGrowth = '+0 MB';

  return {
    size,
    totalRecords,
    dailyGrowth,
  };
}
