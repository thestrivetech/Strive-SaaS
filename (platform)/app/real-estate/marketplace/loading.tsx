import { Skeleton } from '@/components/ui/skeleton';

/**
 * Marketplace Loading State
 *
 * Displays skeleton UI while marketplace page loads
 */
export default function MarketplaceLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar Skeleton */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <Skeleton className="h-96 w-full" />
      </div>

      {/* Tools Grid Skeleton */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>

      {/* Cart Panel Skeleton */}
      <div className="lg:w-80 lg:flex-shrink-0">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
