/**
 * Marketplace Module - Public API
 *
 * Tool & Dashboard Marketplace for installing additional functionality
 * Supports FREE (pre-installed) and CUSTOM (pay-per-use) tiers
 *
 * Features:
 * - Browse available tools and dashboards
 * - Purchase tools individually or in bundles
 * - Review and rate tools
 * - Shopping cart functionality
 * - Multi-tenant purchase tracking
 */

// Export actions
export {
  purchaseTool,
  purchaseBundle,
  trackToolUsage,
} from './actions';

export {
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
} from './cart/actions';

export {
  createToolReview,
  updateToolReview,
  deleteToolReview,
} from './reviews/actions';

// Export queries
export {
  getMarketplaceTools,
  getMarketplaceToolById,
  getPurchasedTools,
  getToolPurchase,
  getToolBundles,
  getToolBundleById,
  getPurchasedBundles,
  getMarketplaceStats,
  getPurchasedToolsWithStats,
  getToolPurchaseDetails,
} from './queries';

export {
  getShoppingCart,
  getCartWithItems,
} from './cart/queries';

export {
  getToolReviews,
  getUserReviewForTool,
  getReviewStats,
  getUserReviews,
  hasUserPurchasedTool,

} from './reviews/queries';

// Re-export Prisma types
export type {
  marketplace_tools as MarketplaceTool,
  tool_purchases as ToolPurchase,
  tool_bundles as ToolBundle,
  bundle_purchases as BundlePurchase,
  tool_reviews as ToolReview,
  shopping_carts as ShoppingCart,
} from '@prisma/client';
