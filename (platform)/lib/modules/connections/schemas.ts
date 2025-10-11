import { z } from 'zod';

/**
 * Connection Provider Types
 */
export const ConnectionProviderEnum = z.enum([
  'GOOGLE',
  'FACEBOOK',
  'TWITTER',
  'INSTAGRAM',
  'LINKEDIN',
  'YOUTUBE',
  'TIKTOK',
  'GITHUB',
  'MICROSOFT',
]);

export type ConnectionProvider = z.infer<typeof ConnectionProviderEnum>;

/**
 * Connection Status Types
 */
export const ConnectionStatusEnum = z.enum([
  'CONNECTED',
  'DISCONNECTED',
  'ERROR',
  'EXPIRED',
]);

export type ConnectionStatus = z.infer<typeof ConnectionStatusEnum>;

/**
 * User Connection Schema
 */
export const UserConnectionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  provider: ConnectionProviderEnum,
  providerUserId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  scope: z.string().optional(),
  profileData: z.record(z.any()).optional(),
  status: ConnectionStatusEnum,
  isActive: z.boolean(),
  lastSynced: z.date().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserConnection = z.infer<typeof UserConnectionSchema>;

/**
 * Create Connection Input Schema
 */
export const CreateConnectionSchema = z.object({
  provider: ConnectionProviderEnum,
  providerUserId: z.string().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  scope: z.string().optional(),
  profileData: z.record(z.any()).optional(),
});

export type CreateConnectionInput = z.infer<typeof CreateConnectionSchema>;

/**
 * Update Connection Input Schema
 */
export const UpdateConnectionSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  scope: z.string().optional(),
  profileData: z.record(z.any()).optional(),
  status: ConnectionStatusEnum.optional(),
  isActive: z.boolean().optional(),
  lastSynced: z.date().optional(),
  errorMessage: z.string().optional(),
});

export type UpdateConnectionInput = z.infer<typeof UpdateConnectionSchema>;

/**
 * OAuth Callback Data Schema
 */
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
  errorDescription: z.string().optional(),
});

export type OAuthCallbackData = z.infer<typeof OAuthCallbackSchema>;

/**
 * Provider Config Schema
 */
export const ProviderConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  authorizationUrl: z.string(),
  tokenUrl: z.string(),
  userInfoUrl: z.string().optional(),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/**
 * Connection Capabilities
 * Defines what features each connection enables
 */
export const ConnectionCapabilities = {
  GOOGLE: [
    'Gmail access',
    'Google Calendar integration',
    'Google Drive access',
    'Contacts sync',
    'AI-powered email drafting',
  ],
  FACEBOOK: [
    'Auto-post to Facebook',
    'Engagement analytics',
    'Lead generation ads',
    'Messenger integration',
  ],
  TWITTER: [
    'Auto-tweet content',
    'Social listening',
    'Engagement tracking',
    'DM automation',
  ],
  INSTAGRAM: [
    'Auto-post stories & posts',
    'Engagement analytics',
    'Comment management',
    'Story highlights',
  ],
  LINKEDIN: [
    'Professional network sync',
    'Auto-post articles',
    'Lead generation',
    'Connection tracking',
  ],
  YOUTUBE: [
    'Video upload automation',
    'Analytics dashboard',
    'Comment management',
    'Thumbnail generation',
  ],
  TIKTOK: [
    'Auto-post videos',
    'Trending content insights',
    'Engagement tracking',
    'Hashtag optimization',
  ],
  GITHUB: [
    'Repository integration',
    'Code deployment',
    'Issue tracking',
    'CI/CD automation',
  ],
  MICROSOFT: [
    'Outlook calendar sync',
    'OneDrive access',
    'Teams integration',
    'Office 365 suite',
  ],
} as const;
