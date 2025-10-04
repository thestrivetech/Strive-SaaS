/**
 * SEO Metadata Utilities
 *
 * Provides helpers for generating consistent, SEO-optimized metadata
 * across all pages of the marketing website.
 */

import type { Metadata } from 'next';

/**
 * Parameters for generating page metadata
 */
export interface MetadataParams {
  /** Page title (will be appended with " | Strive Tech") */
  title: string;
  /** Meta description (150-160 characters recommended) */
  description: string;
  /** Page path (e.g., "/solutions/ai-automation") */
  path: string;
  /** OpenGraph/Twitter image URL (optional, uses default if not provided) */
  image?: string;
  /** Keywords for SEO (optional) */
  keywords?: string[];
  /** Content type: 'website' or 'article' */
  type?: 'website' | 'article';
  /** Published date (for articles/blog posts) */
  publishedTime?: string;
  /** Modified date (for articles/blog posts) */
  modifiedTime?: string;
  /** Author name (for articles/blog posts) */
  author?: string;
  /** Section/category (for articles) */
  section?: string;
  /** Tags (for articles) */
  tags?: string[];
  /** Disable indexing (default: false) */
  noIndex?: boolean;
}

/**
 * Default site configuration
 */
const siteConfig = {
  name: 'Strive Tech',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai',
  ogImage: '/og-image.png',
  twitterHandle: '@strive_tech',
  locale: 'en_US',
};

/**
 * Generate comprehensive metadata for a page
 *
 * @param params - Metadata parameters
 * @returns Next.js Metadata object
 *
 * @example
 * ```ts
 * export const metadata = generateMetadata({
 *   title: 'AI Automation Solutions',
 *   description: 'Transform your business with intelligent AI automation',
 *   path: '/solutions/ai-automation',
 *   keywords: ['AI automation', 'machine learning'],
 * });
 * ```
 */
export function generateMetadata(params: MetadataParams): Metadata {
  const {
    title,
    description,
    path,
    image,
    keywords,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noIndex = false,
  } = params;

  // Build canonical URL
  const url = `${siteConfig.url}${path}`;

  // Use provided image or default
  const ogImage = image ? `${siteConfig.url}${image}` : `${siteConfig.url}${siteConfig.ogImage}`;

  // Build full title
  const fullTitle = path === '/' ? title : `${title} | ${siteConfig.name}`;

  // Base metadata
  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),

    // OpenGraph metadata
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && type === 'article' && {
        authors: [author],
      }),
      ...(section && type === 'article' && { section }),
      ...(tags && type === 'article' && { tags }),
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Robots
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };

  return metadata;
}

/**
 * Generate metadata for a blog post
 *
 * @param params - Blog post metadata
 * @returns Next.js Metadata object
 */
export function generateBlogPostMetadata(params: {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
  category?: string;
}): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    path: `/resources/blog/${params.slug}`,
    image: params.image,
    type: 'article',
    publishedTime: params.publishedAt,
    modifiedTime: params.updatedAt || params.publishedAt,
    author: params.author,
    section: params.category,
    tags: params.tags,
  });
}

/**
 * Generate metadata for a case study
 *
 * @param params - Case study metadata
 * @returns Next.js Metadata object
 */
export function generateCaseStudyMetadata(params: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  image?: string;
  industry?: string;
  tags?: string[];
}): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    path: `/resources/case-studies/${params.slug}`,
    image: params.image,
    type: 'article',
    publishedTime: params.publishedAt,
    section: params.industry,
    tags: params.tags,
  });
}

/**
 * Generate metadata for a solution page
 *
 * @param params - Solution metadata
 * @returns Next.js Metadata object
 */
export function generateSolutionMetadata(params: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    path: `/solutions/${params.slug}`,
    image: params.image,
    keywords: params.keywords,
    type: 'website',
  });
}

/**
 * Generate metadata for an industry page
 *
 * @param params - Industry metadata
 * @returns Next.js Metadata object
 */
export function generateIndustryMetadata(params: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    path: `/industries/${params.slug}`,
    image: params.image,
    keywords: params.keywords,
    type: 'website',
  });
}
