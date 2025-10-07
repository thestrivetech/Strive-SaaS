import { z } from 'zod';

/**
 * Campaign Module - Zod Validation Schemas
 *
 * Comprehensive validation for campaigns, email campaigns, and social media posts.
 * Includes scheduling, audience targeting, and multi-platform support.
 */

// Campaign schema for creation
export const CampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  type: z.enum([
    'CONTENT_MARKETING',
    'EMAIL_MARKETING',
    'SOCIAL_MEDIA',
    'PAID_ADVERTISING',
    'SEO_CAMPAIGN',
    'LEAD_GENERATION',
    'BRAND_AWARENESS',
    'PRODUCT_LAUNCH',
  ]),
  status: z.enum(['DRAFT', 'PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().default('UTC'),
  budget: z.number().positive('Budget must be positive').optional(),
  goalType: z.string().max(100).optional(),
  goalValue: z.number().optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

// Email campaign schema
export const EmailCampaignSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  preheader: z.string().max(150, 'Preheader too long').optional(),
  content: z.string().min(1, 'Email content is required'),
  plainText: z.string().optional(),
  fromName: z.string().min(1, 'From name is required'),
  fromEmail: z.string().email('Invalid email address'),
  replyTo: z.string().email('Invalid reply-to email').optional(),
  audienceSegment: z.record(z.any()).optional(),
  scheduledFor: z.coerce.date().optional(),
  campaignId: z.string().uuid('Invalid campaign ID').optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

// Social media post schema
export const SocialPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000, 'Content too long'),
  mediaUrls: z.array(z.string().url('Invalid media URL')).default([]),
  platforms: z.array(
    z.enum(['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'PINTEREST'])
  ).min(1, 'At least one platform is required'),
  scheduledFor: z.coerce.date().optional(),
  campaignId: z.string().uuid('Invalid campaign ID').optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

// Update campaign schema (all fields optional except ID)
export const UpdateCampaignSchema = CampaignSchema.partial().extend({
  id: z.string().uuid('Invalid campaign ID'),
});

// Campaign filters for querying
export const CampaignFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum([
    'CONTENT_MARKETING',
    'EMAIL_MARKETING',
    'SOCIAL_MEDIA',
    'PAID_ADVERTISING',
    'SEO_CAMPAIGN',
    'LEAD_GENERATION',
    'BRAND_AWARENESS',
    'PRODUCT_LAUNCH',
  ]).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// Type exports
export type CampaignInput = z.infer<typeof CampaignSchema>;
export type EmailCampaignInput = z.infer<typeof EmailCampaignSchema>;
export type SocialPostInput = z.infer<typeof SocialPostSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type CampaignFilters = z.infer<typeof CampaignFiltersSchema>;
