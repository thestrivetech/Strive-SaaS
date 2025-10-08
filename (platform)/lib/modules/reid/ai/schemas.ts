import { z } from 'zod';

/**
 * AI Profile Generation Request Schema
 *
 * Generates a comprehensive AI-powered neighborhood profile
 */
export const AIProfileRequestSchema = z.object({
  areaCode: z.string().min(1).max(50),

  // Optional context for better profile generation
  includeMarketAnalysis: z.boolean().default(true),
  includeDemographics: z.boolean().default(true),
  includeAmenities: z.boolean().default(true),
  includeInvestmentPotential: z.boolean().default(true),

  // Organization context (set server-side)
  organizationId: z.string().uuid().optional(),
});

/**
 * Analysis Type for Multi-Area Insights
 */
export enum AnalysisType {
  INVESTMENT_COMPARISON = 'INVESTMENT_COMPARISON',
  MARKET_TRENDS = 'MARKET_TRENDS',
  DEMOGRAPHIC_ANALYSIS = 'DEMOGRAPHIC_ANALYSIS',
  AMENITY_COMPARISON = 'AMENITY_COMPARISON',
  COMPREHENSIVE = 'COMPREHENSIVE',
}

/**
 * AI Insights Request Schema
 *
 * Analyzes multiple neighborhoods and provides comparative insights
 */
export const AIInsightsRequestSchema = z.object({
  areaCodes: z.array(z.string().min(1).max(50)).min(2).max(5), // 2-5 areas for comparison
  analysisType: z.nativeEnum(AnalysisType).default(AnalysisType.COMPREHENSIVE),

  // Organization context (set server-side)
  organizationId: z.string().uuid().optional(),
});

/**
 * Investment Recommendation Request Schema
 *
 * Generates AI-powered investment recommendations based on criteria
 */
export const InvestmentRecommendationSchema = z.object({
  // Investment criteria
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  targetROI: z.number().min(0).max(100).optional(), // Percentage
  riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),

  // Location preferences
  areaCodes: z.array(z.string()).optional(), // Specific areas to analyze

  // Property preferences
  propertyTypes: z.array(z.string()).optional(), // e.g., ['residential', 'commercial']

  // Organization context (set server-side)
  organizationId: z.string().uuid().optional(),
});

/**
 * AI Service Response Schema
 *
 * Standard response from AI service
 */
export const AIServiceResponseSchema = z.object({
  success: z.boolean(),
  content: z.string(),
  tokensUsed: z.number().optional(),
  model: z.string().optional(),
  error: z.string().optional(),
});

// Type exports
export type AIProfileRequest = z.infer<typeof AIProfileRequestSchema>;
export type AIInsightsRequest = z.infer<typeof AIInsightsRequestSchema>;
export type InvestmentRecommendationRequest = z.infer<typeof InvestmentRecommendationSchema>;
export type AIServiceResponse = z.infer<typeof AIServiceResponseSchema>;