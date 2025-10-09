'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReportTemplateCard } from '@/components/real-estate/expense-tax/report-template-card';
import { expenseTaxReportsProvider } from '@/lib/data';

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
  const [templates, setTemplates] = React.useState<Awaited<ReturnType<typeof expenseTaxReportsProvider.getTemplates>>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch templates on mount
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await expenseTaxReportsProvider.getTemplates();
        setTemplates(data);
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
    try {
      const report = await expenseTaxReportsProvider.generateReport(
        { templateId, year },
        organizationId
      );

      toast.success('Report generated successfully!', {
        description: `${report.templateName} for ${year}`,
      });

      // Refresh the page to show new report
      router.refresh();
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Failed to generate report:', error);
      throw error; // Re-throw to allow button to handle loading state
    }
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
