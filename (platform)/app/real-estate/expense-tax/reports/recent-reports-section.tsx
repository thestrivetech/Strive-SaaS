'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReportList } from '@/components/real-estate/expense-tax/report-list';
import { ShareReportDialog } from '@/components/real-estate/expense-tax/share-report-dialog';
import { expenseTaxReportsProvider } from '@/lib/data';
import type { MockGeneratedReport, ReportFormat } from '@/lib/data/mocks/expense-tax-reports';

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

  // Fetch reports on mount
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await expenseTaxReportsProvider.getRecentReports(organizationId);
        setReports(data);
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
    try {
      const { url, filename } = await expenseTaxReportsProvider.downloadReport(
        reportId,
        format,
        organizationId
      );

      // In a real implementation, would trigger download
      toast.success(`Downloading ${filename}...`, {
        description: `Format: ${format.toUpperCase()}`,
      });

      // window.open(url, '_blank'); // Uncomment for real downloads
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Failed to download report:', error);
      throw error;
    }
  };

  const handleShare = (reportId: string) => {
    setSelectedReportId(reportId);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async (
    reportId: string,
    data: { email: string; permissions: 'view' | 'download'; message?: string }
  ) => {
    try {
      await expenseTaxReportsProvider.shareReport(reportId, data, organizationId);

      toast.success('Report shared successfully!', {
        description: `Shared with ${data.email}`,
      });

      // Update local state to reflect the share
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, sharedWith: [...report.sharedWith, data.email] }
            : report
        )
      );

      router.refresh();
    } catch (error) {
      toast.error('Failed to share report');
      console.error('Failed to share report:', error);
      throw error;
    }
  };

  const handleRevokeAccess = async (reportId: string, email: string) => {
    try {
      await expenseTaxReportsProvider.revokeAccess(reportId, email, organizationId);

      toast.success('Access revoked', {
        description: `Removed ${email}`,
      });

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, sharedWith: report.sharedWith.filter((e) => e !== email) }
            : report
        )
      );

      router.refresh();
    } catch (error) {
      toast.error('Failed to revoke access');
      console.error('Failed to revoke access:', error);
      throw error;
    }
  };

  const handleDelete = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${report.templateName}"?`)) {
      return;
    }

    try {
      await expenseTaxReportsProvider.deleteReport(reportId, organizationId);

      toast.success('Report deleted');

      // Update local state
      setReports((prev) => prev.filter((r) => r.id !== reportId));

      router.refresh();
    } catch (error) {
      toast.error('Failed to delete report');
      console.error('Failed to delete report:', error);
      throw error;
    }
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
