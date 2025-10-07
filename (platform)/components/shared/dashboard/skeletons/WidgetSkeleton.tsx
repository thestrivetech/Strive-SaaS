import { Skeleton } from '@/components/ui/skeleton';

interface WidgetSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showChart?: boolean;
}

/**
 * Generic loading skeleton for dashboard widgets
 * Configurable for different widget types
 */
export function WidgetSkeleton({
  className = '',
  showHeader = true,
  showChart = false,
}: WidgetSkeletonProps) {
  return (
    <div className={`glass-strong rounded-2xl p-6 h-full ${className}`}>
      {/* Widget Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32 loading-shimmer" />
          <Skeleton className="h-8 w-8 rounded-full loading-shimmer" />
        </div>
      )}

      {/* Widget Content */}
      <div className="space-y-4">
        {showChart ? (
          <>
            {/* Chart Area */}
            <Skeleton className="h-48 w-full rounded-lg loading-shimmer" />
            {/* Legend */}
            <div className="flex items-center gap-4 justify-center">
              <Skeleton className="h-3 w-20 loading-shimmer" />
              <Skeleton className="h-3 w-20 loading-shimmer" />
              <Skeleton className="h-3 w-20 loading-shimmer" />
            </div>
          </>
        ) : (
          <>
            {/* Content Rows */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full loading-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full loading-shimmer" />
                  <Skeleton className="h-3 w-2/3 loading-shimmer" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
