'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';
import {
  InsightFiltersSchema,
  type InsightFilters
} from './schemas';

export async function getNeighborhoodInsights(filters?: InsightFilters) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Validate filters if provided
  const validatedFilters = filters ? InsightFiltersSchema.parse(filters) : {};

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      ...(validatedFilters.areaCodes && {
        area_code: { in: validatedFilters.areaCodes }
      }),
      ...(validatedFilters.areaType && {
        area_type: validatedFilters.areaType
      }),
      ...(validatedFilters.minPrice && {
        median_price: { gte: validatedFilters.minPrice }
      }),
      ...(validatedFilters.maxPrice && {
        median_price: { lte: validatedFilters.maxPrice }
      }),
      ...(validatedFilters.minWalkScore && {
        walk_score: { gte: validatedFilters.minWalkScore }
      }),
      ...(validatedFilters.minSchoolRating && {
        school_rating: { gte: validatedFilters.minSchoolRating }
      }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: [
      { area_name: 'asc' }
    ]
  });
}

export async function getNeighborhoodInsightById(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const insight = await prisma.neighborhood_insights.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      alerts: true
    }
  });

  if (!insight) {
    throw new Error('Neighborhood insight not found');
  }

  return insight;
}

export async function getNeighborhoodInsightByAreaCode(areaCode: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.neighborhood_insights.findFirst({
    where: {
      area_code: areaCode,
      organization_id: user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });
}

export async function getInsightsStats() {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const [total, byType, recent] = await Promise.all([
    prisma.neighborhood_insights.count({
      where: { organization_id: user.organizationId }
    }),
    prisma.neighborhood_insights.groupBy({
      by: ['area_type'],
      where: { organization_id: user.organizationId },
      _count: true
    }),
    prisma.neighborhood_insights.findMany({
      where: { organization_id: user.organizationId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        area_name: true,
        area_code: true,
        median_price: true,
        created_at: true
      }
    })
  ]);

  return { total, byType, recent };
}

/**
 * Get neighborhood insights with schools data
 * Filters for areas that have school rating data and optionally filters by rating threshold
 *
 * @param filters - Optional filters for school ratings and location
 * @returns Array of neighborhood insights with school data
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const schoolAreas = await getSchoolsData({ minSchoolRating: 8.0, city: 'Santa Monica' });
 */
export async function getSchoolsData(filters?: {
  zipCode?: string;
  city?: string;
  state?: string;
  minSchoolRating?: number;
  maxSchoolRating?: number;
  minWalkScore?: number;
  sortBy?: 'school_rating' | 'median_price' | 'walk_score';
  sortOrder?: 'asc' | 'desc';
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const sortBy = filters?.sortBy || 'school_rating';
  const sortOrder = filters?.sortOrder || 'desc';

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      school_rating: { not: null }, // Only areas with school data
      ...(filters?.zipCode && {
        zip_code: filters.zipCode
      }),
      ...(filters?.city && {
        city: {
          contains: filters.city,
          mode: 'insensitive' as const
        }
      }),
      ...(filters?.state && {
        state: filters.state
      }),
      ...(filters?.minSchoolRating !== undefined && {
        school_rating: { gte: filters.minSchoolRating }
      }),
      ...(filters?.maxSchoolRating !== undefined && {
        school_rating: { lte: filters.maxSchoolRating }
      }),
      ...(filters?.minWalkScore !== undefined && {
        walk_score: { gte: filters.minWalkScore }
      }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { [sortBy]: sortOrder }
  });
}

/**
 * Get top-rated school areas
 * Returns neighborhoods with highest school ratings
 *
 * @param limit - Number of results to return (default: 10)
 * @param state - Optional state filter
 * @returns Array of top-rated school neighborhoods
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const topSchools = await getTopSchoolAreas(5, 'CA');
 */
export async function getTopSchoolAreas(limit: number = 10, state?: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      school_rating: { not: null },
      ...(state && { state })
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { school_rating: 'desc' },
    take: limit
  });
}

