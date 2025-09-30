import type { CSVColumn as CSVColumnType } from '@/lib/types/csv';

export type CSVColumn<T = Record<string, unknown>> = CSVColumnType<T>;

/**
 * Escape special characters for CSV format
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV content from data
 */
export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CSVColumn<T>[]
): string {
  if (data.length === 0) {
    return columns.map((col) => escapeCSVValue(col.label)).join(',');
  }

  // Header row
  const headers = columns.map((col) => escapeCSVValue(col.label)).join(',');

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let value: unknown;

        // Get value from key
        if (typeof col.key === 'string' && col.key.includes('.')) {
          // Handle nested keys like "project.name"
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], item);
        } else {
          value = item[col.key as keyof T];
        }

        // Apply formatter if provided
        if (col.format) {
          value = col.format(value, item);
        }

        return escapeCSVValue(value);
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(filename: string, csvContent: string) {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV export
 */
export function formatDateForCSV(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Format datetime for CSV export
 */
export function formatDateTimeForCSV(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(); // Locale-specific format
}