/**
 * SEO Utilities - Public API
 *
 * Barrel export file for all SEO-related utilities.
 * Import from '@/lib/seo' to access metadata and schema generators.
 */

// Metadata generators
export {
  generateMetadata,
  generateBlogPostMetadata,
  generateCaseStudyMetadata,
  generateSolutionMetadata,
  generateIndustryMetadata,
  type MetadataParams,
} from './metadata';

// JSON-LD schema generators
export {
  getOrganizationSchema,
  getWebsiteSchema,
  getBlogPostSchema,
  getArticleSchema,
  getFAQSchema,
  getProductSchema,
  getServiceSchema,
  getBreadcrumbSchema,
  getReviewSchema,
  getEventSchema,
} from './schema';
