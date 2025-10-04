import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Privacy Policy Page Metadata
 * SEO for legal/privacy page
 */
export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy | Strive Tech',
  description:
    'Read our privacy policy to understand how Strive Tech collects, uses, and protects your personal information.',
  path: '/privacy',
  type: 'website',
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
