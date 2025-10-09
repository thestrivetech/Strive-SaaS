'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID, canAccessFeature } from '@/lib/auth/rbac';
import {
  AIProfileRequestSchema,
  AIInsightsRequestSchema,
  InvestmentRecommendationSchema,
  type AIProfileRequest,
  type AIInsightsRequest,
  type InvestmentRecommendationRequest,
} from './schemas';
import { generateNeighborhoodProfile, extractKeyInsights } from './profile-generator';
import { analyzeMultipleAreas, generateInvestmentRecommendations } from './insights-analyzer';

/**
 * Request AI-generated neighborhood profile
 *
 * Requires Elite subscription tier
 * Generates comprehensive AI profile and saves to database
 *
 * @param input - Profile request parameters
 * @returns Updated neighborhood insight with AI profile
 */
export async function requestAIProfile(input: AIProfileRequest) {
  const user = await requireAuth();

  // Check REID access
  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Check Elite tier for AI features
  if (!canAccessFeature(user, 'reid-ai')) {
    throw new Error('Upgrade required: AI features require Elite subscription or higher');
  }

  // Validate input
  const validated = AIProfileRequestSchema.parse({
    ...input,
    organizationId: user.organizationId,
  });

  // Get existing neighborhood insight
  const insight = await prisma.neighborhood_insights.findFirst({
    where: {
      area_code: validated.areaCode,
      organization_id: user.organizationId,
    },
  });

  if (!insight) {
    throw new Error(`Neighborhood insight not found for area code: ${validated.areaCode}`);
  }

  // Generate AI profile
  const aiProfile = await generateNeighborhoodProfile(insight, {
    includeMarketAnalysis: validated.includeMarketAnalysis,
    includeDemographics: validated.includeDemographics,
    includeAmenities: validated.includeAmenities,
    includeInvestmentPotential: validated.includeInvestmentPotential,
  });

  // Extract key insights
  const aiInsights = await extractKeyInsights(insight);

  // Update neighborhood insight with AI-generated content
  const updated = await prisma.neighborhood_insights.update({
    where: { id: insight.id },
    data: {
      ai_profile: aiProfile,
      ai_insights: aiInsights,
      updated_at: new Date(),
    },
  });

  // Revalidate relevant paths
  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/insights');
  revalidatePath(`/real-estate/reid/insights/${insight.id}`);

  return updated;
}

/**
 * Request AI-powered multi-area insights analysis
 *
 * Requires Elite subscription tier
 * Compares 2-5 neighborhoods and provides comparative analysis
 *
 * @param input - Analysis request parameters
 * @returns AI-generated comparative analysis
 */
export async function requestAIInsights(input: AIInsightsRequest) {
  const user = await requireAuth();

  // Check REID access
  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Check Elite tier for AI features
  if (!canAccessFeature(user, 'reid-ai')) {
    throw new Error('Upgrade required: AI features require Elite subscription or higher');
  }

  // Validate input
  const validated = AIInsightsRequestSchema.parse({
    ...input,
    organizationId: user.organizationId,
  });

  if (validated.areaCodes.length < 2 || validated.areaCodes.length > 5) {
    throw new Error('Analysis requires 2-5 area codes');
  }

  // Get neighborhood insights for all area codes
  const insights = await prisma.neighborhood_insights.findMany({
    where: {
      area_code: { in: validated.areaCodes },
      organization_id: user.organizationId,
    },
  });

  if (insights.length !== validated.areaCodes.length) {
    const foundCodes = insights.map(i => i.area_code);
    const missingCodes = validated.areaCodes.filter(code => !foundCodes.includes(code));
    throw new Error(`Neighborhood insights not found for area codes: ${missingCodes.join(', ')}`);
  }

  // Generate comparative analysis
  const analysis = await analyzeMultipleAreas(insights, validated.analysisType);

  return {
    analysis,
    areas: insights.map(i => ({
      areaCode: i.area_code,
      areaName: i.area_name,
    })),
    analysisType: validated.analysisType,
  };
}

