import { z } from 'zod';
import { AreaType } from '@prisma/client';

export const NeighborhoodInsightSchema = z.object({
  areaCode: z.string().min(1).max(50),
  areaName: z.string().min(1).max(255),
  areaType: z.nativeEnum(AreaType),

  // Market Data
  marketData: z.any().optional(),
  medianPrice: z.number().positive().optional(),
  daysOnMarket: z.number().int().min(0).optional(),
  inventory: z.number().int().min(0).optional(),
  priceChange: z.number().optional(),

  // Demographics
  demographics: z.any().optional(),
  medianAge: z.number().positive().optional(),
  medianIncome: z.number().positive().optional(),
  households: z.number().int().min(0).optional(),
  commuteTime: z.number().positive().optional(),

  // Amenities
  amenities: z.any().optional(),
  schoolRating: z.number().min(1).max(10).optional(),
  walkScore: z.number().int().min(0).max(100).optional(),
  bikeScore: z.number().int().min(0).max(100).optional(),
  crimeIndex: z.number().optional(),
  parkProximity: z.number().positive().optional(),

  // Location
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  boundary: z.any().optional(),

  // Investment
  roiAnalysis: z.any().optional(),
  rentYield: z.number().optional(),
  appreciationRate: z.number().optional(),
  investmentGrade: z.string().max(10).optional(),

  // AI
  aiProfile: z.string().optional(),
  aiInsights: z.array(z.string()).optional(),

  // Data Quality
  dataSource: z.array(z.string()).optional(),
  dataQuality: z.number().min(0).max(1).optional(),

  organizationId: z.string().uuid(),
});

export const InsightFiltersSchema = z.object({
  areaCodes: z.array(z.string()).optional(),
  areaType: z.nativeEnum(AreaType).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minWalkScore: z.number().int().min(0).max(100).optional(),
  minSchoolRating: z.number().min(1).max(10).optional(),
});

export type NeighborhoodInsightInput = z.infer<typeof NeighborhoodInsightSchema>;
export type InsightFilters = z.infer<typeof InsightFiltersSchema>;
