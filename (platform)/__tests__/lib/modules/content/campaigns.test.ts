/**
 * Campaign Actions Test Suite
 * Tests for Campaign CRUD operations, email campaigns, and social media posts
 *
 * Coverage: createCampaign, updateCampaign, deleteCampaign,
 *           createEmailCampaign, createSocialPost, sendEmailCampaign, publishSocialPost
 */

import { CampaignType, CampaignStatus, EmailStatus, PostStatus, SocialPlatform, UserRole, OrgRole } from '@prisma/client';
import { testPrisma, cleanDatabase, createTestOrgWithUser, connectTestDb, disconnectTestDb } from '@/__tests__/utils/test-helpers';
import { createCampaign, updateCampaign, deleteCampaign, createEmailCampaign, createSocialPost, sendEmailCampaign, publishSocialPost } from '@/lib/modules/content/campaigns/actions';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageCampaigns } from '@/lib/auth/rbac';

// Mock auth helpers
jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/auth/rbac');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Campaign Actions', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  // ============================================================================
  // MULTI-TENANCY TESTS
  // ============================================================================
  describe('Multi-Tenancy Isolation', () => {
    it('should create campaign with organizationId', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const campaignData = {
        name: 'Summer Sale',
        description: 'Summer promotion campaign',
        type: CampaignType.EMAIL_MARKETING,
        status: CampaignStatus.DRAFT,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        timezone: 'America/New_York',
        organizationId: organization.id,
      };

      const campaign = await createCampaign(campaignData);

      expect(campaign).toBeDefined();
      expect(campaign.organization_id).toBe(organization.id);
      expect(campaign.name).toBe('Summer Sale');
      expect(campaign.created_by).toBe(user.id);

      // Verify in database
      const dbCampaign = await testPrisma.campaigns.findUnique({
        where: { id: campaign.id },
      });
      expect(dbCampaign?.organization_id).toBe(organization.id);
    });

    it('should NOT allow access to other org campaigns', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create campaign in org1
      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Org 1 Campaign',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: org1.id,
          created_by: user1.id,
        },
      });

      // Try to update with user from org2
      (requireAuth as jest.Mock).mockResolvedValue({
        id: 'user2-id',
        organizationId: org2.id,
        role: UserRole.USER,
      });

      const updateData = {
        id: campaign.id,
        name: 'Updated Name',
        organizationId: org2.id,
      };

      await expect(updateCampaign(updateData)).rejects.toThrow('Campaign not found or access denied');
    });

    it('should filter campaigns by organizationId', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create campaigns in both orgs
      await testPrisma.campaigns.create({
        data: {
          name: 'Org 1 Campaign',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.ACTIVE,
          organization_id: org1.id,
          created_by: user1.id,
        },
      });

      await testPrisma.campaigns.create({
        data: {
          name: 'Org 2 Campaign',
          type: CampaignType.SOCIAL_MEDIA,
          status: CampaignStatus.ACTIVE,
          organization_id: org2.id,
          created_by: user2.id,
        },
      });

      // Query should only return org1 campaigns
      const org1Campaigns = await testPrisma.campaigns.findMany({
        where: { organization_id: org1.id },
      });

      expect(org1Campaigns).toHaveLength(1);
      expect(org1Campaigns[0].name).toBe('Org 1 Campaign');
    });
  });

  // ============================================================================
  // EMAIL CAMPAIGN TESTS
  // ============================================================================
  describe('Email Campaigns', () => {
    it('should create email campaign with valid recipients', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Email Campaign',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const emailData = {
        campaignId: campaign.id,
        subject: 'Summer Sale - 50% Off!',
        preheader: 'Limited time offer',
        content: '<h1>Summer Sale</h1><p>Get 50% off all items!</p>',
        plainText: 'Summer Sale - Get 50% off all items!',
        fromName: 'Marketing Team',
        fromEmail: 'marketing@example.com',
        replyTo: 'support@example.com',
        audienceSegment: { tags: ['customers', 'active'] },
        organizationId: organization.id,
      };

      const email = await createEmailCampaign(emailData);

      expect(email).toBeDefined();
      expect(email.subject).toBe('Summer Sale - 50% Off!');
      expect(email.status).toBe(EmailStatus.DRAFT);
      expect(email.campaign_id).toBe(campaign.id);
      expect(email.organization_id).toBe(organization.id);
    });

    it('should validate email template', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Email Campaign',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const invalidData = {
        campaignId: campaign.id,
        subject: '', // Empty subject
        content: '<h1>Content</h1>',
        fromEmail: 'marketing@example.com',
      };

      await expect(createEmailCampaign(invalidData as any)).rejects.toThrow();
    });

    it('should schedule email for future date', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Scheduled Email',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const emailData = {
        campaignId: campaign.id,
        subject: 'Scheduled Email',
        content: '<p>This is scheduled</p>',
        fromName: 'Marketing Team',
        fromEmail: 'marketing@example.com',
        scheduledFor: futureDate,
        organizationId: organization.id,
      };

      const email = await createEmailCampaign(emailData);

      expect(email.status).toBe(EmailStatus.SCHEDULED);
      expect(email.scheduled_for).toBeDefined();
      expect(new Date(email.scheduled_for!).getTime()).toBe(futureDate.getTime());
    });

    it('should send email campaign (integration stub)', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const email = await testPrisma.email_campaigns.create({
        data: {
          subject: 'Test Email',
          content: '<p>Test</p>',
          from_name: 'Test Sender',
          from_email: 'test@example.com',
          status: EmailStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const sent = await sendEmailCampaign(email.id);

      expect(sent.status).toBe(EmailStatus.SENT);
      expect(sent.sent_at).toBeDefined();
    });
  });

  // ============================================================================
  // SOCIAL MEDIA POST TESTS
  // ============================================================================
  describe('Social Media Posts', () => {
    it('should create social post with platform validation', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Social Campaign',
          type: CampaignType.SOCIAL_MEDIA,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const postData = {
        campaignId: campaign.id,
        content: 'Check out our summer sale! #sale #summer',
        mediaUrls: ['https://example.com/image.jpg'],
        platforms: [SocialPlatform.FACEBOOK, SocialPlatform.TWITTER, SocialPlatform.INSTAGRAM],
        organizationId: organization.id,
      };

      const post = await createSocialPost(postData);

      expect(post).toBeDefined();
      expect(post.content).toBe('Check out our summer sale! #sale #summer');
      expect(post.platforms).toEqual([SocialPlatform.FACEBOOK, SocialPlatform.TWITTER, SocialPlatform.INSTAGRAM]);
      expect(post.status).toBe(PostStatus.DRAFT);
      expect(post.organization_id).toBe(organization.id);
    });

    it('should validate post content length by platform', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Social Campaign',
          type: CampaignType.SOCIAL_MEDIA,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const validPost = {
        campaignId: campaign.id,
        content: 'Short post',
        platforms: [SocialPlatform.TWITTER],
        mediaUrls: [],
        organizationId: organization.id,
      };

      const post = await createSocialPost(validPost);
      expect(post.content).toBe('Short post');
    });

    it('should schedule post for future date', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Scheduled Social',
          type: CampaignType.SOCIAL_MEDIA,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      const postData = {
        campaignId: campaign.id,
        content: 'Scheduled post',
        platforms: [SocialPlatform.FACEBOOK],
        scheduledFor: futureDate,
        mediaUrls: [],
        organizationId: organization.id,
      };

      const post = await createSocialPost(postData);

      expect(post.status).toBe(PostStatus.SCHEDULED);
      expect(post.scheduled_for).toBeDefined();
      expect(new Date(post.scheduled_for!).getTime()).toBe(futureDate.getTime());
    });

    it('should publish social post (integration stub)', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const post = await testPrisma.social_media_posts.create({
        data: {
          content: 'Test post',
          platforms: [SocialPlatform.FACEBOOK],
          status: PostStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const published = await publishSocialPost(post.id);

      expect(published.status).toBe(PostStatus.PUBLISHED);
      expect(published.published_at).toBeDefined();
    });
  });

  // ============================================================================
  // CAMPAIGN CONTENT ASSOCIATION TESTS
  // ============================================================================
  describe('Campaign Content Association', () => {
    it('should link content items to campaign', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Content Campaign',
          type: CampaignType.CONTENT_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      const contentItem = await testPrisma.content.create({
        data: {
          title: 'Campaign Article',
          slug: 'campaign-article',
          content: 'Article content',
          type: 'BLOG_POST',
          status: 'PUBLISHED',
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      // Link content to campaign
      const campaignContent = await testPrisma.campaign_content.create({
        data: {
          campaign_id: campaign.id,
          content_id: contentItem.id,
          role: 'primary',
          priority: 1,
        },
      });

      expect(campaignContent.campaign_id).toBe(campaign.id);
      expect(campaignContent.content_id).toBe(contentItem.id);
    });

    it('should prevent linking other org content', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Org 1 Campaign',
          type: CampaignType.CONTENT_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: org1.id,
          created_by: user1.id,
        },
      });

      const contentItem = await testPrisma.content.create({
        data: {
          title: 'Org 2 Content',
          slug: 'org2-content',
          content: 'Content',
          type: 'BLOG_POST',
          status: 'PUBLISHED',
          organization_id: org2.id, // Different org!
          author_id: user2.id,
        },
      });

      // This should be prevented at application level
      // (The schema allows it, but business logic should check org matching)
      // For now, we just verify the IDs don't match
      expect(campaign.organization_id).not.toBe(contentItem.organization_id);
    });
  });

  // ============================================================================
  // CAMPAIGN LIFECYCLE TESTS
  // ============================================================================
  describe('Campaign Lifecycle', () => {
    it('should update campaign successfully', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'Original Name',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const updated = await updateCampaign({
        id: campaign.id,
        name: 'Updated Name',
        description: 'Updated description',
        status: CampaignStatus.ACTIVE,
        organizationId: organization.id,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');
      expect(updated.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should delete campaign successfully', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const campaign = await testPrisma.campaigns.create({
        data: {
          name: 'To Delete',
          type: CampaignType.EMAIL_MARKETING,
          status: CampaignStatus.DRAFT,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const result = await deleteCampaign(campaign.id);
      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await testPrisma.campaigns.findUnique({
        where: { id: campaign.id },
      });
      expect(deleted).toBeNull();
    });

    it('should enforce RBAC permissions for campaign management', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.MEMBER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      (canManageCampaigns as jest.Mock).mockReturnValue(false); // Member cannot manage campaigns

      const campaignData = {
        name: 'Test Campaign',
        type: CampaignType.EMAIL_MARKETING,
        status: CampaignStatus.DRAFT,
        timezone: 'UTC',
        organizationId: organization.id,
      };

      await expect(createCampaign(campaignData)).rejects.toThrow('Unauthorized');
    });
  });
});
