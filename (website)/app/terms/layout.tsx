import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Terms of Service Page Metadata
 * SEO for legal/terms page
 */
export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service | Strive Tech',
  description:
    'Read our terms of service to understand the rules and regulations for using Strive Tech services.',
  path: '/terms',
  type: 'website',
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
