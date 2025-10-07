import { Skeleton } from '@/components/ui/skeleton';
import { WidgetSkeleton } from './WidgetSkeleton';

/**
 * Loading skeleton for the entire DashboardGrid
 * Shows 6 widget skeletons in responsive grid layout
 */
export function GridSkeleton() {
  return (
    <section className="px-6 pb-6">
      {/* Grid Controls Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-64 loading-shimmer" />
        <Skeleton className="h-9 w-32 rounded-lg loading-shimmer" />
      </div>

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Widgets (Left Column - 2x width on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <WidgetSkeleton showChart className="h-[300px]" />
          <WidgetSkeleton showChart className="h-[300px]" />
          <WidgetSkeleton className="h-[300px]" />
        </div>

        {/* Small Widgets (Right Column - 1x width on lg) */}
        <div className="lg:col-span-1 space-y-6">
          <WidgetSkeleton className="h-[300px]" />
          <WidgetSkeleton className="h-[300px]" />
          <WidgetSkeleton className="h-[300px]" />
        </div>
      </div>
    </section>
  );
}
