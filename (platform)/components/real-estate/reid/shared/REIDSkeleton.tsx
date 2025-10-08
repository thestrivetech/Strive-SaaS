import { cn } from '@/lib/utils';

interface REIDSkeletonProps {
  className?: string;
  count?: number;
}

export function REIDSkeleton({ className, count = 1 }: REIDSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('reid-skeleton h-20', className)}
        />
      ))}
    </>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="reid-metric">
      <div className="reid-skeleton h-12 w-32 mb-2" />
      <div className="reid-skeleton h-4 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="reid-chart">
      <div className="reid-skeleton h-64 w-full" />
    </div>
  );
}
