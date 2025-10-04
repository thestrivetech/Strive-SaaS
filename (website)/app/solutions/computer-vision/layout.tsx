import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema } from '@/lib/seo/schema';

/**
 * Computer Vision Solutions Page Metadata
 * Enhanced SEO with breadcrumb schema for navigation
 */
export const metadata: Metadata = generateMetadata({
  title: 'Computer Vision Solutions | Image & Video AI | Strive Tech',
  description:
    'Harness the power of computer vision AI. From object detection to facial recognition, transform visual data into actionable insights for your business.',
  path: '/solutions/computer-vision',
  keywords: [
    'computer vision',
    'image recognition',
    'object detection',
    'facial recognition',
    'video analytics',
    'visual AI',
  ],
  type: 'website',
});

export default function ComputerVisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Computer Vision', url: '/solutions/computer-vision' },
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
