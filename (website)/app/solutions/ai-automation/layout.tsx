import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * AI Automation Solution Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'AI Automation Solutions | Streamline Your Business | Strive Tech',
  description:
    'Transform your business with intelligent AI automation. Automate repetitive tasks, optimize workflows, and increase efficiency while reducing costs.',
  path: '/solutions/ai-automation',
  keywords: [
    'AI automation',
    'process automation',
    'workflow optimization',
    'RPA',
    'intelligent automation',
    'business automation',
  ],
  type: 'website',
});

export default function AIAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Breadcrumb schema for better SEO navigation
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'AI Automation', url: '/solutions/ai-automation' },
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
