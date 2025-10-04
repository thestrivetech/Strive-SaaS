import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Resources Page Metadata
 * Enhanced SEO for blog, whitepapers, and resources
 */
export const metadata: Metadata = generateMetadata({
  title: 'Resources | AI Insights, Blog & Whitepapers | Strive Tech',
  description:
    'Access our library of AI insights, blog posts, whitepapers, and case studies. Stay informed about the latest trends in AI and software development.',
  path: '/resources',
  keywords: [
    'AI resources',
    'technology blog',
    'whitepapers',
    'case studies',
    'AI insights',
    'software development guides',
  ],
  type: 'website',
});

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
