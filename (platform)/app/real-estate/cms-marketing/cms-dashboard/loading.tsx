import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * CMS & Marketing Dashboard Loading State
 *
 * Loading skeleton displayed while dashboard data is being fetched
 */
export default function CMSMarketingDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Coming Soon Card Skeleton */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      </Card>

      {/* Features Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
