import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Manufacturing Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Manufacturing Solutions | Industry 4.0 AI | Strive Tech',
  description:
    'Revolutionize manufacturing with Industry 4.0 AI solutions. Optimize production, reduce downtime, and improve quality with predictive maintenance and automation.',
  path: '/solutions/manufacturing',
  keywords: [
    'manufacturing technology',
    'Industry 4.0',
    'predictive maintenance',
    'production optimization',
    'smart factory',
    'quality control AI',
  ],
  type: 'website',
});

export default function ManufacturingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Manufacturing', url: '/solutions/manufacturing' },
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
