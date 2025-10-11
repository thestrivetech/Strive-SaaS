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

// Query functions
export {
  getAIProfiles,
  getAIProfileById,
  getAIProfilesByLocation,
  getAIProfilesByScore,
  getAIProfileStats,
  getRecentlyViewedProfiles,
  getAIProfilesByTags,
  getExpiredProfiles,
  getProfilesNeedingRefresh,
} from './queries';

// Service functions (not exported - internal use only)
// - generateNeighborhoodProfile (profile-generator.ts)
// - extractKeyInsights (profile-generator.ts)
// - analyzeMultipleAreas (insights-analyzer.ts)
// - generateInvestmentRecommendations (insights-analyzer.ts)
