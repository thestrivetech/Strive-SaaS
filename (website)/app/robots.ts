import { MetadataRoute } from 'next';

/**
 * Dynamic Robots.txt Configuration for Strive Tech Website
 * Migrated from old React site's static robots.txt
 * Maintains same crawler rules, disallow patterns, and sitemap references
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai';

  return {
    rules: [
      // Allow all major search engines (default)
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/onboarding',
          '/login',
          '/admin',
          '/api/',
          '/_next/',
          '/static/',
        ],
        crawlDelay: 1, // Prevent aggressive crawling
      },
      // Explicitly allow major search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'Slurp', // Yahoo
        allow: '/',
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
      },
      // Block problematic/aggressive crawlers
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      // Optionally block AI scrapers (uncomment to enable)
      // {
      //   userAgent: 'GPTBot', // OpenAI
      //   disallow: '/',
      // },
      // {
      //   userAgent: 'CCBot', // Common Crawl
      //   disallow: '/',
      // },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
