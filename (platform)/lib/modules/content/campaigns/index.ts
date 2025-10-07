/**
 * Campaign Module - Public API
 *
 * Centralized exports for campaign management functionality.
 */

// Actions
export {
  createCampaign,
  updateCampaign,
  createEmailCampaign,
  createSocialPost,
  updateCampaignStatus,
  sendEmailCampaign,
  publishSocialPost,
  deleteCampaign,
} from './actions';

// Queries
export {
  getCampaigns,
  getCampaignById,
  getCampaignMetrics,
  getEmailCampaigns,
  getSocialPosts,
  getEmailCampaignById,
  getSocialPostById,
} from './queries';

// Schemas
export {
  CampaignSchema,
  EmailCampaignSchema,
  SocialPostSchema,
  UpdateCampaignSchema,
  CampaignFiltersSchema,
  type CampaignInput,
  type EmailCampaignInput,
  type SocialPostInput,
  type UpdateCampaignInput,
  type CampaignFilters,
} from './schemas';
