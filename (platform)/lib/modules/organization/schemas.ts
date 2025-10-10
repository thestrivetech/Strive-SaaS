/**
 * Organization schemas for organization management
 * Provides Zod validation schemas for organization operations
 */

import { z } from 'zod';

/**
 * Organization role enum (maps to Prisma OrgRole)
 */
export const OrganizationRole = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

/**
 * Organization industry enum
 */
export const OrganizationIndustry = z.enum([
  'REAL_ESTATE',
  'HEALTHCARE',
  'LEGAL',
  'CONSTRUCTION',
  'FINANCE',
  'TECHNOLOGY',
  'OTHER'
]);

/**
 * Subscription tier enum
 */
export const SubscriptionTier = z.enum([
  'FREE',
  'CUSTOM',
  'STARTER',
  'GROWTH',
  'ELITE',
  'ENTERPRISE'
]);

/**
 * Organization schema for creation
 */
export const OrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200, 'Name too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().optional(),
  industry: OrganizationIndustry.default('REAL_ESTATE'),
  website: z.string().url('Invalid website URL').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  subscriptionTier: SubscriptionTier.default('FREE'),
  settings: z.record(z.unknown()).optional(),
});

/**
 * Organization update schema
 */
export const UpdateOrganizationSchema = OrganizationSchema.partial().extend({
  id: z.string().uuid('Invalid organization ID'),
});

/**
 * Organization member invitation schema
 */
export const InviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: OrganizationRole.default('MEMBER'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Organization member update schema
 */
export const UpdateMemberRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  role: OrganizationRole,
});

/**
 * Organization query parameters schema
 */
export const OrganizationQuerySchema = z.object({
  industry: OrganizationIndustry.optional(),
  subscriptionTier: SubscriptionTier.optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Type exports
 */
export type OrganizationInput = z.infer<typeof OrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export type OrganizationQuery = z.infer<typeof OrganizationQuerySchema>;
export type OrganizationRoleType = z.infer<typeof OrganizationRole>;
export type OrganizationIndustryType = z.infer<typeof OrganizationIndustry>;
export type SubscriptionTierType = z.infer<typeof SubscriptionTier>;
