'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';

/**
 * Get all AI profiles for the current organization with optional filters
 *
 * @param filters - Optional filters for profile type, user, verification status
 * @returns Array of AI profiles filtered by organization
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const profiles = await getAIProfiles({ profileType: 'PROPERTY', isVerified: true });
 */
export async function getAIProfiles(filters?: {
  profileType?: string;
  userId?: string;
  isVerified?: boolean;
  isPublic?: boolean;
  targetType?: string;
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      ...(filters?.profileType && {
        profile_type: filters.profileType
      }),
      ...(filters?.userId && {
        user_id: filters.userId
      }),
      ...(filters?.isVerified !== undefined && {
        is_verified: filters.isVerified
      }),
      ...(filters?.isPublic !== undefined && {
        is_public: filters.isPublic
      }),
      ...(filters?.targetType && {
        target_type: filters.targetType
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Get a single AI profile by ID
 * Enforces organization ownership and increments view count
 *
 * @param id - Profile ID
 * @returns AI profile with user details
 * @throws Error if profile not found or user lacks access
 *
 * @example
 * const profile = await getAIProfileById('profile-uuid-123');
 */
export async function getAIProfileById(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const profile = await prisma.reid_ai_profiles.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!profile) {
    throw new Error('AI Profile not found');
  }

  // Increment view count and update last_viewed_at
  await prisma.reid_ai_profiles.update({
    where: { id },
    data: {
      view_count: { increment: 1 },
      last_viewed_at: new Date()
    }
  });

  return profile;
}

/**
 * Get AI profiles by location (zip code, city, state, county, neighborhood)
 * Useful for location-based property analysis
 *
 * @param location - Location filters
 * @returns Array of AI profiles matching location criteria
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const profiles = await getAIProfilesByLocation({ zipCode: '90210', city: 'Beverly Hills' });
 */
export async function getAIProfilesByLocation(location: {
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
  neighborhood?: string;
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      ...(location.zipCode && {
        zip_code: location.zipCode
      }),
      ...(location.city && {
        city: {
          contains: location.city,
          mode: 'insensitive' as const
        }
      }),
      ...(location.state && {
        state: location.state
      }),
      ...(location.county && {
        county: {
          contains: location.county,
          mode: 'insensitive' as const
        }
      }),
      ...(location.neighborhood && {
        neighborhood: {
          contains: location.neighborhood,
          mode: 'insensitive' as const
        }
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Get AI profiles by score thresholds
 * Filter profiles by investment, lifestyle, or overall scores
 *
 * @param scoreFilters - Score threshold filters
 * @returns Array of AI profiles matching score criteria
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const highInvestmentProfiles = await getAIProfilesByScore({ minInvestmentScore: 8.0 });
 */
export async function getAIProfilesByScore(scoreFilters: {
  minOverallScore?: number;
  maxOverallScore?: number;
  minInvestmentScore?: number;
  maxInvestmentScore?: number;
  minLifestyleScore?: number;
  maxLifestyleScore?: number;
  minGrowthPotential?: number;
  maxGrowthPotential?: number;
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      ...(scoreFilters.minOverallScore && {
        overall_score: { gte: scoreFilters.minOverallScore }
      }),
      ...(scoreFilters.maxOverallScore && {
        overall_score: { lte: scoreFilters.maxOverallScore }
      }),
      ...(scoreFilters.minInvestmentScore && {
        investment_score: { gte: scoreFilters.minInvestmentScore }
      }),
      ...(scoreFilters.maxInvestmentScore && {
        investment_score: { lte: scoreFilters.maxInvestmentScore }
      }),
      ...(scoreFilters.minLifestyleScore && {
        lifestyle_score: { gte: scoreFilters.minLifestyleScore }
      }),
      ...(scoreFilters.maxLifestyleScore && {
        lifestyle_score: { lte: scoreFilters.maxLifestyleScore }
      }),
      ...(scoreFilters.minGrowthPotential && {
        growth_potential: { gte: scoreFilters.minGrowthPotential }
      }),
      ...(scoreFilters.maxGrowthPotential && {
        growth_potential: { lte: scoreFilters.maxGrowthPotential }
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { overall_score: 'desc' }
  });
}

/**
 * Get AI profile statistics for dashboard
 * Returns aggregate stats (total, avg scores, verification rate, etc.)
 *
 * @returns Dashboard statistics
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const stats = await getAIProfileStats();
 * // { totalProfiles: 150, avgOverallScore: 7.8, verifiedCount: 120, ... }
 */
export async function getAIProfileStats() {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const [totalProfiles, verifiedProfiles, publicProfiles, scoreAggregates] = await Promise.all([
    prisma.reid_ai_profiles.count({
      where: { organization_id: user.organizationId }
    }),
    prisma.reid_ai_profiles.count({
      where: {
        organization_id: user.organizationId,
        is_verified: true
      }
    }),
    prisma.reid_ai_profiles.count({
      where: {
        organization_id: user.organizationId,
        is_public: true
      }
    }),
    prisma.reid_ai_profiles.aggregate({
      where: { organization_id: user.organizationId },
      _avg: {
        overall_score: true,
        investment_score: true,
        lifestyle_score: true,
        growth_potential: true,
        risk_score: true,
        confidence_score: true
      },
      _max: {
        overall_score: true,
        investment_score: true
      },
      _min: {
        overall_score: true,
        investment_score: true
      }
    })
  ]);

  return {
    totalProfiles,
    verifiedProfiles,
    publicProfiles,
    verificationRate: totalProfiles > 0
      ? ((verifiedProfiles / totalProfiles) * 100).toFixed(2)
      : '0.00',
    avgOverallScore: scoreAggregates._avg.overall_score?.toFixed(2) || null,
    avgInvestmentScore: scoreAggregates._avg.investment_score?.toFixed(2) || null,
    avgLifestyleScore: scoreAggregates._avg.lifestyle_score?.toFixed(2) || null,
    avgGrowthPotential: scoreAggregates._avg.growth_potential?.toFixed(2) || null,
    avgRiskScore: scoreAggregates._avg.risk_score?.toFixed(2) || null,
    avgConfidenceScore: scoreAggregates._avg.confidence_score?.toFixed(2) || null,
    maxOverallScore: scoreAggregates._max.overall_score,
    minOverallScore: scoreAggregates._min.overall_score,
    maxInvestmentScore: scoreAggregates._max.investment_score,
    minInvestmentScore: scoreAggregates._min.investment_score
  };
}

/**
 * Get recently viewed AI profiles
 * Returns profiles ordered by last_viewed_at
 *
 * @param limit - Number of profiles to return (default: 10)
 * @returns Array of recently viewed AI profiles
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const recentProfiles = await getRecentlyViewedProfiles(5);
 */
export async function getRecentlyViewedProfiles(limit: number = 10) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      last_viewed_at: { not: null }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { last_viewed_at: 'desc' },
    take: limit
  });
}

/**
 * Get AI profiles by tags
 * Filter profiles by tags array
 *
 * @param tags - Array of tags to filter by
 * @param matchAll - If true, profile must have ALL tags; if false, ANY tag (default: false)
 * @returns Array of AI profiles matching tag criteria
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const profiles = await getAIProfilesByTags(['high-roi', 'waterfront'], true);
 */
export async function getAIProfilesByTags(tags: string[], matchAll: boolean = false) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      tags: matchAll
        ? { hasEvery: tags }
        : { hasSome: tags }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Get expired AI profiles
 * Returns profiles where expires_at is in the past
 *
 * @returns Array of expired AI profiles
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const expiredProfiles = await getExpiredProfiles();
 */
export async function getExpiredProfiles() {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      expires_at: {
        lt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { expires_at: 'asc' }
  });
}

/**
 * Get AI profiles needing refresh
 * Returns profiles where last_refreshed_at is older than specified days
 *
 * @param daysOld - Number of days since last refresh (default: 30)
 * @returns Array of AI profiles needing refresh
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const staleProfiles = await getProfilesNeedingRefresh(7); // 7 days old
 */
export async function getProfilesNeedingRefresh(daysOld: number = 30) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await prisma.reid_ai_profiles.findMany({
    where: {
      organization_id: user.organizationId,
      OR: [
        { last_refreshed_at: null },
        { last_refreshed_at: { lt: cutoffDate } }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { last_refreshed_at: 'asc' }
  });
}