/**
 * Get neighborhood insights by lifestyle metrics
 * Filter by walk score, bike score, crime index, park proximity, commute time, school rating
 *
 * @param filters - Lifestyle metric filters
 * @returns Array of neighborhood insights matching lifestyle criteria
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const walkable = await getInsightsByLifestyleMetrics({
 *   minWalkScore: 80,
 *   minSchoolRating: 7.0,
 *   maxCommuteTime: 30
 * });
 */
export async function getInsightsByLifestyleMetrics(filters: {
  minWalkScore?: number;
  minBikeScore?: number;
  crimeIndex?: string;
  maxParkProximity?: number;
  maxCommuteTime?: number;
  minSchoolRating?: number;
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      ...(filters.minWalkScore !== undefined && {
        walk_score: { gte: filters.minWalkScore }
      }),
      ...(filters.minBikeScore !== undefined && {
        bike_score: { gte: filters.minBikeScore }
      }),
      ...(filters.crimeIndex && {
        crime_index: filters.crimeIndex
      }),
      ...(filters.maxParkProximity !== undefined && {
        park_proximity: { lte: filters.maxParkProximity }
      }),
      ...(filters.maxCommuteTime !== undefined && {
        commute_time: { lte: filters.maxCommuteTime }
      }),
      ...(filters.minSchoolRating !== undefined && {
        school_rating: { gte: filters.minSchoolRating }
      }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { walk_score: 'desc' },
      { school_rating: 'desc' }
    ]
  });
}

/**
 * Get neighborhood insights by investment metrics
 * Filter by price, appreciation rate, rent yield, and investment grade
 *
 * @param filters - Investment metric filters
 * @returns Array of neighborhood insights matching investment criteria
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const investments = await getInsightsByInvestmentMetrics({
 *   minAppreciationRate: 5.0,
 *   investmentGrade: 'A'
 * });
 */
export async function getInsightsByInvestmentMetrics(filters: {
  minMedianPrice?: number;
  maxMedianPrice?: number;
  minPricePerSqft?: number;
  maxPricePerSqft?: number;
  minAppreciationRate?: number;
  minRentYield?: number;
  investmentGrade?: string;
  maxDaysOnMarket?: number;
}) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      ...(filters.minMedianPrice !== undefined && {
        median_price: { gte: filters.minMedianPrice }
      }),
      ...(filters.maxMedianPrice !== undefined && {
        median_price: { lte: filters.maxMedianPrice }
      }),
      ...(filters.minPricePerSqft !== undefined && {
        price_per_sqft: { gte: filters.minPricePerSqft }
      }),
      ...(filters.maxPricePerSqft !== undefined && {
        price_per_sqft: { lte: filters.maxPricePerSqft }
      }),
      ...(filters.minAppreciationRate !== undefined && {
        appreciation_rate: { gte: filters.minAppreciationRate }
      }),
      ...(filters.minRentYield !== undefined && {
        rent_yield: { gte: filters.minRentYield }
      }),
      ...(filters.investmentGrade && {
        investment_grade: filters.investmentGrade
      }),
      ...(filters.maxDaysOnMarket !== undefined && {
        days_on_market: { lte: filters.maxDaysOnMarket }
      }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { appreciation_rate: 'desc' },
      { median_price: 'asc' }
    ]
  });
}

/**
 * Search neighborhood insights by name or area code
 *
 * @param searchTerm - Search term to match against area_name or area_code
 * @returns Array of matching neighborhood insights
 * @throws Error if user not authenticated or lacks REID access
 *
 * @example
 * const results = await searchNeighborhoodInsights('Beverly Hills');
 */
export async function searchNeighborhoodInsights(searchTerm: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      OR: [
        {
          area_name: {
            contains: searchTerm,
            mode: 'insensitive' as const
          }
        },
        {
          area_code: {
            contains: searchTerm,
            mode: 'insensitive' as const
          }
        }
      ]
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { area_name: 'asc' }
  });
}
