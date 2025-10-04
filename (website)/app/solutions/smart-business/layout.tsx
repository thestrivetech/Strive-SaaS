import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Smart Business Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Smart Business Solutions | AI for Operations | Strive Tech',
  description:
    'Modernize your business operations with intelligent automation. Optimize workflows, enhance productivity, and drive growth with AI-powered business solutions.',
  path: '/solutions/smart-business',
  keywords: [
    'smart business',
    'business automation',
    'operational AI',
    'workflow optimization',
    'digital transformation',
    'intelligent operations',
  ],
  type: 'website',
});

export default function SmartBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Smart Business', url: '/solutions/smart-business' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
