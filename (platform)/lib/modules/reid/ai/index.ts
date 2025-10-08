/**
 * REID AI Module
 *
 * AI-powered neighborhood analysis and investment recommendations
 * Requires Elite subscription tier or higher
 */

// Server Actions
export {
  requestAIProfile,
  requestAIInsights,
  requestInvestmentRecommendations,
  regenerateAIProfile,
} from './actions';

// Schemas
export {
  AIProfileRequestSchema,
  AIInsightsRequestSchema,
  InvestmentRecommendationSchema,
  AIServiceResponseSchema,
  AnalysisType,
} from './schemas';

// Types
export type {
  AIProfileRequest,
  AIInsightsRequest,
  InvestmentRecommendationRequest,
  AIServiceResponse,
} from './schemas';

// Service functions (not exported - internal use only)
// - generateNeighborhoodProfile (profile-generator.ts)
// - extractKeyInsights (profile-generator.ts)
// - analyzeMultipleAreas (insights-analyzer.ts)
// - generateInvestmentRecommendations (insights-analyzer.ts)
