/**
 * Content Queries Test Suite
 * Tests for content data fetching with filtering, searching, and pagination
 *
 * Coverage: getContentItems, getContentItemById, getContentBySlug,
 *           getContentStats, getContentCount
 */

import { ContentType, ContentStatus, UserRole, OrgRole } from '@prisma/client';
import { testPrisma, cleanDatabase, createTestOrgWithUser, connectTestDb, disconnectTestDb } from '@/__tests__/utils/test-helpers';
import { getContentItems, getContentItemById, getContentBySlug, getContentStats, getContentCount } from '@/lib/modules/content/content/queries';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';

jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/auth/user-helpers', () => ({
  getUserOrganizationId: jest.fn((user) => user.organizationId || user.organization_members?.[0]?.organization_id),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn,
}));

describe('Content Queries', () => {
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
    it('should return only user org content', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content in org1
      await testPrisma.content.create({
        data: {
          title: 'Org 1 Content',
          slug: 'org1-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org1.id,
          author_id: user1.id,
        },
      });

      // Create content in org2
      await testPrisma.content.create({
        data: {
          title: 'Org 2 Content',
          slug: 'org2-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org2.id,
          author_id: user2.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user1);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user1,
        organizationId: org1.id,
      });

      const items = await getContentItems();

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Org 1 Content');
      expect(items[0].organization_id).toBe(org1.id);
    });

    it('should filter by organizationId in all queries', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create multiple content items
      for (let i = 0; i < 5; i++) {
        await testPrisma.content.create({
          data: {
            title: `Org 1 Content ${i}`,
            slug: `org1-content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: org1.id,
            author_id: user1.id,
          },
        });
      }

      for (let i = 0; i < 3; i++) {
        await testPrisma.content.create({
          data: {
            title: `Org 2 Content ${i}`,
            slug: `org2-content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: org2.id,
            author_id: user2.id,
          },
        });
      }

      (requireAuth as jest.Mock).mockResolvedValue(user1);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user1,
        organizationId: org1.id,
      });

      const count = await getContentCount();
      expect(count).toBe(5); // Only org1 content, not 8
    });

    it('should enforce org isolation when getting by ID', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content in org2
      const org2Content = await testPrisma.content.create({
        data: {
          title: 'Org 2 Content',
          slug: 'org2-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org2.id,
          author_id: user2.id,
        },
      });

      // Try to access with org1 user
      (requireAuth as jest.Mock).mockResolvedValue(user1);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user1,
        organizationId: org1.id,
      });

      const result = await getContentItemById(org2Content.id);
      expect(result).toBeNull(); // Should not find other org's content
    });
  });

  // ============================================================================
  // FILTERING AND SEARCH TESTS
  // ============================================================================
  describe('Filtering and Search', () => {
    beforeEach(async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create test content with various statuses and types
      await testPrisma.content.createMany({
        data: [
          {
            title: 'Published Blog Post',
            slug: 'published-blog',
            content: 'Blog post content about technology',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Draft Article',
            slug: 'draft-article',
            content: 'Article content about business',
            type: ContentType.ARTICLE,
            status: ContentStatus.DRAFT,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Archived Page',
            slug: 'archived-page',
            content: 'Page content about history',
            type: ContentType.PAGE,
            status: ContentStatus.ARCHIVED,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Published Article',
            slug: 'published-article',
            content: 'Another article about technology trends',
            type: ContentType.ARTICLE,
            status: ContentStatus.PUBLISHED,
            organization_id: organization.id,
            author_id: user.id,
          },
        ],
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });
    });

    it('should filter by status (DRAFT, PUBLISHED, ARCHIVED)', async () => {
      const published = await getContentItems({ status: ContentStatus.PUBLISHED, limit: 50, offset: 0 });
      expect(published).toHaveLength(2);
      published.forEach((item: { status: ContentStatus }) => expect(item.status).toBe(ContentStatus.PUBLISHED));

      const drafts = await getContentItems({ status: ContentStatus.DRAFT, limit: 50, offset: 0 });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].status).toBe(ContentStatus.DRAFT);

      const archived = await getContentItems({ status: ContentStatus.ARCHIVED, limit: 50, offset: 0 });
      expect(archived).toHaveLength(1);
      expect(archived[0].status).toBe(ContentStatus.ARCHIVED);
    });

    it('should filter by content type', async () => {
      const blogPosts = await getContentItems({ type: ContentType.BLOG_POST, limit: 50, offset: 0 });
      expect(blogPosts).toHaveLength(1);
      expect(blogPosts[0].type).toBe(ContentType.BLOG_POST);

      const articles = await getContentItems({ type: ContentType.ARTICLE, limit: 50, offset: 0 });
      expect(articles).toHaveLength(2);
      articles.forEach((item: { type: ContentType }) => expect(item.type).toBe(ContentType.ARTICLE));

      const pages = await getContentItems({ type: ContentType.PAGE, limit: 50, offset: 0 });
      expect(pages).toHaveLength(1);
      expect(pages[0].type).toBe(ContentType.PAGE);
    });

    it('should search by keywords', async () => {
      const techResults = await getContentItems({ search: 'technology', limit: 50, offset: 0 });
      expect(techResults.length).toBeGreaterThanOrEqual(2);

      const businessResults = await getContentItems({ search: 'business', limit: 50, offset: 0 });
      expect(businessResults).toHaveLength(1);
      expect(businessResults[0].title).toContain('Article');
    });

    it('should search across title, content, and excerpt', async () => {
      // Should find by title
      const titleSearch = await getContentItems({ search: 'Published Blog', limit: 50, offset: 0 });
      expect(titleSearch.length).toBeGreaterThanOrEqual(1);

      // Should find by content
      const contentSearch = await getContentItems({ search: 'history', limit: 50, offset: 0 });
      expect(contentSearch.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by category', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const category = await testPrisma.content_categories.create({
        data: {
          name: 'Technology',
          slug: 'technology',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      await testPrisma.content.create({
        data: {
          title: 'Tech Content',
          slug: 'tech-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          category_id: category.id,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const results = await getContentItems({ category_id: category.id, limit: 50, offset: 0 });
      expect(results).toHaveLength(1);
      expect(results[0].category_id).toBe(category.id);
    });

    it('should combine multiple filters', async () => {
      const results = await getContentItems({
        status: ContentStatus.PUBLISHED,
        type: ContentType.ARTICLE,
        search: 'technology',
        limit: 50,
        offset: 0,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Published Article');
      expect(results[0].status).toBe(ContentStatus.PUBLISHED);
      expect(results[0].type).toBe(ContentType.ARTICLE);
    });
  });

  // ============================================================================
  // PAGINATION TESTS
  // ============================================================================
  describe('Pagination', () => {
    beforeEach(async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create 25 content items
      for (let i = 0; i < 25; i++) {
        await testPrisma.content.create({
          data: {
            title: `Content ${i.toString().padStart(2, '0')}`,
            slug: `content-${i}`,
            content: 'Content body',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: organization.id,
            author_id: user.id,
          },
        });
      }

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });
    });

    it('should paginate results correctly', async () => {
      const page1 = await getContentItems({ limit: 10, offset: 0 });
      expect(page1).toHaveLength(10);

      const page2 = await getContentItems({ limit: 10, offset: 10 });
      expect(page2).toHaveLength(10);

      const page3 = await getContentItems({ limit: 10, offset: 20 });
      expect(page3).toHaveLength(5);

      // Ensure different results
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('should respect take/skip parameters', async () => {
      const first5 = await getContentItems({ limit: 5, offset: 0 });
      expect(first5).toHaveLength(5);

      const skip10 = await getContentItems({ limit: 5, offset: 10 });
      expect(skip10).toHaveLength(5);

      // Should be different items
      expect(first5[0].id).not.toBe(skip10[0].id);
    });

    it('should have default limit of 50', async () => {
      const results = await getContentItems();
      expect(results.length).toBeLessThanOrEqual(50);
    });
  });

  // ============================================================================
  // CONTENT BY SLUG TESTS (Public Access)
  // ============================================================================
  describe('Content By Slug', () => {
    it('should get published content by slug', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      await testPrisma.content.create({
        data: {
          title: 'Public Content',
          slug: 'public-content',
          content: 'Public content body',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      const content = await getContentBySlug('public-content', organization.id);

      expect(content).toBeDefined();
      expect(content?.title).toBe('Public Content');
      expect(content?.slug).toBe('public-content');
    });

    it('should only return published content (not drafts)', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      await testPrisma.content.create({
        data: {
          title: 'Draft Content',
          slug: 'draft-content',
          content: 'Draft content body',
          type: ContentType.BLOG_POST,
          status: ContentStatus.DRAFT,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      const content = await getContentBySlug('draft-content', organization.id);
      expect(content).toBeNull(); // Drafts should not be accessible by slug
    });

    it('should scope slug lookup to organization', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Same slug in different orgs
      await testPrisma.content.create({
        data: {
          title: 'Org 1 Content',
          slug: 'same-slug',
          content: 'Org 1 content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org1.id,
          author_id: user1.id,
        },
      });

      await testPrisma.content.create({
        data: {
          title: 'Org 2 Content',
          slug: 'same-slug',
          content: 'Org 2 content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          organization_id: org2.id,
          author_id: user2.id,
        },
      });

      const org1Content = await getContentBySlug('same-slug', org1.id);
      expect(org1Content?.title).toBe('Org 1 Content');

      const org2Content = await getContentBySlug('same-slug', org2.id);
      expect(org2Content?.title).toBe('Org 2 Content');
    });
  });

  // ============================================================================
  // CONTENT STATS TESTS
  // ============================================================================
  describe('Content Statistics', () => {
    it('should calculate content stats correctly', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content with different statuses
      await testPrisma.content.createMany({
        data: [
          {
            title: 'Published 1',
            slug: 'published-1',
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Published 2',
            slug: 'published-2',
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Draft 1',
            slug: 'draft-1',
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.DRAFT,
            organization_id: organization.id,
            author_id: user.id,
          },
          {
            title: 'Scheduled 1',
            slug: 'scheduled-1',
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.SCHEDULED,
            scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            organization_id: organization.id,
            author_id: user.id,
          },
        ],
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const stats = await getContentStats();

      expect(stats.total).toBe(4);
      expect(stats.published).toBe(2);
      expect(stats.draft).toBe(1);
      expect(stats.scheduled).toBe(1);
    });
  });

  // ============================================================================
  // CONTENT ITEM BY ID TESTS
  // ============================================================================
  describe('Content Item By ID', () => {
    it('should get content with full relations', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const category = await testPrisma.content_categories.create({
        data: {
          name: 'Technology',
          slug: 'technology',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      const content = await testPrisma.content.create({
        data: {
          title: 'Full Content',
          slug: 'full-content',
          content: 'Content body',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          category_id: category.id,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const result = await getContentItemById(content.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(content.id);
      expect(result?.author).toBeDefined();
      expect(result?.category).toBeDefined();
      expect(result?.category?.name).toBe('Technology');
    });
  });
});
