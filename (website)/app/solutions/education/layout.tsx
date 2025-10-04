import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Education Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Education Technology Solutions | EdTech AI | Strive Tech',
  description:
    'Transform education with AI-powered learning solutions. Personalize student experiences, improve outcomes, and streamline educational operations.',
  path: '/solutions/education',
  keywords: [
    'education technology',
    'EdTech AI',
    'personalized learning',
    'student analytics',
    'learning management',
    'educational software',
  ],
  type: 'website',
});

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Education', url: '/solutions/education' },
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
