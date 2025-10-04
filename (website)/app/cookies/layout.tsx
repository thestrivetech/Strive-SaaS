import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Cookie Policy Page Metadata
 * SEO for legal/cookies page
 */
export const metadata: Metadata = generateMetadata({
  title: 'Cookie Policy | Strive Tech',
  description:
    'Learn about how Strive Tech uses cookies and similar technologies to enhance your browsing experience.',
  path: '/cookies',
  type: 'website',
});

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
