'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getQuickActions() {
  const user = await requireAuth();

  const actions = await prisma.quick_actions.findMany({
    where: {
      OR: [
        { organization_id: user.organizationId },
        { organization_id: null }, // System actions
      ],
      is_enabled: true,
    },
    orderBy: { sort_order: 'asc' },
  });

  // Filter by user role and tier
  return actions.filter(action => {
    // Check role requirements
    if (action.required_role.length > 0) {
      const hasRole = action.required_role.includes(user.organizationRole);
      if (!hasRole) return false;
    }

    // Check tier requirements
    if (action.required_tier.length > 0) {
      const hasTier = action.required_tier.includes(user.subscriptionTier || 'FREE');
      if (!hasTier) return false;
    }

    return true;
  });
}

export async function getQuickActionById(id: string) {
  const user = await requireAuth();

  const action = await prisma.quick_actions.findUnique({
    where: { id },
  });

  if (!action) {
    throw new Error('Quick action not found');
  }

  // Verify access
  if (action.organization_id && action.organization_id !== user.organizationId) {
    throw new Error('Unauthorized');
  }

  return action;
}
