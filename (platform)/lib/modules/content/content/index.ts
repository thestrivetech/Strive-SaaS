/**
 * Content Module - Public API
 *
 * Centralized exports for content management functionality.
 * This is the only file that should be imported from outside the content module.
 */

// ============================================================================
// Queries
// ============================================================================

export {
  getContentItems,
  getContentItemById,
  getContentBySlug,
  getContentStats,
  getContentCount,
} from './queries';

// ============================================================================
// Actions
// ============================================================================

export {
  createContentItem,
  updateContentItem,
  publishContent,
  unpublishContent,
  deleteContent,
} from './actions';

// ============================================================================
// Helpers
// ============================================================================

export {
  generateUniqueSlug,
  generateExcerpt,
  extractKeywords,
  validateSEO,
} from './helpers';

// ============================================================================
// Prisma Types
// ============================================================================

export type {
  content_items,
  content_revisions,
  content_categories,
  content_tags,
  content_comments,
} from '@prisma/client';

export { ContentType, ContentStatus } from '@prisma/client';
