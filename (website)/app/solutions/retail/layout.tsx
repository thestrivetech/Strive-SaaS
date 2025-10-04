import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Retail Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Retail Technology Solutions | E-Commerce AI | Strive Tech',
  description:
    'Enhance retail operations with AI-powered solutions. From inventory management to personalized customer experiences, transform your retail business.',
  path: '/solutions/retail',
  keywords: [
    'retail technology',
    'e-commerce AI',
    'inventory management',
    'customer personalization',
    'retail automation',
    'point of sale',
  ],
  type: 'website',
});

export default function RetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Retail', url: '/solutions/retail' },
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
