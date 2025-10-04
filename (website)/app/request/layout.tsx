import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Request Page Metadata
 * Enhanced SEO for demo/service request page
 */
export const metadata: Metadata = generateMetadata({
  title: 'Request a Demo | See AI in Action | Strive Tech',
  description:
    'Request a personalized demo of our AI solutions. See how our technology can transform your business operations and drive measurable results.',
  path: '/request',
  keywords: [
    'request demo',
    'AI demo',
    'product demonstration',
    'free trial',
    'AI consultation',
    'schedule demo',
  ],
  type: 'website',
});

export default function RequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
