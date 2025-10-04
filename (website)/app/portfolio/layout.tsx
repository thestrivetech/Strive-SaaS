import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Portfolio Page Metadata
 * Enhanced SEO for project showcase and portfolio
 */
export const metadata: Metadata = generateMetadata({
  title: 'Portfolio | AI & Software Development Projects | Strive Tech',
  description:
    'Explore our portfolio of successful AI and software development projects. See real-world examples of how we help businesses transform through innovative technology solutions.',
  path: '/portfolio',
  keywords: [
    'AI projects',
    'software development portfolio',
    'case studies',
    'technology solutions',
    'client success stories',
    'AI implementations',
  ],
  type: 'website',
});

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
