import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface REIDCardProps {
  children: ReactNode;
  variant?: 'default' | 'purple';
  className?: string;
}

export function REIDCard({ children, variant = 'default', className }: REIDCardProps) {
  return (
    <div className={cn(
      'reid-card',
      variant === 'purple' && 'reid-card-purple',
      className
    )}>
      {children}
    </div>
  );
}

interface REIDCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function REIDCardHeader({ children, className }: REIDCardHeaderProps) {
  return (
    <div className={cn('p-4 border-b border-slate-700', className)}>
      {children}
    </div>
  );
}

interface REIDCardContentProps {
  children: ReactNode;
  className?: string;
}

export function REIDCardContent({ children, className }: REIDCardContentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}
