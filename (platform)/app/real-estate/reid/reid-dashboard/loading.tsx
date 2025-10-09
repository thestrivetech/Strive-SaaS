import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';

export default function REIDDashboardLoading() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="h-5 w-48 bg-slate-700 rounded animate-pulse" />

      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-96 bg-slate-700 rounded animate-pulse" />
        <div className="h-5 w-80 bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="xl:col-span-1">
          <ChartSkeleton />
        </div>
        <div className="xl:col-span-1">
          <ChartSkeleton />
        </div>
        <div className="xl:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="xl:col-span-2">
          <ChartSkeleton />
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="h-20 bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
