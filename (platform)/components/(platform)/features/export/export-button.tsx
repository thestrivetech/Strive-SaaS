/**
 * Export Button Component
 * Button for exporting data to CSV
 */

'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCSV, downloadCSV, type CSVColumn } from '@/lib/export/csv';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: CSVColumn<T>[];
  filename: string;
  disabled?: boolean;
}

export default function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  disabled
}: ExportButtonProps<T>) {
  const handleExport = () => {
    const csvContent = generateCSV(data, columns);
    downloadCSV(filename, csvContent);
  };

  return (
    <Button onClick={handleExport} disabled={disabled} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
