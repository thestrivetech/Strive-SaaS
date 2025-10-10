/**
 * Marketplace Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockTool,
  generateMockTools,
  generateMockBundle,
  generateMockBundles,
  generateMockPurchase,
  generateMockReview,
  generateMockCart,
  calculateCartTotal,
  type MockTool,
  type MockBundle,
  type MockPurchase,
  type MockReview,
  type MockCart,
} from '../mocks/marketplace';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockToolsStore: MockTool[] = [];
let mockBundlesStore: MockBundle[] = [];
const mockPurchasesStore: MockPurchase[] = [];
const mockReviewsStore: MockReview[] = [];
const mockCartsStore: MockCart[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData() {
  if (mockToolsStore.length === 0) {
    mockToolsStore = generateMockTools(47);
  }
  if (mockBundlesStore.length === 0) {
    const toolIds = mockToolsStore.map((t) => t.id);
    mockBundlesStore = generateMockBundles(toolIds, 6);
  }
  // Initialize some purchases for demo org
  if (mockPurchasesStore.length === 0) {
    const demoOrgId = 'demo-org';
    const demoUserId = 'demo-user';

    // Create 3-5 purchases for demo purposes
    const numPurchases = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPurchases && i < mockToolsStore.length; i++) {
      const tool = mockToolsStore[i];
      const purchase = generateMockPurchase(tool.id, demoOrgId, demoUserId, {
        price_at_purchase: tool.price,
        status: i === 0 ? 'TRIAL' : 'ACTIVE',
      });
      // Populate tool relation
      purchase.tool = { id: tool.id, name: tool.name };
      mockPurchasesStore.push(purchase);
    }
  }
}

// ============================================================================
// TOOLS PROVIDER
// ============================================================================

export interface ToolFilters {
  category?: MockTool['category'][];
  tier?: MockTool['tier'][];
  search?: string;
  price_min?: number;
  price_max?: number;
  tags?: string[];
  is_active?: boolean;
}

export const toolsProvider = {
  /**
   * Find all tools with optional filters
   */
  async findMany(filters?: ToolFilters): Promise<MockTool[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch tools');

      let tools = [...mockToolsStore];

      // Apply filters
      if (filters?.category && filters.category.length > 0) {
        tools = tools.filter((t) => filters.category!.includes(t.category));
      }

      if (filters?.tier && filters.tier.length > 0) {
        tools = tools.filter((t) => filters.tier!.includes(t.tier));
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        tools = tools.filter(
          (t) =>
            t.name.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filters?.price_min !== undefined) {
        tools = tools.filter((t) => t.price >= filters.price_min!);
      }

      if (filters?.price_max !== undefined) {
        tools = tools.filter((t) => t.price <= filters.price_max!);
      }

      if (filters?.tags && filters.tags.length > 0) {
        tools = tools.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
      }

      if (filters?.is_active !== undefined) {
        tools = tools.filter((t) => t.is_active === filters.is_active);
      }

      return tools;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find tool by ID
   */
  async findById(id: string): Promise<MockTool | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch tool');

      return mockToolsStore.find((t) => t.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find tool by slug
   */
  async findBySlug(slug: string): Promise<MockTool | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch tool');

      return mockToolsStore.find((t) => t.slug === slug) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Search tools by query
   */
  async search(query: string): Promise<MockTool[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to search tools');

      const lowerQuery = query.toLowerCase();
      return mockToolsStore.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get featured tools (high ratings, popular)
   */
  async getFeatured(limit: number = 8): Promise<MockTool[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch featured tools');

      return mockToolsStore
        .filter((t) => t.is_active && t.average_rating >= 4.0)
        .sort((a, b) => b.install_count - a.install_count)
        .slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get popular tools (most installs)
   */
  async getPopular(limit: number = 10): Promise<MockTool[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch popular tools');

      return mockToolsStore
        .filter((t) => t.is_active)
        .sort((a, b) => b.install_count - a.install_count)
        .slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// BUNDLES PROVIDER
// ============================================================================

export const bundlesProvider = {
  /**
   * Find all bundles
   */
  async findMany(): Promise<MockBundle[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch bundles');

      return mockBundlesStore.filter((b) => b.is_active);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find bundle by ID
   */
  async findById(id: string): Promise<MockBundle | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch bundle');

      return mockBundlesStore.find((b) => b.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find bundle by slug
   */
  async findBySlug(slug: string): Promise<MockBundle | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch bundle');

      return mockBundlesStore.find((b) => b.slug === slug) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find bundles by type
   */
  async findByType(bundleType: MockBundle['bundle_type']): Promise<MockBundle[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch bundles by type');

      return mockBundlesStore.filter(
        (b) => b.bundle_type === bundleType && b.is_active
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// PURCHASES PROVIDER
// ============================================================================

export const purchasesProvider = {
  /**
   * Find all purchases for an organization
   */
  async findMany(orgId: string): Promise<MockPurchase[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch purchases');

      const purchases = mockPurchasesStore.filter((p) => p.organization_id === orgId);

      // Populate tool relation if not already populated
      purchases.forEach((purchase) => {
        if (!purchase.tool) {
          const tool = mockToolsStore.find((t) => t.id === purchase.tool_id);
          if (tool) {
            purchase.tool = { id: tool.id, name: tool.name };
          }
        }
      });

      return purchases;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find purchase by ID
   */
  async findById(id: string, orgId: string): Promise<MockPurchase | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch purchase');

      return (
        mockPurchasesStore.find(
          (p) => p.id === id && p.organization_id === orgId
        ) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new purchase
   */
  async create(data: {
    toolId: string;
    orgId: string;
    userId: string;
    price: number;
    status?: MockPurchase['status'];
  }): Promise<MockPurchase> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to create purchase');

      const newPurchase = generateMockPurchase(data.toolId, data.orgId, data.userId, {
        price_at_purchase: data.price,
        status: data.status || 'ACTIVE',
      });

      mockPurchasesStore.push(newPurchase);

      // Update tool install count
      const tool = mockToolsStore.find((t) => t.id === data.toolId);
      if (tool) {
        tool.install_count += 1;
      }

      return newPurchase;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Cancel a purchase (update status)
   */
  async cancel(id: string, orgId: string): Promise<MockPurchase> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to cancel purchase');

      const index = mockPurchasesStore.findIndex(
        (p) => p.id === id && p.organization_id === orgId
      );

      if (index === -1) throw new Error('Purchase not found');

      mockPurchasesStore[index].status = 'CANCELLED';
      return mockPurchasesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Check if organization has access to a tool
   */
  async hasAccess(toolId: string, orgId: string): Promise<boolean> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();

      const activePurchase = mockPurchasesStore.find(
        (p) =>
          p.tool_id === toolId &&
          p.organization_id === orgId &&
          (p.status === 'ACTIVE' || p.status === 'TRIAL') &&
          (p.expires_at === null || p.expires_at > new Date())
      );

      return !!activePurchase;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// REVIEWS PROVIDER
// ============================================================================

export const reviewsProvider = {
  /**
   * Find all reviews for a tool
   */
  async findMany(toolId: string): Promise<MockReview[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch reviews');

      return mockReviewsStore.filter((r) => r.tool_id === toolId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new review
   */
  async create(data: {
    toolId: string;
    userId: string;
    orgId: string;
    rating: number;
    text?: string;
  }): Promise<MockReview> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to create review');

      const newReview = generateMockReview(data.toolId, data.userId, data.orgId, {
        rating: data.rating,
        review_text: data.text || null,
      });

      mockReviewsStore.push(newReview);

      // Update tool average rating and review count
      const tool = mockToolsStore.find((t) => t.id === data.toolId);
      if (tool) {
        const toolReviews = mockReviewsStore.filter((r) => r.tool_id === data.toolId);
        const avgRating =
          toolReviews.reduce((sum, r) => sum + r.rating, 0) / toolReviews.length;
        tool.average_rating = Math.round(avgRating * 10) / 10;
        tool.review_count = toolReviews.length;
      }

      return newReview;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Check if user has reviewed a tool
   */
  async hasReviewed(toolId: string, userId: string): Promise<boolean> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();

      return mockReviewsStore.some(
        (r) => r.tool_id === toolId && r.user_id === userId
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// CART PROVIDER
// ============================================================================

export const cartProvider = {
  /**
   * Get user's cart
   */
  async get(userId: string): Promise<MockCart | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch cart');

      let cart = mockCartsStore.find((c) => c.user_id === userId);

      if (!cart) {
        // Create empty cart if it doesn't exist
        cart = generateMockCart(userId);
        mockCartsStore.push(cart);
      }

      return cart;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Add tool to cart
   */
  async addTool(userId: string, toolId: string): Promise<MockCart> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to add tool to cart');

      let cart = mockCartsStore.find((c) => c.user_id === userId);

      if (!cart) {
        cart = generateMockCart(userId);
        mockCartsStore.push(cart);
      }

      // Add tool if not already in cart
      if (!cart.tools.includes(toolId)) {
        cart.tools.push(toolId);
        cart.total_price = calculateCartTotal(
          cart.tools,
          cart.bundles,
          mockToolsStore,
          mockBundlesStore
        );
        cart.updated_at = new Date();
      }

      return cart;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Remove tool from cart
   */
  async removeTool(userId: string, toolId: string): Promise<MockCart> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to remove tool from cart');

      const cart = mockCartsStore.find((c) => c.user_id === userId);
      if (!cart) throw new Error('Cart not found');

      cart.tools = cart.tools.filter((id) => id !== toolId);
      cart.total_price = calculateCartTotal(
        cart.tools,
        cart.bundles,
        mockToolsStore,
        mockBundlesStore
      );
      cart.updated_at = new Date();

      return cart;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Add bundle to cart
   */
  async addBundle(userId: string, bundleId: string): Promise<MockCart> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to add bundle to cart');

      let cart = mockCartsStore.find((c) => c.user_id === userId);

      if (!cart) {
        cart = generateMockCart(userId);
        mockCartsStore.push(cart);
      }

      // Add bundle if not already in cart
      if (!cart.bundles.includes(bundleId)) {
        cart.bundles.push(bundleId);
        cart.total_price = calculateCartTotal(
          cart.tools,
          cart.bundles,
          mockToolsStore,
          mockBundlesStore
        );
        cart.updated_at = new Date();
      }

      return cart;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Remove bundle from cart
   */
  async removeBundle(userId: string, bundleId: string): Promise<MockCart> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to remove bundle from cart');

      const cart = mockCartsStore.find((c) => c.user_id === userId);
      if (!cart) throw new Error('Cart not found');

      cart.bundles = cart.bundles.filter((id) => id !== bundleId);
      cart.total_price = calculateCartTotal(
        cart.tools,
        cart.bundles,
        mockToolsStore,
        mockBundlesStore
      );
      cart.updated_at = new Date();

      return cart;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Clear cart
   */
  async clear(userId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to clear cart');

      const cart = mockCartsStore.find((c) => c.user_id === userId);
      if (cart) {
        cart.tools = [];
        cart.bundles = [];
        cart.total_price = 0;
        cart.updated_at = new Date();
      }

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
