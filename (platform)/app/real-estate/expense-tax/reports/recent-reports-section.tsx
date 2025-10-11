'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReportList } from '@/components/real-estate/expense-tax/report-list';
import { ShareReportDialog } from '@/components/real-estate/expense-tax/share-report-dialog';
import { getRecentTaxReports } from '@/lib/modules/expense-tax/reports/queries';

// Type definitions
type ReportFormat = 'pdf' | 'excel';

interface TaxReport {
  id: string;
  name: string;
  template_type: string;
  tax_year: number;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  file_url: string | null;
  file_format: string | null;
  file_size_bytes: bigint | null;
  is_shared: boolean;
  shared_with: any;
  created_at: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Map database report to component format
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

  // Helper to format file size
  const formatFileSize = (bytes: bigint | null): string => {
    if (!bytes) return 'N/A';
    const sizeInMB = Number(bytes) / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Helper to map database status to component status
  const mapStatus = (status: string): 'completed' | 'generating' | 'failed' => {
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'GENERATING':
        return 'generating';
      case 'FAILED':
      case 'EXPIRED':
        return 'failed';
      default:
        return 'generating';
    }
  };

  // Fetch real data from database
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const taxReports = await getRecentTaxReports(10);

        // Map database reports to component format
        const mappedReports: MockGeneratedReport[] = taxReports.map((report) => {
          // Extract shared_with emails from JSON
          let sharedEmails: string[] = [];
          if (report.shared_with && typeof report.shared_with === 'object') {
            const sharedData = report.shared_with as any;
            if (Array.isArray(sharedData)) {
              sharedEmails = sharedData.map((item: any) =>
                typeof item === 'string' ? item : item?.email || ''
              ).filter(Boolean);
            }
          }

          return {
            id: report.id,
            templateId: report.template_type,
            templateName: report.name,
            year: report.tax_year,
            status: mapStatus(report.status),
            dateGenerated: report.created_at,
            fileSize: formatFileSize(report.file_size_bytes),
            sharedWith: sharedEmails,
            formats: report.file_format ? [report.file_format as 'pdf' | 'excel'] : ['pdf'],
          };
        });

        setReports(mappedReports);
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
    // Download functionality to be implemented
    toast.info('Download feature coming soon', {
      description: 'File download will be available soon',
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
    // Share functionality to be implemented
    toast.info('Share feature coming soon', {
      description: 'Report sharing will be available soon',
    });
  };

  const handleRevokeAccess = async (reportId: string, email: string) => {
    // Revoke functionality to be implemented
    toast.info('Revoke feature coming soon', {
      description: 'Access revocation will be available soon',
    });
  };

  const handleDelete = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${report.templateName}"?`)) {
      return;
    }

    // Delete functionality to be implemented
    toast.info('Delete feature coming soon', {
      description: 'Report deletion will be available soon',
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
