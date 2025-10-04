import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * About Page Metadata
 * Enhanced SEO for company/about page
 */
export const metadata: Metadata = generateMetadata({
  title: 'About Strive Tech | AI & Software Development Experts',
  description:
    "Learn about Strive Tech's mission to transform businesses through innovative AI solutions and custom software development. Meet our team and discover our vision for the future.",
  path: '/about',
  keywords: [
    'about strive tech',
    'AI development team',
    'software development company',
    'AI consulting experts',
    'business transformation',
    'technology innovation',
  ],
  type: 'website',
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
