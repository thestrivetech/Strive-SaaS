/**
 * Content Data Provider
 *
 * Switches between mock data and real Prisma queries for content items
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  CMS_MOCK_DATA,
  type MockContentItem,
} from '../mocks/content';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentFilters {
  search?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
  type?: 'BLOG_POST' | 'PAGE' | 'ARTICLE' | 'LANDING_PAGE';
  category_id?: string;
  author_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
}

export interface RecentContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  updated_at: Date;
}

// ============================================================================
// CONTENT PROVIDER
// ============================================================================

export const contentProvider = {
  /**
   * Find many content items with filters
   */
  async findMany(organizationId: string, filters?: ContentFilters): Promise<MockContentItem[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch content items');

      let items = CMS_MOCK_DATA.contentItems.filter(
        (item) => item.organization_id === organizationId
      );

      // Apply filters
      if (filters?.status) {
        items = items.filter((item) => item.status === filters.status);
      }

      if (filters?.type) {
        items = items.filter((item) => item.type === filters.type);
      }

      if (filters?.category_id) {
        items = items.filter((item) => item.category_id === filters.category_id);
      }

      if (filters?.author_id) {
        items = items.filter((item) => item.author_id === filters.author_id);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            item.slug.toLowerCase().includes(searchLower) ||
            item.excerpt.toLowerCase().includes(searchLower) ||
            item.content.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        items = items.filter((item) =>
          filters.tags!.some((tag) => item.tags.includes(tag))
        );
      }

      // Sort by updated_at descending
      items = items.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

      // Apply pagination
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 50;
      items = items.slice(offset, offset + limit);

      return items;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find single content item by ID
   */
  async findById(id: string, organizationId: string): Promise<MockContentItem | null> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch content item');

      const item = CMS_MOCK_DATA.contentItems.find(
        (item) => item.id === id && item.organization_id === organizationId
      );

      return item || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find content item by slug
   */
  async findBySlug(slug: string, organizationId: string): Promise<MockContentItem | null> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch content by slug');

      const item = CMS_MOCK_DATA.contentItems.find(
        (item) =>
          item.slug === slug &&
          item.organization_id === organizationId &&
          item.status === 'PUBLISHED'
      );

      return item || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get content statistics
   */
  async getStats(organizationId: string): Promise<ContentStats> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch content stats');

      const items = CMS_MOCK_DATA.contentItems.filter(
        (item) => item.organization_id === organizationId
      );

      return {
        total: items.length,
        published: items.filter((i) => i.status === 'PUBLISHED').length,
        draft: items.filter((i) => i.status === 'DRAFT').length,
        scheduled: items.filter((i) => i.status === 'SCHEDULED').length,
        archived: items.filter((i) => i.status === 'ARCHIVED').length,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get recent content items
   */
  async getRecent(organizationId: string, limit: number = 5): Promise<RecentContentItem[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch recent content');

      const items = CMS_MOCK_DATA.contentItems
        .filter((item) => item.organization_id === organizationId)
        .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
        .slice(0, limit);

      return items.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        updated_at: item.updated_at,
      }));
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get total view count across all content
   */
  async getTotalViews(organizationId: string): Promise<number> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch total views');

      const items = CMS_MOCK_DATA.contentItems.filter(
        (item) => item.organization_id === organizationId
      );

      return items.reduce((sum, item) => sum + item.view_count, 0);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get count of content items with filters
   */
  async getCount(organizationId: string, filters?: ContentFilters): Promise<number> {
    if (dataConfig.useMocks) {
      await simulateDelay();

      const items = await this.findMany(organizationId, { ...filters, limit: 999999 });
      return items.length;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
