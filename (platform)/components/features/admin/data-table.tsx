'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, row: T) => React.ReactNode;
}

interface Action<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  loading,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead key={`${String(column.accessor)}-${idx}`}>
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => {
                const accessor = String(column.accessor);
                const value = accessor.includes('.')
                  ? accessor.split('.').reduce((obj: any, key: string) => obj?.[key], row)
                  : row[column.accessor as keyof T];
                return (
                  <TableCell key={`${String(column.accessor)}-${colIndex}`}>
                    {column.cell ? column.cell(value, row) : String(value || '-')}
                  </TableCell>
                );
              })}
              {actions && actions.length > 0 && (
                <TableCell>
                  <div className="flex gap-2">
                    {actions.map((action, actionIndex) => (
                      <Button
                        key={`${action.label}-${actionIndex}`}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => action.onClick(row)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
