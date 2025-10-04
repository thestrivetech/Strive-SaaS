import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Blockchain Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Blockchain Solutions | Web3 Development | Strive Tech',
  description:
    'Build secure, decentralized applications with blockchain technology. From smart contracts to cryptocurrency integration, deliver cutting-edge Web3 solutions.',
  path: '/solutions/blockchain',
  keywords: [
    'blockchain development',
    'Web3',
    'smart contracts',
    'cryptocurrency',
    'decentralized apps',
    'blockchain integration',
  ],
  type: 'website',
});

export default function BlockchainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Blockchain', url: '/solutions/blockchain' },
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
