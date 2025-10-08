'use client';

import React from 'react';
import { EnhancedCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/shared/dashboard/EnhancedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Report Card Component
 *
 * Displays individual report with:
 * - Report name and date range
 * - Category badges
 * - Generated date
 * - Download and delete actions
 * - Glass effect and hover animation
 *
 * @client-component - Uses interactive buttons
 */

export interface Report {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  categories: string[];
  format: 'CSV' | 'PDF';
  generatedAt: Date;
  fileSize?: string;
}

interface ReportCardProps {
  report: Report;
  onDownload?: (reportId: string) => void;
  onDelete?: (reportId: string) => void;
}

export function ReportCard({ report, onDownload, onDelete }: ReportCardProps) {
  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Downloading report:', report.id);
    onDownload?.(report.id);
    alert(`Download started for: ${report.name}`);
  };

  const handleDelete = () => {
    // Placeholder for delete functionality
    const confirmed = confirm(`Are you sure you want to delete "${report.name}"?`);
    if (confirmed) {
      console.log('Deleting report:', report.id);
      onDelete?.(report.id);
      alert(`Report deleted: ${report.name}`);
    }
  };

  return (
    <EnhancedCard glassEffect="medium" neonBorder="purple" hoverEffect={true}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{report.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(report.startDate, 'MMM dd, yyyy')} - {format(report.endDate, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {report.format}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Categories */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Categories:</p>
          <div className="flex flex-wrap gap-1">
            {report.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Generated {format(report.generatedAt, 'MMM dd, yyyy')}</span>
            {report.fileSize && <span>{report.fileSize}</span>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </EnhancedCard>
  );
}
