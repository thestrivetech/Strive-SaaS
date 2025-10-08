import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import {
  getContentItems,
  getContentStats,
  type ContentFilters,
} from '@/lib/modules/content/content';
import { ContentListTable } from '@/components/real-estate/content/content-list-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  CheckCircle,
  Clock,
  Archive,
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
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You don't have permission to access content management.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground">
            Create and manage your content for websites, blogs, and marketing materials
          </p>
        </div>
        <Link href="/real-estate/cms-marketing/content/editor">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Filters & Search */}
      <Card>
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
      </Card>

      {/* Content List */}
      <Suspense fallback={<ContentListSkeleton />}>
        <ContentList filters={filters} organizationId={user.organizationId} />
      </Suspense>
    </div>
  );
}

// Stats Cards Component
async function StatsCards() {
  const stats = await getContentStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.published}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.draft}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scheduled}</div>
        </CardContent>
      </Card>
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
      <Card>
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
      </Card>
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
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading statistics">
      <span className="sr-only">Loading content statistics...</span>
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
