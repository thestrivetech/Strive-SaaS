/**
 * SEO Configuration Types
 *
 * Comprehensive types for managing SEO metadata across the application.
 * Used primarily with react-helmet-async for dynamic meta tag management.
 */

/**
 * Main SEO configuration interface
 * Used by MetaTags component to generate all necessary SEO meta tags
 */
export interface SEOConfig {
  /** Page title - appears in browser tab and search results */
  title: string;

  /** Meta description - appears in search results (150-160 chars recommended) */
  description: string;

  /** Keywords for SEO (optional, less important for modern SEO) */
  keywords?: string[];

  /** Open Graph image URL - for social media sharing */
  ogImage?: string;

  /** Open Graph type - typically 'website', 'article', or 'product' */
  ogType?: 'website' | 'article' | 'product';

  /** Twitter card type for Twitter sharing */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  /** Canonical URL to prevent duplicate content issues */
  canonical?: string;

  /** Prevent search engines from indexing this page */
  noindex?: boolean;

  /** Prevent search engines from following links on this page */
  nofollow?: boolean;
}

/**
 * Props interface for meta tag components
 * Simplified version for components that don't need full SEO config
 */
export interface MetaTagsProps {
  /** SEO configuration object */
  seo: SEOConfig;
}

/**
 * Open Graph specific configuration
 * For more granular control over social media sharing
 */
export interface OpenGraphConfig {
  /** Page title for Open Graph */
  title: string;

  /** Description for Open Graph */
  description: string;

  /** Full URL of the page */
  url: string;

  /** Image URL for social sharing (1200x630px recommended) */
  image: string;

  /** Content type */
  type: 'website' | 'article' | 'product';

  /** Site name */
  siteName?: string;

  /** Locale (e.g., 'en_US') */
  locale?: string;
}

/**
 * Twitter Card specific configuration
 * For Twitter-specific meta tags
 */
export interface TwitterCardConfig {
  /** Type of Twitter card */
  card: 'summary' | 'summary_large_image' | 'app' | 'player';

  /** Twitter handle of website (e.g., '@strivetechAI') */
  site?: string;

  /** Twitter handle of content creator */
  creator?: string;

  /** Title for Twitter card */
  title: string;

  /** Description for Twitter card */
  description: string;

  /** Image URL for Twitter card */
  image?: string;
}

/**
 * Helper type for page-specific SEO
 * Extends SEOConfig with additional page metadata
 */
export interface PageSEO extends SEOConfig {
  /** Page-specific structured data (JSON-LD) */
  structuredData?: Record<string, unknown>;

  /** Language of the page content */
  language?: string;

  /** Author of the content */
  author?: string;

  /** Publication date (for articles/blog posts) */
  publishedDate?: string;

  /** Last modified date */
  modifiedDate?: string;
}
