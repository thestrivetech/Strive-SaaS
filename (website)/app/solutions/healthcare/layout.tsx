import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Healthcare Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Healthcare Technology Solutions | HIPAA-Compliant AI | Strive Tech',
  description:
    'Transform healthcare delivery with HIPAA-compliant AI solutions. Improve patient outcomes, streamline operations, and enhance care quality with our healthcare technology.',
  path: '/solutions/healthcare',
  keywords: [
    'healthcare technology',
    'HIPAA-compliant AI',
    'medical software',
    'patient care solutions',
    'healthcare automation',
    'EHR integration',
  ],
  type: 'website',
});

export default function HealthcareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Healthcare', url: '/solutions/healthcare' },
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
