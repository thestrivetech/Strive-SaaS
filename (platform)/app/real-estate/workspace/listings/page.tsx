import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { searchListings, getListingStats, type ListingFilters } from '@/lib/modules/transactions/listings';
import { ListingCard } from '@/components/real-estate/crm/listings/listing-card';
import { ListingFilters as ListingFiltersBar } from '@/components/real-estate/crm/listings/listing-filters';
import { ListingSearch } from '@/components/real-estate/crm/listings/listing-search';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, CheckCircle, DollarSign, TrendingUp, LayoutGrid, List } from 'lucide-react';

interface ListingsPageProps {
  searchParams: Promise<{
    search?: string;
    property_type?: string;
    status?: string;
    min_price?: string;
    max_price?: string;
    min_bedrooms?: string;
    max_bedrooms?: string;
    min_bathrooms?: string;
    max_bathrooms?: string;
    min_sqft?: string;
    max_sqft?: string;
    page?: string;
    view?: 'grid' | 'table';
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    redirect('/onboarding/organization');
  }

  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const viewMode = params.view || 'grid';

  // Build filters
  const filters: ListingFilters = {
    search: params.search,
    property_type: params.property_type as any,
    status: params.status as any,
    min_price: params.min_price ? parseFloat(params.min_price) : undefined,
    max_price: params.max_price ? parseFloat(params.max_price) : undefined,
    min_bedrooms: params.min_bedrooms ? parseInt(params.min_bedrooms) : undefined,
    max_bedrooms: params.max_bedrooms ? parseInt(params.max_bedrooms) : undefined,
    min_bathrooms: params.min_bathrooms ? parseFloat(params.min_bathrooms) : undefined,
    max_bathrooms: params.max_bathrooms ? parseFloat(params.max_bathrooms) : undefined,
    min_sqft: params.min_sqft ? parseInt(params.min_sqft) : undefined,
    max_sqft: params.max_sqft ? parseInt(params.max_sqft) : undefined,
    limit: 25,
    offset: (currentPage - 1) * 25,
    sort_order: 'desc',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Listings</h1>
          <p className="text-muted-foreground">
            Manage your real estate property listings
          </p>
        </div>
        <Button>
          + New Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Filters & Search */}
      <div>
        <EnhancedCard glassEffect="medium" neonBorder="green" hoverEffect={true}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <ListingSearch />
              <ListingFiltersBar />
              <div className="flex gap-2 ml-auto">
                <a href={`?${new URLSearchParams({ ...params, view: 'grid' }).toString()}`}>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                </a>
                <a href={`?${new URLSearchParams({ ...params, view: 'table' }).toString()}`}>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Listings List */}
      <Suspense fallback={viewMode === 'grid' ? <ListingsGridSkeleton /> : <ListingsTableSkeleton />}>
        <ListingsList filters={filters} viewMode={viewMode} organizationId={currentOrg.organization_id} />
      </Suspense>
    </div>
  );
}

// Stats Cards Component
async function StatsCards() {
  const stats = await getListingStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalListings}</div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="green" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="purple" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(Number(stats.totalValue) / 1000000).toFixed(2)}M
          </div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="orange" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(Number(stats.avgPrice) / 1000).toFixed(0)}K
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}

// Listings List Component
async function ListingsList({
  filters,
  viewMode,
  organizationId,
}: {
  filters: ListingFilters;
  viewMode: 'grid' | 'table';
  organizationId: string;
}) {
  const listings = await searchListings(filters);

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p>No listings found. Try adjusting your filters or create a new listing.</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Table view coming soon. Use grid view for now.</p>
        </CardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

// Loading Skeletons
function StatsCardsSkeleton() {
  const neonColors: Array<'cyan' | 'green' | 'purple' | 'orange'> = ['cyan', 'green', 'purple', 'orange'];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <EnhancedCard key={i} glassEffect="medium" neonBorder={neonColors[i]} hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </EnhancedCard>
      ))}
    </div>
  );
}

function ListingsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <EnhancedCard key={i} glassEffect="medium" neonBorder="purple" hoverEffect={true} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </EnhancedCard>
      ))}
    </div>
  );
}

function ListingsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
