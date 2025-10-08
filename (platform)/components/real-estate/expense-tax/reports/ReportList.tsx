'use client';

import React from 'react';
import { ReportCard, type Report } from './ReportCard';
import { FileText } from 'lucide-react';

/**
 * Report List Component
 *
 * Displays grid of generated reports with:
 * - 2-column responsive grid
 * - Empty state when no reports
 * - Report cards with download/delete
 *
 * @client-component - Uses interactive ReportCard components
 */

interface ReportListProps {
  reports?: Report[];
  onDownload?: (reportId: string) => void;
  onDelete?: (reportId: string) => void;
}

export function ReportList({ reports, onDownload, onDelete }: ReportListProps) {
  // Empty state
  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          No reports generated yet
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
          Use the form above to create your first expense report
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
