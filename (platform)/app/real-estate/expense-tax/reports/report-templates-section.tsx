'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReportTemplateCard } from '@/components/real-estate/expense-tax/report-template-card';

// Type definition for report template (matches MockReportTemplate from component)
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  whatsIncluded: string[];
  estimatedTime: string;
}

/**
 * Report Templates Section
 *
 * Client component that displays report templates and handles generation
 * Separated from page.tsx to allow client-side interactivity
 */

interface ReportTemplatesSectionProps {
  organizationId: string;
}

export function ReportTemplatesSection({ organizationId }: ReportTemplatesSectionProps) {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch report templates from database
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Templates will be loaded from database
        setTemplates([]);
      } catch (error) {
        toast.error('Failed to load report templates');
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleGenerate = async (templateId: string, year: number) => {
    // Report generation functionality to be implemented
    toast.info('Report generation coming soon', {
      description: 'Automated report generation will be available soon',
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <ReportTemplateCard
          key={template.id}
          template={template}
          onGenerate={handleGenerate}
        />
      ))}
    </div>
  );
}
