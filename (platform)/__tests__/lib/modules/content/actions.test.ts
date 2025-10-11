/**
 * Content Actions Test Suite
 * Tests for Content CRUD operations with multi-tenant isolation and RBAC
 *
 * Coverage: createContentItem, updateContentItem, publishContent, unpublishContent, deleteContent
 */

import { ContentStatus, ContentType, UserRole, OrgRole, SubscriptionTier } from '@prisma/client';
import { testPrisma, cleanDatabase, createTestOrgWithUser, createTestUser, createOrganizationMember, createTestOrganization, connectTestDb, disconnectTestDb } from '@/__tests__/utils/test-helpers';
import { createContentItem, updateContentItem, publishContent, unpublishContent, deleteContent } from '@/lib/modules/content/content/actions';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { canAccessContent, canPublishContent, canAccessFeature } from '@/lib/auth/rbac';

jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/auth/rbac');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('@/lib/auth/user-helpers', () => ({
  getUserOrganizationId: jest.fn((user) => user.organizationId || user.organization_members?.[0]?.organization_id),
}));

describe('Content Actions', () => {
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
    it('should create content item with organizationId', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.GROWTH,
      });

      const contentData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'This is test content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['test'],
        gallery: [],
        organization_id: organization.id,
      };

      const content = await createContentItem(contentData);

      expect(content).toBeDefined();
      expect(content.organization_id).toBe(organization.id);
      expect(content.title).toBe('Test Article');

      // Verify in database
      const dbContent = await testPrisma.content.findUnique({
        where: { id: content.id },
      });
      expect(dbContent?.organization_id).toBe(organization.id);
    });

    it('should NOT allow access to other org content when updating', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content in org1
      const content = await testPrisma.content.create({
        data: {
          title: 'Org 1 Content',
          slug: 'org1-content',
          content: 'Content body',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: org1.id,
          author_id: user1.id,
        },
      });

      // Try to update with user from org2
      (requireAuth as jest.Mock).mockResolvedValue({
        id: 'user2-id',
        organizationId: org2.id,
        role: UserRole.USER,
      });

      const updateData = {
        id: content.id,
        title: 'Updated Title',
        organization_id: org2.id,
      };

      await expect(updateContentItem(updateData)).rejects.toThrow('Content not found or access denied');
    });

    it('should filter content by organizationId in queries', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content in both orgs
      await testPrisma.content.create({
        data: {
          title: 'Org 1 Content',
          slug: 'org1-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org1.id,
          author_id: user1.id,
          published_at: new Date(),
        },
      });

      await testPrisma.content.create({
        data: {
          title: 'Org 2 Content',
          slug: 'org2-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org2.id,
          author_id: user2.id,
          published_at: new Date(),
        },
      });

      // Query should only return org1 content
      const org1Content = await testPrisma.content.findMany({
        where: { organization_id: org1.id },
      });

      expect(org1Content).toHaveLength(1);
      expect(org1Content[0].title).toBe('Org 1 Content');
    });
  });

  // ============================================================================
  // RBAC TESTS
  // ============================================================================
  describe('Role-Based Access Control', () => {
    it('should require STARTER tier or higher for content creation', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.FREE, // Too low tier
      });

      (canAccessFeature as jest.Mock).mockReturnValue(false); // Simulate tier restriction

      const contentData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['test'],
        gallery: [],
        organization_id: organization.id,
      };

      await expect(createContentItem(contentData)).rejects.toThrow('Upgrade required');
    });

    it('should allow SUPER_ADMIN to bypass tier check', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.SUPER_ADMIN, // Super admin
        subscriptionTier: SubscriptionTier.FREE,
      });

      (canAccessFeature as jest.Mock).mockReturnValue(true); // SUPER_ADMIN bypasses tier

      const contentData = {
        title: 'Admin Content',
        slug: 'admin-content',
        content: 'Content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['admin'],
        gallery: [],
        organization_id: organization.id,
      };

      const content = await createContentItem(contentData);
      expect(content).toBeDefined();
      expect(content.title).toBe('Admin Content');
    });

    it('should check both GlobalRole and OrganizationRole for publish permission', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.MEMBER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Draft Content',
          slug: 'draft-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      (canPublishContent as jest.Mock).mockReturnValue(false); // MEMBER cannot publish

      await expect(publishContent({ id: content.id })).rejects.toThrow('Unauthorized');
    });

    it('should allow OWNER/ADMIN to publish content', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Draft Content',
          slug: 'draft-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.ADMIN,
      });

      (canPublishContent as jest.Mock).mockReturnValue(true); // OWNER can publish

      const published = await publishContent({ id: content.id });
      expect(published.status).toBe(ContentStatus.PUBLISHED);
      expect(published.published_at).toBeDefined();
    });
  });

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================
  describe('Input Validation', () => {
    it('should validate input with Zod schema', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.GROWTH,
      });

      const validData = {
        title: 'Valid Title',
        slug: 'valid-slug',
        content: 'Valid content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['valid'],
        gallery: [],
        organization_id: organization.id,
      };

      const content = await createContentItem(validData);
      expect(content).toBeDefined();
    });

    it('should reject invalid content data - title too short', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.GROWTH,
      });

      const invalidData = {
        title: '', // Empty title (min 1)
        slug: 'test-slug',
        content: 'Content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['test'],
        gallery: [],
        organization_id: organization.id,
      };

      await expect(createContentItem(invalidData)).rejects.toThrow();
    });

    it('should reject invalid slug format', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.GROWTH,
      });

      const invalidData = {
        title: 'Test Title',
        slug: 'Invalid Slug With Spaces!', // Invalid characters
        content: 'Content',
        type: ContentType.BLOG_POST,
        status: ContentStatus.DRAFT,
        language: 'en',
        keywords: ['test'],
        gallery: [],
        organization_id: organization.id,
      };

      await expect(createContentItem(invalidData)).rejects.toThrow();
    });

    it('should enforce required fields', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.GROWTH,
      });

      const missingFields = {
        title: 'Test',
        slug: 'test',
        // Missing content (required)
        type: ContentType.BLOG_POST,
        organization_id: organization.id,
      };

      await expect(createContentItem(missingFields as any)).rejects.toThrow();
    });
  });

  // ============================================================================
  // BUSINESS LOGIC TESTS
  // ============================================================================
  describe('Business Logic', () => {
    it('should create content revision on update', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Original content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      await updateContentItem({
        id: content.id,
        title: 'Updated Title',
        content: 'Updated content',
        organization_id: organization.id,
      });

      // Check that revision was created
      const revisions = await testPrisma.content_revisions.findMany({
        where: { content_id: content.id },
      });

      expect(revisions).toHaveLength(1);
      expect(revisions[0].title).toBe('Original Title');
      expect(revisions[0].content_body).toBe('Original content');
      expect(revisions[0].version).toBe(1);
    });

    it('should set publishedAt when publishing', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Draft Content',
          slug: 'draft-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.ADMIN,
      });

      const beforePublish = new Date();
      const published = await publishContent({ id: content.id });

      expect(published.status).toBe(ContentStatus.PUBLISHED);
      expect(published.published_at).toBeDefined();
      expect(new Date(published.published_at!).getTime()).toBeGreaterThanOrEqual(beforePublish.getTime());
    });

    it('should clear publishedAt when unpublishing', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Published Content',
          slug: 'published-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: new Date(),
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.ADMIN,
      });

      const unpublished = await unpublishContent(content.id);

      expect(unpublished.status).toBe(ContentStatus.DRAFT);
      expect(unpublished.published_at).toBeNull();
    });

    it('should schedule content for future publishing', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Future Content',
          slug: 'future-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.ADMIN,
      });

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const scheduled = await publishContent({
        id: content.id,
        scheduled_for: futureDate,
      });

      expect(scheduled.status).toBe(ContentStatus.SCHEDULED);
      expect(scheduled.scheduled_for).toBeDefined();
      expect(new Date(scheduled.scheduled_for!).getTime()).toBe(futureDate.getTime());
    });

    it('should delete content successfully', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'To Delete',
          slug: 'to-delete',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const result = await deleteContent(content.id);
      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await testPrisma.content.findUnique({
        where: { id: content.id },
      });
      expect(deleted).toBeNull();
    });

    it('should prevent deleting other org content', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2 } = await createTestOrgWithUser(OrgRole.OWNER);

      const content = await testPrisma.content.create({
        data: {
          title: 'Org 1 Content',
          slug: 'org1-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: org1.id,
          author_id: user1.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue({
        id: 'user2-id',
        organizationId: org2.id,
        role: UserRole.USER,
      });

      await expect(deleteContent(content.id)).rejects.toThrow('Content not found or access denied');
    });
  });
});
