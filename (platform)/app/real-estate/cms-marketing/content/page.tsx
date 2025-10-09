import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import {
  getContentItems,
  getContentStats,
  type ContentFilters,
} from '@/lib/modules/content/content';
import { ContentListTable } from '@/components/real-estate/content/content-list-table';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
} from 'lucide-react';

interface ContentPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have permission to access content management.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch stats BEFORE return for ModuleHeroSection
  const stats = await getContentStats();

  // Create stats array for ModuleHeroSection
  const heroStats = [
    {
      label: 'Total Content',
      value: stats.total.toString(),
      icon: 'file' as const,
    },
    {
      label: 'Published',
      value: stats.published.toString(),
      icon: 'check' as const,
    },
    {
      label: 'Draft',
      value: stats.draft.toString(),
      icon: 'archive' as const,
    },
    {
      label: 'Scheduled',
      value: stats.scheduled.toString(),
      icon: 'clock' as const,
    },
  ];

  const params = await searchParams;

  // Build filters
  const filters: ContentFilters = {
    search: params.search,
    status: params.status as any,
    type: params.type as any,
    limit: 50,
    offset: 0,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <ModuleHeroSection
        user={user}
        moduleName="Content Library"
        moduleDescription="Create and manage your content for websites, blogs, and marketing materials"
        stats={heroStats}
        showWeather={false}
      />

      {/* Action button */}
      <div className="flex justify-end">
        <Link href="/real-estate/cms-marketing/content/editor">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div>
        <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full">
                <label htmlFor="content-search" className="sr-only">
                  Search content
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="content-search"
                  type="search"
                  placeholder="Search content..."
                  className="pl-10 min-h-[44px]"
                  defaultValue={params.search}
                  aria-label="Search content items"
                />
              </div>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter content by status">
                <FilterButton
                  href="?"
                  label="All"
                  active={!params.status}
                />
                <FilterButton
                  href="?status=PUBLISHED"
                  label="Published"
                  active={params.status === 'PUBLISHED'}
                />
                <FilterButton
                  href="?status=DRAFT"
                  label="Draft"
                  active={params.status === 'DRAFT'}
                />
                <FilterButton
                  href="?status=SCHEDULED"
                  label="Scheduled"
                  active={params.status === 'SCHEDULED'}
                />
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Content List */}
      <div>
        <Suspense fallback={<ContentListSkeleton />}>
          <ContentList filters={filters} organizationId={organizationId} />
        </Suspense>
      </div>
    </div>
  );
}

// Content List Component
async function ContentList({
  filters,
  organizationId,
}: {
  filters: ContentFilters;
  organizationId: string;
}) {
  const content = await getContentItems(filters);

  if (content.length === 0) {
    return (
      <EnhancedCard glassEffect="medium" neonBorder="green" hoverEffect={false}>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            No content found. {filters.search || filters.status
              ? 'Try adjusting your filters or'
              : 'Create your first content item to get started.'}
          </p>
          {!filters.search && !filters.status && (
            <Link href="/real-estate/cms-marketing/content/editor">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Content
              </Button>
            </Link>
          )}
        </CardContent>
      </EnhancedCard>
    );
  }

  return <ContentListTable content={content} organizationId={organizationId} />;
}

// Filter Button Component
function FilterButton({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <Button variant={active ? 'default' : 'outline'} size="sm">
        {label}
      </Button>
    </Link>
  );
}

// Loading Skeletons
function ContentListSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading content">
      <span className="sr-only">Loading content items...</span>
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
