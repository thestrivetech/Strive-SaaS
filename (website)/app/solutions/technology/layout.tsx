import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Technology Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Technology Solutions | Custom Software Development | Strive Tech',
  description:
    'Build cutting-edge technology solutions tailored to your needs. From custom software to enterprise platforms, deliver innovation at scale.',
  path: '/solutions/technology',
  keywords: [
    'technology solutions',
    'custom software',
    'enterprise development',
    'software engineering',
    'tech innovation',
    'platform development',
  ],
  type: 'website',
});

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Technology', url: '/solutions/technology' },
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
