import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Data Analytics Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Data Analytics Solutions | Business Intelligence AI | Strive Tech',
  description:
    'Transform data into insights with advanced analytics and AI. Make data-driven decisions, predict trends, and optimize business outcomes.',
  path: '/solutions/data-analytics',
  keywords: [
    'data analytics',
    'business intelligence',
    'predictive analytics',
    'data visualization',
    'big data',
    'analytics AI',
  ],
  type: 'website',
});

export default function DataAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Data Analytics', url: '/solutions/data-analytics' },
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
