import { Suspense } from 'react';
import { MarketplaceGrid } from '@/components/real-estate/marketplace/grid/MarketplaceGrid';
import { MarketplaceFilters } from '@/components/real-estate/marketplace/filters/MarketplaceFilters';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketplacePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Marketplace Main Page
 *
 * Displays the tool and dashboard marketplace with:
 * - Filter sidebar for categories and tiers
 * - Tool grid with card-based layout
 * - Shopping cart panel
 * - Search and filter functionality
 */
export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar - Hidden on mobile, sidebar on desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <MarketplaceFilters />
        </Suspense>
      </div>

      {/* Tools Grid - Full width on mobile, flexible on desktop */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<GridSkeleton />}>
          <MarketplaceGrid searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Shopping Cart Panel - Bottom on mobile, sidebar on desktop */}
      <div className="lg:w-80 lg:flex-shrink-0">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <ShoppingCartPanel />
        </Suspense>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full" />
      ))}
    </div>
  );
}
