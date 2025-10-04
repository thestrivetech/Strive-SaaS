/**
 * CSV export types
 */

export interface CSVColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

export type CSVValue = string | number | boolean | null | undefined | Date;

export type CSVRow = Record<string, CSVValue>;
