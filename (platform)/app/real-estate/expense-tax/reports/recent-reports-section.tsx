'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReportList } from '@/components/real-estate/expense-tax/report-list';
import { ShareReportDialog } from '@/components/real-estate/expense-tax/share-report-dialog';

// Type definitions (previously from mock data)
type ReportFormat = 'pdf' | 'excel';

interface MockGeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  year: number;
  status: 'completed' | 'generating' | 'failed';
  dateGenerated: Date;
  fileSize: string;
  sharedWith: string[];
  formats: Array<'pdf' | 'excel'>;
}

/**
 * Recent Reports Section
 *
 * Client component that displays recent reports and handles actions
 * Separated from page.tsx to allow client-side interactivity
 */

interface RecentReportsSectionProps {
  organizationId: string;
}

export function RecentReportsSection({ organizationId }: RecentReportsSectionProps) {
  const router = useRouter();
  const [reports, setReports] = React.useState<MockGeneratedReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);

  // Find selected report for dialog
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  // Placeholder data - Expense & Tax is a skeleton module
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        // Empty array - no reports in skeleton module
        setReports([]);
      } catch (error) {
        toast.error('Failed to load reports');
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [organizationId]);

  const handleDownload = async (reportId: string, format: ReportFormat) => {
    // Placeholder - no actual download in skeleton module
    toast.info('Download feature coming soon', {
      description: 'This module is under development',
    });
  };

  const handleShare = (reportId: string) => {
    setSelectedReportId(reportId);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async (
    reportId: string,
    data: { email: string; permissions: 'view' | 'download'; message?: string }
  ) => {
    // Placeholder - no actual sharing in skeleton module
    toast.info('Share feature coming soon', {
      description: 'This module is under development',
    });
  };

  const handleRevokeAccess = async (reportId: string, email: string) => {
    // Placeholder - no actual revoke in skeleton module
    toast.info('Revoke feature coming soon', {
      description: 'This module is under development',
    });
  };

  const handleDelete = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${report.templateName}"?`)) {
      return;
    }

    // Placeholder - no actual delete in skeleton module
    toast.info('Delete feature coming soon', {
      description: 'This module is under development',
    });
  };

  if (isLoading) {
    return <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />;
  }

  return (
    <>
      <ReportList
        reports={reports}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      <ShareReportDialog
        reportId={selectedReportId}
        reportName={selectedReport?.templateName}
        currentShares={selectedReport?.sharedWith || []}
        onShare={handleShareSubmit}
        onRevoke={handleRevokeAccess}
        isOpen={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setSelectedReportId(null);
        }}
      />
    </>
  );
}
