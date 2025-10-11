'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID, canAccessFeature } from '@/lib/auth/rbac';
import {
  NeighborhoodInsightSchema,
  type NeighborhoodInsightInput
} from './schemas';

export async function createNeighborhoodInsight(input: NeighborhoodInsightInput) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  if (!canAccessFeature(user, 'reid')) {
    throw new Error('Upgrade required: REID features not available in your plan');
  }

  const validated = NeighborhoodInsightSchema.parse(input);

  const insight = await prisma.neighborhood_insights.create({
    data: {
      // Geographic Info
      area_code: validated.areaCode,
      area_name: validated.areaName,
      area_type: validated.areaType,
      zip_code: validated.zipCode,
      city: validated.city,
      state: validated.state,
      county: validated.county,

      // Market Data
      median_price: validated.medianPrice,
      avg_price: validated.avgPrice,
      price_per_sqft: validated.pricePerSqft,
      price_change: validated.priceChange,
      days_on_market: validated.daysOnMarket,
      inventory: validated.inventory,

      // Demographics
      median_age: validated.medianAge,
      median_income: validated.medianIncome,
      households: validated.households,

      // Quality of Life
      school_rating: validated.schoolRating,
      walk_score: validated.walkScore,
      bike_score: validated.bikeScore,
      crime_index: validated.crimeIndex,
      park_proximity: validated.parkProximity,
      commute_time: validated.commuteTime,

      // Investment Metrics
      rent_yield: validated.rentYield,
      appreciation_rate: validated.appreciationRate,
      investment_grade: validated.investmentGrade,

      // Metadata
      data_source: validated.dataSource,
      organization_id: user.organizationId,
      created_by_id: user.id,
    }
  });

  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/insights');

  return insight;
}

export async function updateNeighborhoodInsight(
  id: string,
  input: Partial<NeighborhoodInsightInput>
) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Verify ownership
  const existing = await prisma.neighborhood_insights.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Neighborhood insight not found');
  }

  const validated = NeighborhoodInsightSchema.partial().parse(input);

  const updated = await prisma.neighborhood_insights.update({
    where: { id },
    data: {
      // Geographic Info
      ...(validated.areaCode && { area_code: validated.areaCode }),
      ...(validated.areaName && { area_name: validated.areaName }),
      ...(validated.areaType && { area_type: validated.areaType }),
      ...(validated.zipCode && { zip_code: validated.zipCode }),
      ...(validated.city && { city: validated.city }),
      ...(validated.state && { state: validated.state }),
      ...(validated.county && { county: validated.county }),

      // Market Data
      ...(validated.medianPrice !== undefined && { median_price: validated.medianPrice }),
      ...(validated.avgPrice !== undefined && { avg_price: validated.avgPrice }),
      ...(validated.pricePerSqft !== undefined && { price_per_sqft: validated.pricePerSqft }),
      ...(validated.priceChange !== undefined && { price_change: validated.priceChange }),
      ...(validated.daysOnMarket !== undefined && { days_on_market: validated.daysOnMarket }),
      ...(validated.inventory !== undefined && { inventory: validated.inventory }),

      // Demographics
      ...(validated.medianAge !== undefined && { median_age: validated.medianAge }),
      ...(validated.medianIncome !== undefined && { median_income: validated.medianIncome }),
      ...(validated.households !== undefined && { households: validated.households }),

      // Quality of Life
      ...(validated.schoolRating !== undefined && { school_rating: validated.schoolRating }),
      ...(validated.walkScore !== undefined && { walk_score: validated.walkScore }),
      ...(validated.bikeScore !== undefined && { bike_score: validated.bikeScore }),
      ...(validated.crimeIndex && { crime_index: validated.crimeIndex }),
      ...(validated.parkProximity !== undefined && { park_proximity: validated.parkProximity }),
      ...(validated.commuteTime !== undefined && { commute_time: validated.commuteTime }),

      // Investment Metrics
      ...(validated.rentYield !== undefined && { rent_yield: validated.rentYield }),
      ...(validated.appreciationRate !== undefined && { appreciation_rate: validated.appreciationRate }),
      ...(validated.investmentGrade && { investment_grade: validated.investmentGrade }),

      // Metadata
      ...(validated.dataSource && { data_source: validated.dataSource }),
      updated_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath(`/real-estate/reid/insights/${id}`);

  return updated;
}

export async function deleteNeighborhoodInsight(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Verify ownership
  const existing = await prisma.neighborhood_insights.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Neighborhood insight not found');
  }

  await prisma.neighborhood_insights.delete({
    where: { id }
  });

  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/insights');
}
