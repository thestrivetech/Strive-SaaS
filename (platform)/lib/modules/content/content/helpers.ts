import { prisma } from '@/lib/database/prisma';

/**
 * Content Module - Helper Functions
 *
 * Utility functions for slug generation, SEO optimization,
 * and content validation.
 */

/**
 * Generate unique slug for content item
 *
 * @param baseSlug - Initial slug (from title or custom)
 * @param organizationId - Organization ID for uniqueness check
 * @returns Promise<string> - Unique slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  organizationId: string
): Promise<string> {
  // Normalize slug: lowercase, replace spaces/special chars with hyphens
  const slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let counter = 1;
  let uniqueSlug = slug;

  // Check if slug exists, append counter if needed
  while (await isSlugTaken(uniqueSlug, organizationId)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Check if slug is already taken in organization
 *
 * @param slug - Slug to check
 * @param organizationId - Organization ID
 * @returns Promise<boolean> - true if slug exists
 */
async function isSlugTaken(
  slug: string,
  organizationId: string
): Promise<boolean> {
  const existing = await prisma.content_items.findFirst({
    where: {
      slug,
      organization_id: organizationId,
    },
  });

  return !!existing;
}

/**
 * Generate SEO-friendly excerpt from content
 *
 * @param content - Full content (may contain HTML)
 * @param maxLength - Maximum excerpt length (default: 160 chars)
 * @returns string - Generated excerpt
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');

  // Return as-is if under max length
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Trim to max length at word boundary
  const trimmed = plainText.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');

  return trimmed.substring(0, lastSpace) + '...';
}

/**
 * Extract keywords from content using simple frequency analysis
 *
 * @param content - Full content text
 * @param count - Number of keywords to extract (default: 10)
 * @returns string[] - Array of keywords
 */
export function extractKeywords(content: string, count: number = 10): string[] {
  // Simple keyword extraction (production should use NLP library like natural or compromise)
  const words = content
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 4); // Only words > 4 chars

  // Count word frequency
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency and return top N
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Validate SEO optimization for content
 *
 * @param content - Content object with SEO fields
 * @returns object - Validation result with issues array
 */
export function validateSEO(content: {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  content: string;
}) {
  const issues: string[] = [];

  // Title checks
  if (!content.metaTitle && content.title.length > 60) {
    issues.push('Title exceeds 60 characters (SEO best practice)');
  }

  if (content.metaTitle && content.metaTitle.length > 60) {
    issues.push('Meta title exceeds 60 characters');
  }

  // Meta description checks
  if (!content.metaDescription) {
    issues.push('Meta description is missing (highly recommended for SEO)');
  } else if (content.metaDescription.length > 160) {
    issues.push('Meta description exceeds 160 characters');
  } else if (content.metaDescription.length < 50) {
    issues.push('Meta description is too short (minimum 50 characters recommended)');
  }

  // Keywords check
  if (content.keywords.length === 0) {
    issues.push('No keywords defined (recommended for SEO)');
  } else if (content.keywords.length > 10) {
    issues.push('Too many keywords (5-10 recommended)');
  }

  // Content length check
  const wordCount = content.content.split(/\s+/).length;
  if (wordCount < 300) {
    issues.push('Content is too short (minimum 300 words recommended for SEO)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    score: Math.max(0, 100 - (issues.length * 20)), // Simple scoring system
  };
}
