import { z } from 'zod';

/**
 * Content Module - Zod Validation Schemas
 *
 * Comprehensive validation for content items, including SEO optimization,
 * media assets, scheduling, and multi-language support.
 */

// ContentItem schema for creation
export const ContentItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum([
    'PAGE',
    'BLOG_POST',
    'DOCUMENTATION',
    'TEMPLATE',
    'ARTICLE',
    'LANDING_PAGE',
    'EMAIL_TEMPLATE',
    'SOCIAL_POST',
    'PRESS_RELEASE',
    'NEWSLETTER',
    'CASE_STUDY',
    'WHITEPAPER',
  ]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEW', 'APPROVED', 'SCHEDULED']).default('DRAFT'),
  language: z.string().length(2, 'Language must be 2-letter code').default('en'),

  // SEO fields
  meta_title: z.string().max(60, 'Meta title should be under 60 characters').optional(),
  meta_description: z.string().max(160, 'Meta description should be under 160 characters').optional(),
  keywords: z.array(z.string()).default([]),
  canonical_url: z.string().url('Invalid canonical URL').optional(),

  // Media fields
  featured_image: z.string().url('Invalid image URL').optional(),
  gallery: z.array(z.string().url()).default([]),
  video_url: z.string().url('Invalid video URL').optional(),
  audio_url: z.string().url('Invalid audio URL').optional(),

  // Publishing schedule
  scheduled_for: z.coerce.date().optional(),
  expires_at: z.coerce.date().optional(),

  // Relations
  category_id: z.string().uuid('Invalid category ID').optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
});

// Update schema (all fields optional except ID)
export const UpdateContentSchema = ContentItemSchema.partial().extend({
  id: z.string().uuid('Invalid content ID'),
});

// Publish content schema
export const PublishContentSchema = z.object({
  id: z.string().uuid('Invalid content ID'),
  scheduled_for: z.coerce.date().optional(),
});

// Content filters for querying
export const ContentFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEW', 'APPROVED', 'SCHEDULED']).optional(),
  type: z.enum([
    'PAGE',
    'BLOG_POST',
    'DOCUMENTATION',
    'TEMPLATE',
    'ARTICLE',
    'LANDING_PAGE',
    'EMAIL_TEMPLATE',
    'SOCIAL_POST',
    'PRESS_RELEASE',
    'NEWSLETTER',
    'CASE_STUDY',
    'WHITEPAPER',
  ]).optional(),
  category_id: z.string().uuid().optional(),
  author_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Type exports
export type ContentItemInput = z.infer<typeof ContentItemSchema>;
export type UpdateContentInput = z.infer<typeof UpdateContentSchema>;
export type PublishContentInput = z.infer<typeof PublishContentSchema>;
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;
