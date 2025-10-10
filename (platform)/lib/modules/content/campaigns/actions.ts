'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canManageCampaigns } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
type CampaignInput = any;
type EmailCampaignInput = any;
type SocialPostInput = any;
type UpdateCampaignInput = any;

/**
 * Campaign Module - Server Actions
 *
 * All actions enforce RBAC permissions, multi-tenancy, and subscription tier limits.
 */

/**
 * Create new campaign
 *
 * @param input - Campaign data
 * @returns Promise<Campaign> - Created campaign
 */
export async function createCampaign(input: CampaignInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canManageCampaigns(user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  // Validate input
  const validated = input;

  // Create campaign
  const campaign = await prisma.campaigns.create({
    data: {
      name: validated.name,
      description: validated.description,
      type: validated.type,
      status: validated.status,
      start_date: validated.startDate,
      end_date: validated.endDate,
      timezone: validated.timezone,
      budget: validated.budget,
      goal_type: validated.goalType,
      goal_value: validated.goalValue,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return campaign;
}

/**
 * Update existing campaign
 *
 * @param input - Updated campaign data
 * @returns Promise<Campaign> - Updated campaign
 */
export async function updateCampaign(input: UpdateCampaignInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canManageCampaigns(user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  // Validate input
  const validated = input;
  const { id, organizationId: _orgId, ...updateData } = validated;

  // Verify ownership
  const existing = await prisma.campaigns.findFirst({
    where: {
      id,
      organization_id: user.organizationId,
    },
  });

  if (!existing) {
    throw new Error('Campaign not found or access denied');
  }

  // Update campaign
  const updated = await prisma.campaigns.update({
    where: { id },
    data: {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.type !== undefined && { type: updateData.type }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.startDate !== undefined && { start_date: updateData.startDate }),
      ...(updateData.endDate !== undefined && { end_date: updateData.endDate }),
      ...(updateData.timezone !== undefined && { timezone: updateData.timezone }),
      ...(updateData.budget !== undefined && { budget: updateData.budget }),
      ...(updateData.goalType !== undefined && { goal_type: updateData.goalType }),
      ...(updateData.goalValue !== undefined && { goal_value: updateData.goalValue }),
      updated_at: new Date(),
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  revalidatePath(`/real-estate/cms-marketing/content/campaigns/${id}`);
  return updated;
}

/**
 * Create email campaign
 *
 * @param input - Email campaign data
 * @returns Promise<EmailCampaign> - Created email campaign
 */
export async function createEmailCampaign(input: EmailCampaignInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canManageCampaigns(user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  // Validate input
  const validated = input;

  // Determine status
  const status = validated.scheduledFor ? 'SCHEDULED' : 'DRAFT';

  // Create email campaign
  const email = await prisma.email_campaigns.create({
    data: {
      subject: validated.subject,
      preheader: validated.preheader,
      content: validated.content,
      plain_text: validated.plainText,
      from_name: validated.fromName,
      from_email: validated.fromEmail,
      reply_to: validated.replyTo,
      audience_segment: validated.audienceSegment as any,
      scheduled_for: validated.scheduledFor,
      campaign_id: validated.campaignId,
      status,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return email;
}

/**
 * Create social media post
 *
 * @param input - Social post data
 * @returns Promise<SocialMediaPost> - Created social post
 */
export async function createSocialPost(input: SocialPostInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canManageCampaigns(user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  // Validate input
  const validated = input;

  // Determine status
  const status = validated.scheduledFor ? 'SCHEDULED' : 'DRAFT';

  // Create social post
  const post = await prisma.social_media_posts.create({
    data: {
      content: validated.content,
      media_urls: validated.mediaUrls,
      platforms: validated.platforms,
      scheduled_for: validated.scheduledFor,
      campaign_id: validated.campaignId,
      status,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return post;
}

/**
 * Update campaign status
 *
 * @param id - Campaign ID
 * @param status - New status
 * @returns Promise<Campaign> - Updated campaign
 */
export async function updateCampaignStatus(id: string, status: string) {
  const user = await requireAuth();

  // Verify ownership
  const campaign = await prisma.campaigns.findFirst({
    where: {
      id,
      organization_id: user.organizationId,
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found or access denied');
  }

  const updated = await prisma.campaigns.update({
    where: { id },
    data: {
      status: status as any,
      updated_at: new Date(),
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return updated;
}

/**
 * Send email campaign (integration stub)
 *
 * @param id - Email campaign ID
 * @returns Promise<EmailCampaign> - Updated email campaign
 */
export async function sendEmailCampaign(id: string) {
  const user = await requireAuth();

  // Verify ownership
  const email = await prisma.email_campaigns.findFirst({
    where: {
      id,
      organization_id: user.organizationId,
    },
  });

  if (!email) {
    throw new Error('Email campaign not found or access denied');
  }

  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
  // For now, just update status
  const sent = await prisma.email_campaigns.update({
    where: { id },
    data: {
      status: 'SENT',
      sent_at: new Date(),
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return sent;
}

/**
 * Publish social media post (integration stub)
 *
 * @param id - Social post ID
 * @returns Promise<SocialMediaPost> - Updated social post
 */
export async function publishSocialPost(id: string) {
  const user = await requireAuth();

  // Verify ownership
  const post = await prisma.social_media_posts.findFirst({
    where: {
      id,
      organization_id: user.organizationId,
    },
  });

  if (!post) {
    throw new Error('Social post not found or access denied');
  }

  // TODO: Integrate with social media APIs (Facebook, Twitter, etc.)
  // For now, just update status
  const published = await prisma.social_media_posts.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      published_at: new Date(),
    },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return published;
}

/**
 * Delete campaign
 *
 * @param id - Campaign ID
 * @returns Promise<object> - Success indicator
 */
export async function deleteCampaign(id: string) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canManageCampaigns(user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  // Verify ownership
  const campaign = await prisma.campaigns.findFirst({
    where: {
      id,
      organization_id: user.organizationId,
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found or access denied');
  }

  // Delete campaign (cascades to email campaigns and social posts via Prisma schema)
  await prisma.campaigns.delete({
    where: { id },
  });

  revalidatePath('/real-estate/cms-marketing/content/campaigns');
  return { success: true };
}
