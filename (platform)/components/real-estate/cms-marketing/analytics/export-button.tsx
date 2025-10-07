'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ExportButtonProps {
  data: Record<string, string | number>[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label = 'Export CSV' }: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  function exportToCSV() {
    if (!data || data.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There is no data available to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);

      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map((row: any) =>
          headers
            .map((header) => {
              const value = row[header];
              // Handle values with commas by wrapping in quotes
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value ?? '';
            })
            .join(',')
        ),
      ].join('\n');

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `${data.length} records have been downloaded`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button onClick={exportToCSV} variant="outline" disabled={isExporting}>
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : label}
    </Button>
  );
}
