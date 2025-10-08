import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn('reid-metric', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="reid-metric-value">{value}</div>
          <div className="reid-metric-label">{label}</div>
        </div>
        {Icon && (
          <Icon className="w-8 h-8 text-cyan-400 opacity-50" />
        )}
      </div>

      {trend && (
        <div className={cn(
          'mt-2 text-sm font-medium',
          trend.isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}
