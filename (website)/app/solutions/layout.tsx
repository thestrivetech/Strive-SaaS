import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Solutions Page Metadata
 * Enhanced SEO for solutions listing page
 */
export const metadata: Metadata = generateMetadata({
  title: 'AI & Technology Solutions | Industry-Specific Services | Strive Tech',
  description:
    'Discover our comprehensive AI and technology solutions tailored for your industry. From AI automation to healthcare tech, we deliver transformative results.',
  path: '/solutions',
  keywords: [
    'AI solutions',
    'technology solutions',
    'AI automation',
    'industry software',
    'healthcare tech',
    'financial technology',
    'business intelligence',
  ],
  type: 'website',
});

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
