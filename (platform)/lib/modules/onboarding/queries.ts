'use server';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';

/**
 * Onboarding Module - Data Queries
 *
 * Retrieves onboarding session data
 */

// ============================================================================
// Session Queries
// ============================================================================

/**
 * Get onboarding session by token (cached)
 */
export const getSessionByToken = cache(async (sessionToken: string) => {
  return await prisma.onboarding_sessions.findUnique({
    where: { session_token: sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar_url: true,
        },
      },
    },
  });
});

/**
 * Get onboarding session by user ID
 */
export const getSessionByUserId = cache(async (userId: string) => {
  return await prisma.onboarding_sessions.findFirst({
    where: {
      user_id: userId,
      is_completed: false,
      expires_at: {
        gt: new Date(),
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
});

/**
 * Get active (non-expired, incomplete) sessions
 */
export const getActiveSessions = cache(async () => {
  return await prisma.onboarding_sessions.findMany({
    where: {
      is_completed: false,
      expires_at: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
});

/**
 * Get completed sessions with organization details
 */
export const getCompletedSessions = cache(async (limit = 50) => {
  return await prisma.onboarding_sessions.findMany({
    where: {
      is_completed: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      completed_at: 'desc',
    },
    take: limit,
  });
});

/**
 * Get session statistics
 */
export const getSessionStats = cache(async () => {
  const [total, active, completed, expired] = await Promise.all([
    // Total sessions
    prisma.onboarding_sessions.count(),

    // Active sessions (not expired, not completed)
    prisma.onboarding_sessions.count({
      where: {
        is_completed: false,
        expires_at: {
          gt: new Date(),
        },
      },
    }),

    // Completed sessions
    prisma.onboarding_sessions.count({
      where: {
        is_completed: true,
      },
    }),

    // Expired sessions (not completed)
    prisma.onboarding_sessions.count({
      where: {
        is_completed: false,
        expires_at: {
          lt: new Date(),
        },
      },
    }),
  ]);

  const conversionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    active,
    completed,
    expired,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
});

/**
 * Get sessions by payment status
 */
export const getSessionsByPaymentStatus = cache(
  async (status: 'PENDING' | 'SUCCEEDED' | 'FAILED') => {
    return await prisma.onboarding_sessions.findMany({
      where: {
        payment_status: status,
        is_completed: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }
);
