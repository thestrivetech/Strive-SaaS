import { ReactNode } from 'react';
import { AlertSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  severity: AlertSeverity;
  children: ReactNode;
  className?: string;
}

export function AlertBadge({ severity, children, className }: AlertBadgeProps) {
  const severityClasses = {
    CRITICAL: 'reid-alert-critical',
    HIGH: 'reid-alert-high',
    MEDIUM: 'reid-alert-medium',
    LOW: 'reid-alert-low',
  };

  return (
    <div className={cn(
      'p-3 rounded-lg',
      severityClasses[severity],
      className
    )}>
      {children}
    </div>
  );
}
