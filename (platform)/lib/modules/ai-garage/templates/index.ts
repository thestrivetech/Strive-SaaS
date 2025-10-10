/**
 * Agent Templates Module - Public API
 *
 * Marketplace functionality for agent templates:
 * - System templates (built-in)
 * - Public templates (shared by users)
 * - Private templates (organization-specific)
 * - Template reviews and ratings
 * - Usage tracking
 */

// Export queries
export {
  getTemplates,
  getTemplatesCount,
  getTemplateById,
  getTemplatesByCategory,
  getPopularTemplates,
  getSystemTemplates,
  getOrganizationTemplates,
  getTemplateStats,
} from './queries';

// Export types
export type { TemplateFilters } from './queries';

// Export actions
export {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createReview,
  updateReview,
  deleteReview,
  incrementTemplateUsage,
  toggleTemplateVisibility,
} from './actions';

// Export utilities
export {
  calculateTemplatePopularity,
  getTemplateQualityBadge,
  getTemplateIcon,
  getCategoryDisplayName,
  getCategoryDescription,
  formatRating,
  getRatingStars,
  formatUsageCount,
  canEditTemplate,
  canDeleteTemplate,
  validateTemplateConfiguration,
  getTemplateVisibilityLabel,
  generateTemplatePreview,
  sortTemplatesByPopularity,
  filterTemplatesBySearch,
} from './utils';
