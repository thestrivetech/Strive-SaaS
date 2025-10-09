'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID, canAccessFeature } from '@/lib/auth/rbac';
import { NeighborhoodInsightSchema } from './schemas';
import type { NeighborhoodInsightInput } from './schemas';

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
      area_code: validated.areaCode,
      area_name: validated.areaName,
      area_type: validated.areaType,
      market_data: validated.marketData,
      median_price: validated.medianPrice,
      days_on_market: validated.daysOnMarket,
      inventory: validated.inventory,
      price_change: validated.priceChange,
      demographics: validated.demographics,
      median_age: validated.medianAge,
      median_income: validated.medianIncome,
      households: validated.households,
      commute_time: validated.commuteTime,
      amenities: validated.amenities,
      school_rating: validated.schoolRating,
      walk_score: validated.walkScore,
      bike_score: validated.bikeScore,
      crime_index: validated.crimeIndex,
      park_proximity: validated.parkProximity,
      latitude: validated.latitude,
      longitude: validated.longitude,
      boundary: validated.boundary,
      roi_analysis: validated.roiAnalysis,
      rent_yield: validated.rentYield,
      appreciation_rate: validated.appreciationRate,
      investment_grade: validated.investmentGrade,
      data_source: validated.dataSource,
      data_quality: validated.dataQuality,
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
      ...(validated.areaCode && { area_code: validated.areaCode }),
      ...(validated.areaName && { area_name: validated.areaName }),
      ...(validated.areaType && { area_type: validated.areaType }),
      ...(validated.marketData && { market_data: validated.marketData }),
      ...(validated.medianPrice !== undefined && { median_price: validated.medianPrice }),
      ...(validated.daysOnMarket !== undefined && { days_on_market: validated.daysOnMarket }),
      ...(validated.inventory !== undefined && { inventory: validated.inventory }),
      ...(validated.priceChange !== undefined && { price_change: validated.priceChange }),
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
