import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for HeroSection component
 * Matches the layout and dimensions of the actual hero section
 */
export function HeroSkeleton() {
  return (
    <section className="p-4 sm:p-6">
      <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Greeting Section Skeleton */}
          <div className="flex-1">
            <Skeleton className="h-10 sm:h-12 lg:h-14 w-full max-w-[500px] mb-3 loading-shimmer" />
            <Skeleton className="h-4 sm:h-5 w-full max-w-[400px] loading-shimmer" />
          </div>

          {/* Clock & Weather Widgets Skeleton */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Skeleton className="h-20 sm:h-24 w-24 sm:w-28 rounded-xl loading-shimmer" />
            <Skeleton className="h-20 sm:h-24 w-28 sm:w-32 rounded-xl loading-shimmer" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-28 sm:h-32 rounded-xl loading-shimmer"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
