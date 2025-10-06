import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * REI Analytics Dashboard Loading State
 *
 * Skeleton UI for dashboard loading
 */
export default function REIAnalyticsDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Main Content Skeleton */}
      <Card>
        <CardHeader className="text-center pb-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-lg border">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
