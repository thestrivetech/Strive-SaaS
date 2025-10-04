import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Contact Page Metadata
 * Enhanced SEO for lead generation and contact page
 */
export const metadata: Metadata = generateMetadata({
  title: 'Contact Strive Tech | Get Your Free Consultation',
  description:
    'Get in touch with our AI and software development experts. Schedule a free consultation to discuss your business needs and discover how we can help you transform your operations.',
  path: '/contact',
  keywords: [
    'contact strive tech',
    'AI consultation',
    'software development inquiry',
    'business transformation',
    'free consultation',
    'AI experts',
  ],
  type: 'website',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
