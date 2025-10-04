import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Security & Compliance Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Security & Compliance Solutions | Cybersecurity AI | Strive Tech',
  description:
    'Protect your business with AI-powered security and compliance solutions. From threat detection to regulatory compliance, ensure enterprise-grade security.',
  path: '/solutions/security-compliance',
  keywords: [
    'cybersecurity',
    'compliance solutions',
    'threat detection',
    'security AI',
    'data protection',
    'regulatory compliance',
  ],
  type: 'website',
});

export default function SecurityComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Security & Compliance', url: '/solutions/security-compliance' },
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
