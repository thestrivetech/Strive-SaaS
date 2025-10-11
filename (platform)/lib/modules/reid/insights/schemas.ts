import { z } from 'zod';

/**
 * Neighborhood Insight Input Schema
 * Based on neighborhood_insights Prisma model
 */
export const NeighborhoodInsightSchema = z.object({
  // Geographic Info
  areaCode: z.string().min(1).max(50),
  areaName: z.string().min(1).max(200),
  areaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']),
  zipCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  county: z.string().max(100).optional(),

  // Market Data
  medianPrice: z.number().positive().optional(),
  avgPrice: z.number().positive().optional(),
  pricePerSqft: z.number().positive().optional(),
  priceChange: z.number().optional(), // Can be negative
  daysOnMarket: z.number().int().nonnegative().optional(),
  inventory: z.number().int().nonnegative().optional(),

  // Demographics
  medianAge: z.number().positive().optional(),
  medianIncome: z.number().positive().optional(),
  households: z.number().int().nonnegative().optional(),

  // Quality of Life
  schoolRating: z.number().min(0).max(10).optional(),
  walkScore: z.number().int().min(0).max(100).optional(),
  bikeScore: z.number().int().min(0).max(100).optional(),
  crimeIndex: z.string().max(50).optional(),
  parkProximity: z.number().nonnegative().optional(),
  commuteTime: z.number().int().nonnegative().optional(),

  // Investment Metrics
  rentYield: z.number().optional(),
  appreciationRate: z.number().optional(),
  investmentGrade: z.string().max(20).optional(),

  // Metadata
  dataSource: z.string().max(100).optional(),
});

export type NeighborhoodInsightInput = z.infer<typeof NeighborhoodInsightSchema>;

/**
 * Insight Filters Schema (for query filtering)
 */
export const InsightFiltersSchema = z.object({
  areaCodes: z.array(z.string()).optional(),
  areaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minWalkScore: z.number().int().min(0).max(100).optional(),
  minSchoolRating: z.number().min(0).max(10).optional(),
});

export type InsightFilters = z.infer<typeof InsightFiltersSchema>;
