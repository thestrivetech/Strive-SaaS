'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageOrganizations } from '@/lib/auth/rbac';
import { cache } from 'react';
import type { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

/**
 * Get all subscriptions with organization details
 */
export const getAllSubscriptions = cache(async function(filters?: {
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  limit?: number;
  offset?: number;
}) {
  const user = await getCurrentUser();

  if (!user || !canManageOrganizations(user.role)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (filters?.tier) where.tier = filters.tier;
  if (filters?.status) where.status = filters.status;

  const [subscriptions, total] = await Promise.all([
    prisma.subscriptions.findMany({
      where,
      include: {
        organizations: {
          select: {
            id: true,
            name: true,
            website: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.subscriptions.count({ where }),
  ]);

  // Transform to match expected format
  return {
    subscriptions: subscriptions.map(sub => ({
      id: sub.id,
      organization_id: sub.organization_id,
      organization_name: sub.organizations.name,
      tier: sub.tier,
      status: sub.status,
      billing_cycle: 'MONTHLY', // Default - add to schema if needed
      amount: getTierAmount(sub.tier), // Calculate from tier
      seats: 1, // Default - add seats tracking if needed
      start_date: sub.created_at.toISOString(),
      current_period_start: sub.current_period_start.toISOString(),
      current_period_end: sub.current_period_end.toISOString(),
      stripe_subscription_id: sub.stripe_subscription_id,
      stripe_customer_id: sub.stripe_customer_id,
      cancel_at_period_end: sub.cancel_at_period_end,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    })),
    total,
  };
});

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = cache(async function() {
  const user = await getCurrentUser();

  if (!user || !canManageOrganizations(user.role)) {
    throw new Error('Unauthorized');
  }

  const [
    total,
    activeCount,
    trialingCount,
    cancelledCount,
    pastDueCount,
    tierCounts,
  ] = await Promise.all([
    prisma.subscriptions.count(),
    prisma.subscriptions.count({ where: { status: 'ACTIVE' } }),
    prisma.subscriptions.count({ where: { status: 'TRIAL' } }),
    prisma.subscriptions.count({ where: { status: 'CANCELLED' } }),
    prisma.subscriptions.count({ where: { status: 'PAST_DUE' } }),
    prisma.subscriptions.groupBy({
      by: ['tier'],
      _count: true,
    }),
  ]);

  // Calculate retention rate (simplified)
  const retentionRate = total > 0
    ? ((activeCount / total) * 100).toFixed(1)
    : '0.0';

  return {
    total,
    active: activeCount,
    trialing: trialingCount,
    cancelled: cancelledCount,
    pastDue: pastDueCount,
    retentionRate: parseFloat(retentionRate),
    byTier: tierCounts.reduce((acc, { tier, _count }) => {
      acc[tier.toLowerCase()] = _count;
      return acc;
    }, {} as Record<string, number>),
  };
});

/**
 * Helper: Get tier pricing amount in cents
 */
function getTierAmount(tier: SubscriptionTier): number {
  const pricing: Record<SubscriptionTier, number> = {
    FREE: 0,
    CUSTOM: 0, // Pay-per-use
    STARTER: 29900, // $299
    GROWTH: 69900, // $699
    ELITE: 99900, // $999
    ENTERPRISE: 0, // Custom pricing
  };
  return pricing[tier] || 0;
}
