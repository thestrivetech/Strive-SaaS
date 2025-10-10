'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { cache } from 'react';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Campaign Module - Data Queries
 *
 * All queries enforce multi-tenancy via organizationId filtering.
 * Uses React cache() for request-level memoization.
 */

/**
 * Get campaigns with optional filters
 *
 * @param filters - Optional filters (status, type, search, etc.)
 * @returns Promise<Campaign[]> - Array of campaigns with relations
 */
export const getCampaigns = cache(async (filters?: CampaignFilters) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const where: any = {
    organization_id, // Multi-tenant isolation
  };

  // Apply filters
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;

  // Search across name and description
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.campaigns.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          emails: true,
          social_posts: true,
        },
      },
    },
    orderBy: [{ created_at: 'desc' }],
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });
});

/**
 * Get single campaign by ID
 *
 * @param id - Campaign ID
 * @returns Promise<Campaign | null> - Campaign with full relations
 */
export const getCampaignById = cache(async (id: string) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  return await prisma.campaigns.findFirst({
    where: {
      id,
      organization_id, // Ensure org isolation
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      emails: {
        orderBy: { created_at: 'desc' },
        take: 10,
      },
      social_posts: {
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });
});

/**
 * Get campaign metrics for dashboard
 *
 * @returns Promise<object> - Campaign stats
 */
export const getCampaignMetrics = cache(async () => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  const [total, active, completed, draft] = await Promise.all([
    prisma.campaigns.count({
      where: { organization_id },
    }),
    prisma.campaigns.count({
      where: {
        organization_id,
        status: 'ACTIVE',
      },
    }),
    prisma.campaigns.count({
      where: {
        organization_id,
        status: 'COMPLETED',
      },
    }),
    prisma.campaigns.count({
      where: {
        organization_id,
        status: 'DRAFT',
      },
    }),
  ]);

  return {
    total,
    active,
    completed,
    draft,
  };
});

/**
 * Get email campaigns with optional filters
 *
 * @param filters - Optional filters
 * @returns Promise<EmailCampaign[]> - Array of email campaigns
 */
export const getEmailCampaigns = cache(async (filters?: { campaignId?: string; status?: string }) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const where: any = {
    organization_id,
  };

  if (filters?.campaignId) where.campaign_id = filters.campaignId;
  if (filters?.status) where.status = filters.status;

  return await prisma.email_campaigns.findMany({
    where,
    include: {
      campaign: {
        select: { id: true, name: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ created_at: 'desc' }],
  });
});

/**
 * Get social media posts with optional filters
 *
 * @param filters - Optional filters
 * @returns Promise<SocialMediaPost[]> - Array of social posts
 */
export const getSocialPosts = cache(async (filters?: { campaignId?: string; status?: string }) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);
  const where: any = {
    organization_id,
  };

  if (filters?.campaignId) where.campaign_id = filters.campaignId;
  if (filters?.status) where.status = filters.status;

  return await prisma.social_media_posts.findMany({
    where,
    include: {
      campaign: {
        select: { id: true, name: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ created_at: 'desc' }],
  });
});

/**
 * Get email campaign by ID
 *
 * @param id - Email campaign ID
 * @returns Promise<EmailCampaign | null> - Email campaign details
 */
export const getEmailCampaignById = cache(async (id: string) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  return await prisma.email_campaigns.findFirst({
    where: {
      id,
      organization_id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });
});

/**
 * Get social media post by ID
 *
 * @param id - Social post ID
 * @returns Promise<SocialMediaPost | null> - Social post details
 */
export const getSocialPostById = cache(async (id: string) => {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organization_id = getUserOrganizationId(user);

  return await prisma.social_media_posts.findFirst({
    where: {
      id,
      organization_id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });
});
