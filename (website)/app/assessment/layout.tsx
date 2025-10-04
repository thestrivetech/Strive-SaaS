import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

/**
 * Assessment Page Metadata
 * Enhanced SEO for business assessment and lead generation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Free AI Business Assessment | Discover Your Potential | Strive Tech',
  description:
    'Get a free customized AI business assessment. Discover opportunities to automate processes, reduce costs, and accelerate growth with our expert analysis.',
  path: '/assessment',
  keywords: [
    'AI business assessment',
    'free consultation',
    'AI readiness',
    'automation opportunities',
    'business analysis',
    'AI strategy',
  ],
  type: 'website',
});

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
