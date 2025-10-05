import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getLeads, getLeadsCount, getLeadStats, type LeadFilters } from '@/lib/modules/crm/leads';
import { LeadCard } from '@/components/real-estate/crm/leads/lead-card';
import { LeadTable } from '@/components/real-estate/crm/leads/lead-table';
import { LeadFormDialog } from '@/components/real-estate/crm/leads/lead-form-dialog';
import { LeadFilters as LeadFiltersBar } from '@/components/real-estate/crm/leads/lead-filters';
import { LeadSearch } from '@/components/real-estate/crm/leads/lead-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, Table2 } from 'lucide-react';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
    score?: string;
    page?: string;
    view?: string;
  }>;
}) {
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
  const currentPage = parseInt(params.page || '1');
  const pageSize = 25;
  const view = params.view || 'grid';

  const filters: LeadFilters = {
    search: params.search,
    status: params.status as any,
    source: params.source as any,
    score: params.score as any,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    sort_order: 'desc',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads
          </p>
        </div>
        <LeadFormDialog
          mode="create"
          organizationId={currentOrg.organization_id}
        />
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <LeadSearch />
        <LeadFiltersBar />
      </div>

      <Tabs value={view} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid" asChild>
              <a href="?view=grid">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </a>
            </TabsTrigger>
            <TabsTrigger value="table" asChild>
              <a href="?view=table">
                <Table2 className="h-4 w-4 mr-2" />
                Table
              </a>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="space-y-4">
          <Suspense fallback={<LeadsGridSkeleton />}>
            <LeadsGrid filters={filters} organizationId={currentOrg.organization_id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Suspense fallback={<LeadsTableSkeleton />}>
            <LeadsTableView filters={filters} organizationId={currentOrg.organization_id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function StatsCards() {
  const stats = await getLeadStats();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeads}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">New Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newLeads}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.hotLeads}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Qualified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.qualifiedLeads}</div>
        </CardContent>
      </Card>
    </div>
  );
}

async function LeadsGrid({ filters, organizationId }: { filters: LeadFilters; organizationId: string }) {
  const leads = await getLeads(filters);

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No leads found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first lead to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} organizationId={organizationId} />
      ))}
    </div>
  );
}

async function LeadsTableView({ filters, organizationId }: { filters: LeadFilters; organizationId: string }) {
  const leads = await getLeads(filters);

  return <LeadTable leads={leads} organizationId={organizationId} />;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LeadsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <Skeleton className="h-64" />
    </div>
  );
}
