import { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generation for Strive Tech Website
 * Migrated from old React site's static sitemap.xml
 * Maintains same structure, priorities, and change frequencies
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai';
  const currentDate = new Date().toISOString();

  // Static pages (matching old sitemap.xml structure)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/assessment`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/request`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Solution pages (matching old sitemap structure)
  // Industry solutions
  const industrySolutions: MetadataRoute.Sitemap = [
    'healthcare',
    'financial',
    'retail',
    'manufacturing',
    'education',
  ].map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Technology/service solutions
  const technologySolutions: MetadataRoute.Sitemap = [
    'ai-automation',
    'computer-vision',
    'data-analytics',
    'blockchain',
    'business-intelligence',
    'security-compliance',
    'smart-business',
    'technology',
  ].map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: slug === 'ai-automation' || slug === 'computer-vision' || slug === 'data-analytics' ? 0.8 : 0.7,
  }));

  // Case studies (if they exist as separate pages)
  const caseStudyPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/solutions/case-studies`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  return [
    ...staticPages,
    ...industrySolutions,
    ...technologySolutions,
    ...caseStudyPages,
  ];
}
