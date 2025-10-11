'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  canManageUsers,
  canManageOrganizations,
  canManageFeatureFlags,
  canManageSystemAlerts,
} from '@/lib/auth/rbac';
import { cache } from 'react';

/**
 * Get all users (admin only)
 */
export const getAllUsers = cache(async function(filters?: {
  role?: string;
  subscriptionTier?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const user = await getCurrentUser();

  if (!user || !canManageUsers(user.role)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (filters?.role) where.role = filters.role;
  if (filters?.subscriptionTier) where.subscription_tier = filters.subscriptionTier;
  if (filters?.isActive !== undefined) where.is_active = filters.isActive;

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      include: {
        organization_members: {
          include: {
            organizations: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.users.count({ where }),
  ]);

  return { users, total };
});

/**
 * Get all organizations (admin only)
 */
export const getAllOrganizations = cache(async function(filters?: {
  subscriptionTier?: string;
  subscriptionStatus?: string;
  limit?: number;
  offset?: number;
}) {
  const user = await getCurrentUser();

  if (!user || !canManageOrganizations(user.role)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  const subscriptionWhere: any = {};

  if (filters?.subscriptionTier) {
    subscriptionWhere.tier = filters.subscriptionTier;
  }
  if (filters?.subscriptionStatus) {
    subscriptionWhere.status = filters.subscriptionStatus;
  }

  // Only apply subscription filter if needed
  if (Object.keys(subscriptionWhere).length > 0) {
    where.subscriptions = subscriptionWhere;
  }

  const [orgs, total] = await Promise.all([
    prisma.organizations.findMany({
      where,
      include: {
        _count: {
          select: { organization_members: true },
        },
        subscriptions: {
          select: {
            tier: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.organizations.count({ where }),
  ]);

  // Transform to match expected format
  const organizations = orgs.map(org => ({
    id: org.id,
    name: org.name,
    website: org.website || '',
    member_count: org._count.organization_members,
    subscription_tier: org.subscriptions?.tier || 'FREE',
    subscription_status: org.subscriptions?.status || 'INACTIVE',
    monthly_revenue: getMonthlyRevenue(org.subscriptions?.tier),
    created_at: org.created_at.toISOString(),
    updated_at: org.updated_at.toISOString(),
  }));

  return { organizations, total };
});

/**
 * Helper: Get monthly revenue for a tier
 */
function getMonthlyRevenue(tier?: string): number {
  if (!tier) return 0;
  const pricing: Record<string, number> = {
    FREE: 0,
    CUSTOM: 0,
    STARTER: 299,
    GROWTH: 699,
    ELITE: 999,
    ENTERPRISE: 0,
  };
  return pricing[tier] || 0;
}

/**
 * Get all feature flags
 */
export const getAllFeatureFlags = cache(async function(environment?: string) {
  const user = await getCurrentUser();

  if (!user || !canManageFeatureFlags(user.role)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (environment) where.environment = environment;

  return await prisma.feature_flags.findMany({
    where,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
});

/**
 * Get active system alerts
 */
export const getActiveSystemAlerts = cache(async function() {
  const user = await getCurrentUser();

  if (!user || !canManageSystemAlerts(user.role)) {
    throw new Error('Unauthorized');
  }

  const now = new Date();

  return await prisma.system_alerts.findMany({
    where: {
      is_active: true,
      starts_at: { lte: now },
      OR: [
        { ends_at: null },
        { ends_at: { gte: now } },
      ],
    },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
});
