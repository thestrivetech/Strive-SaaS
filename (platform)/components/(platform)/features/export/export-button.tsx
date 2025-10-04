/**
 * Export Button Component
 * Button for exporting data
 */

'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function ExportButton({ onClick, disabled }: ExportButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
