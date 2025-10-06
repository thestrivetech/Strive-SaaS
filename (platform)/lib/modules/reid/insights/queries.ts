'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';
import { InsightFiltersSchema } from './schemas';
import type { InsightFilters } from './schemas';

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
