/**
 * Content Analytics Test Suite
 * Tests for content performance metrics and analytics aggregations
 *
 * Coverage: getContentPerformance, getContentTrends, getTopPerformingContent,
 *           getContentPerformanceByType
 */

import { ContentType, ContentStatus, UserRole, OrgRole } from '@prisma/client';
import { testPrisma, cleanDatabase, createTestOrgWithUser, connectTestDb, disconnectTestDb } from '@/__tests__/utils/test-helpers';
import { getContentPerformance, getContentTrends, getTopPerformingContent, getContentPerformanceByType } from '@/lib/modules/content/analytics/content-analytics';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';

jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/auth/user-helpers', () => ({
  getUserOrganizationId: jest.fn((user) => user.organizationId || user.organization_members?.[0]?.organization_id),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn,
}));

describe('Content Analytics', () => {
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
    it('should return analytics only for user org', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content in org1
      await testPrisma.content_items.create({
        data: {
          title: 'Org 1 Content',
          slug: 'org1-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: new Date(),
          view_count: 100,
          share_count: 10,
          like_count: 20,
          organization_id: org1.id,
          author_id: user1.id,
        },
      });

      // Create content in org2
      await testPrisma.content_items.create({
        data: {
          title: 'Org 2 Content',
          slug: 'org2-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: new Date(),
          view_count: 200,
          share_count: 20,
          like_count: 40,
          organization_id: org2.id,
          author_id: user2.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user1);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user1,
        organizationId: org1.id,
      });

      const performance = await getContentPerformance('month');

      expect(performance.metrics.totalViews).toBe(100); // Only org1 content
      expect(performance.content).toHaveLength(1);
      expect(performance.content[0].title).toBe('Org 1 Content');
    });

    it('should NOT include other org data in aggregations', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create 5 content items in org1
      for (let i = 0; i < 5; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Org 1 Content ${i}`,
            slug: `org1-content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 50 * (i + 1),
            organization_id: org1.id,
            author_id: user1.id,
          },
        });
      }

      // Create 3 content items in org2
      for (let i = 0; i < 3; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Org 2 Content ${i}`,
            slug: `org2-content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 100 * (i + 1),
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

      const byType = await getContentPerformanceByType();

      // Should only count org1 content
      const blogPosts = byType.find(item => item.type === ContentType.BLOG_POST);
      expect(blogPosts?.count).toBe(5); // Not 8 (org1 + org2)
    });
  });

  // ============================================================================
  // METRICS ACCURACY TESTS
  // ============================================================================
  describe('Metrics Accuracy', () => {
    it('should calculate total content count correctly', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create 10 published content items
      for (let i = 0; i < 10; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Content ${i}`,
            slug: `content-${i}`,
            content: 'Content body',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 100,
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

      const performance = await getContentPerformance('month');

      expect(performance.metrics.totalPosts).toBe(10);
      expect(performance.metrics.totalViews).toBe(1000); // 100 * 10
    });

    it('should calculate published vs draft ratio', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create published content
      for (let i = 0; i < 7; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Published ${i}`,
            slug: `published-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            organization_id: organization.id,
            author_id: user.id,
          },
        });
      }

      // Create draft content
      for (let i = 0; i < 3; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Draft ${i}`,
            slug: `draft-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.DRAFT,
            organization_id: organization.id,
            author_id: user.id,
          },
        });
      }

      const totalCount = await testPrisma.content_items.count({
        where: { organization_id: organization.id },
      });

      const publishedCount = await testPrisma.content_items.count({
        where: {
          organization_id: organization.id,
          status: ContentStatus.PUBLISHED,
        },
      });

      expect(totalCount).toBe(10);
      expect(publishedCount).toBe(7);
      expect(publishedCount / totalCount).toBe(0.7); // 70% published
    });

    it('should calculate average engagement metrics', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const engagementData = [
        { likes: 10, shares: 5, comments: 2 },
        { likes: 20, shares: 10, comments: 4 },
        { likes: 30, shares: 15, comments: 6 },
      ];

      for (let i = 0; i < engagementData.length; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Content ${i}`,
            slug: `content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            like_count: engagementData[i].likes,
            share_count: engagementData[i].shares,
            comment_count: engagementData[i].comments,
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

      const performance = await getContentPerformance('month');

      // Total: likes (60) + shares (30) + comments (12) = 102
      // Average: 102 / 3 = 34
      expect(performance.metrics.avgEngagement).toBe(34);
      expect(performance.metrics.totalLikes).toBe(60);
      expect(performance.metrics.totalShares).toBe(30);
      expect(performance.metrics.totalComments).toBe(12);
    });
  });

  // ============================================================================
  // DATE RANGE FILTERING TESTS
  // ============================================================================
  describe('Date Range Filtering', () => {
    it('should filter analytics by date range - week', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Recent content (within week)
      await testPrisma.content_items.create({
        data: {
          title: 'Recent Content',
          slug: 'recent-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: lastWeek,
          view_count: 100,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      // Old content (outside week)
      await testPrisma.content_items.create({
        data: {
          title: 'Old Content',
          slug: 'old-content',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: twoWeeksAgo,
          view_count: 200,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const weekPerformance = await getContentPerformance('week');

      expect(weekPerformance.metrics.totalPosts).toBe(1); // Only recent content
      expect(weekPerformance.metrics.totalViews).toBe(100);
    });

    it('should filter analytics by date range - month', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      // This month
      await testPrisma.content_items.create({
        data: {
          title: 'This Month',
          slug: 'this-month',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: thisMonth,
          view_count: 100,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      // Last month
      await testPrisma.content_items.create({
        data: {
          title: 'Last Month',
          slug: 'last-month',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: lastMonth,
          view_count: 200,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const monthPerformance = await getContentPerformance('month');

      expect(monthPerformance.metrics.totalPosts).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty date ranges', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create content from last year
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      await testPrisma.content_items.create({
        data: {
          title: 'Last Year',
          slug: 'last-year',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: lastYear,
          view_count: 100,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const weekPerformance = await getContentPerformance('week');

      // Should return empty results for this week
      expect(weekPerformance.metrics.totalPosts).toBe(0);
      expect(weekPerformance.metrics.totalViews).toBe(0);
    });
  });

  // ============================================================================
  // CONTENT TRENDS TESTS
  // ============================================================================
  describe('Content Trends', () => {
    it('should calculate monthly trends correctly', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const now = new Date();

      // Create content for past 3 months
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15);

        await testPrisma.content_items.create({
          data: {
            title: `Content Month ${monthOffset}`,
            slug: `content-month-${monthOffset}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: date,
            view_count: 100 * (monthOffset + 1),
            like_count: 10 * (monthOffset + 1),
            share_count: 5 * (monthOffset + 1),
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

      const trends = await getContentTrends(6);

      expect(trends).toBeDefined();
      expect(trends.length).toBe(6);
      expect(trends[0]).toHaveProperty('month');
      expect(trends[0]).toHaveProperty('views');
      expect(trends[0]).toHaveProperty('engagement');
    });
  });

  // ============================================================================
  // TOP PERFORMING CONTENT TESTS
  // ============================================================================
  describe('Top Performing Content', () => {
    it('should return top 10 content by views', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create 15 content items with varying views
      for (let i = 0; i < 15; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Content ${i}`,
            slug: `content-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 100 * (15 - i), // Descending views
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

      const topContent = await getTopPerformingContent();

      expect(topContent).toHaveLength(10); // Top 10 only
      expect(topContent[0].view_count).toBeGreaterThanOrEqual(topContent[9].view_count);
    });

    it('should filter top content by type', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create blog posts
      for (let i = 0; i < 5; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Blog ${i}`,
            slug: `blog-${i}`,
            content: 'Content',
            type: ContentType.BLOG_POST,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 100 * i,
            organization_id: organization.id,
            author_id: user.id,
          },
        });
      }

      // Create articles
      for (let i = 0; i < 3; i++) {
        await testPrisma.content_items.create({
          data: {
            title: `Article ${i}`,
            slug: `article-${i}`,
            content: 'Content',
            type: ContentType.ARTICLE,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            view_count: 200 * i,
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

      const topBlogs = await getTopPerformingContent(ContentType.BLOG_POST);

      expect(topBlogs.length).toBeLessThanOrEqual(5);
      topBlogs.forEach(content => {
        expect(content.type).toBe(ContentType.BLOG_POST);
      });
    });
  });

  // ============================================================================
  // PERFORMANCE BY TYPE TESTS
  // ============================================================================
  describe('Content Performance By Type', () => {
    it('should group metrics by content type', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create different content types
      await testPrisma.content_items.create({
        data: {
          title: 'Blog Post',
          slug: 'blog-post',
          content: 'Content',
          type: ContentType.BLOG_POST,
          status: ContentStatus.PUBLISHED,
          published_at: new Date(),
          view_count: 100,
          share_count: 10,
          like_count: 20,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      await testPrisma.content_items.create({
        data: {
          title: 'Article',
          slug: 'article',
          content: 'Content',
          type: ContentType.ARTICLE,
          status: ContentStatus.PUBLISHED,
          published_at: new Date(),
          view_count: 200,
          share_count: 20,
          like_count: 40,
          organization_id: organization.id,
          author_id: user.id,
        },
      });

      (requireAuth as jest.Mock).mockResolvedValue(user);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
      });

      const byType = await getContentPerformanceByType();

      const blogPost = byType.find(item => item.type === ContentType.BLOG_POST);
      const article = byType.find(item => item.type === ContentType.ARTICLE);

      expect(blogPost).toBeDefined();
      expect(blogPost?.count).toBe(1);
      expect(blogPost?.totalViews).toBe(100);

      expect(article).toBeDefined();
      expect(article?.count).toBe(1);
      expect(article?.totalViews).toBe(200);
    });
  });
});
