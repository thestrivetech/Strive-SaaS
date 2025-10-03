'use client';

import { useState } from 'react';
import { Button } from '@/components/(shared)/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/(shared)/ui/dropdown-menu';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { generateCSV, downloadCSV, type CSVColumn } from '@/lib/export/csv';
import { toast } from 'sonner';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: CSVColumn<T>[];
  filename: string;
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename,
  disabled = false,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);

    try {
      // Generate CSV content
      const csvContent = generateCSV(data, columns);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}`;

      // Download file
      downloadCSV(finalFilename, csvContent);

      toast.success(`Exported ${data.length} records to ${finalFilename}.csv`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || data.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}