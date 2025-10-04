import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Financial Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Financial Technology Solutions | FinTech AI | Strive Tech',
  description:
    'Modernize financial services with AI-powered solutions. From risk analysis to automated trading, deliver secure and compliant financial technology.',
  path: '/solutions/financial',
  keywords: [
    'financial technology',
    'FinTech AI',
    'risk analysis',
    'fraud detection',
    'algorithmic trading',
    'financial automation',
  ],
  type: 'website',
});

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Financial', url: '/solutions/financial' },
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
