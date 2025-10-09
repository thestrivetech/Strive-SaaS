import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/real-estate/expense-tax/dashboard/DashboardSkeleton';

/**
 * Expense & Tax Dashboard Loading State
 *
 * Displays loading skeleton for the entire dashboard
 * while the page data is being fetched
 */
export default function ExpenseTaxDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-80" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