/**
 * Request AI-powered investment recommendations
 *
 * Requires Elite subscription tier
 * Analyzes neighborhoods and generates personalized investment recommendations
 *
 * @param input - Recommendation request parameters
 * @returns AI-generated investment recommendations
 */
export async function requestInvestmentRecommendations(input: InvestmentRecommendationRequest) {
  const user = await requireAuth();

  // Check REID access
  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Check Elite tier for AI features
  if (!canAccessFeature(user, 'reid-ai')) {
    throw new Error('Upgrade required: AI features require Elite subscription or higher');
  }

  // Validate input
  const validated = InvestmentRecommendationSchema.parse({
    ...input,
    organizationId: user.organizationId,
  });

  // Build query for neighborhood insights
  const whereClause: any = {
    organization_id: user.organizationId,
  };

  // Filter by specific area codes if provided
  if (validated.areaCodes && validated.areaCodes.length > 0) {
    whereClause.area_code = { in: validated.areaCodes };
  }

  // Filter by budget if provided
  if (validated.budgetMin || validated.budgetMax) {
    whereClause.median_price = {};
    if (validated.budgetMin) {
      whereClause.median_price.gte = validated.budgetMin;
    }
    if (validated.budgetMax) {
      whereClause.median_price.lte = validated.budgetMax;
    }
  }

  // Get matching neighborhood insights
  const insights = await prisma.neighborhood_insights.findMany({
    where: whereClause,
    orderBy: [
      { investment_grade: 'asc' }, // A, B, C, D ordering
      { rent_yield: 'desc' }, // Higher yield first
    ],
    take: 10, // Limit to top 10 areas for analysis
  });

  if (insights.length === 0) {
    throw new Error('No neighborhoods found matching your criteria');
  }

  // Generate investment recommendations
  const recommendations = await generateInvestmentRecommendations(insights, {
    budgetMin: validated.budgetMin,
    budgetMax: validated.budgetMax,
    targetROI: validated.targetROI,
    riskTolerance: validated.riskTolerance,
  });

  return {
    recommendations,
    analyzedAreas: insights.length,
    areas: insights.map(i => ({
      areaCode: i.area_code,
      areaName: i.area_name,
      medianPrice: i.median_price?.toNumber(),
      rentYield: i.rent_yield,
      investmentGrade: i.investment_grade,
    })),
    criteria: {
      budgetMin: validated.budgetMin,
      budgetMax: validated.budgetMax,
      targetROI: validated.targetROI,
      riskTolerance: validated.riskTolerance,
    },
  };
}

/**
 * Regenerate AI profile for existing neighborhood
 *
 * Requires Elite subscription tier
 * Useful when neighborhood data has been updated
 *
 * @param insightId - Neighborhood insight ID
 * @returns Updated neighborhood insight
 */
export async function regenerateAIProfile(insightId: string) {
  const user = await requireAuth();

  // Check REID access
  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  // Check Elite tier for AI features
  if (!canAccessFeature(user, 'reid-ai')) {
    throw new Error('Upgrade required: AI features require Elite subscription or higher');
  }

  // Get neighborhood insight (verify org ownership)
  const insight = await prisma.neighborhood_insights.findFirst({
    where: {
      id: insightId,
      organization_id: user.organizationId,
    },
  });

  if (!insight) {
    throw new Error('Neighborhood insight not found');
  }

  // Regenerate AI profile with all sections
  const aiProfile = await generateNeighborhoodProfile(insight, {
    includeMarketAnalysis: true,
    includeDemographics: true,
    includeAmenities: true,
    includeInvestmentPotential: true,
  });

  // Extract fresh key insights
  const aiInsights = await extractKeyInsights(insight);

  // Update database
  const updated = await prisma.neighborhood_insights.update({
    where: { id: insight.id },
    data: {
      ai_profile: aiProfile,
      ai_insights: aiInsights,
      updated_at: new Date(),
    },
  });

  // Revalidate paths
  revalidatePath('/real-estate/reid/reid-dashboard');
  revalidatePath('/real-estate/reid/insights');
  revalidatePath(`/real-estate/reid/insights/${insight.id}`);

  return updated;
}
