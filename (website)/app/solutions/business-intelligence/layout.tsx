import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Business Intelligence Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Business Intelligence Solutions | BI & Analytics | Strive Tech',
  description:
    'Empower decision-making with comprehensive business intelligence. Transform complex data into clear insights with dashboards, reports, and predictive analytics.',
  path: '/solutions/business-intelligence',
  keywords: [
    'business intelligence',
    'BI solutions',
    'data dashboards',
    'reporting tools',
    'analytics platform',
    'decision support',
  ],
  type: 'website',
});

export default function BusinessIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Business Intelligence', url: '/solutions/business-intelligence' },
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
