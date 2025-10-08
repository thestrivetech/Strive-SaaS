import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const variantClasses = {
    success: 'reid-badge-success',
    warning: 'reid-badge-warning',
    error: 'reid-badge-error',
    info: 'reid-badge-info',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
