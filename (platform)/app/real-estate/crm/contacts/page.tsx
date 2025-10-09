import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getContacts, getContactStats, type ContactFilters } from '@/lib/modules/crm/contacts';
import { ContactCard } from '@/components/real-estate/crm/contacts/contact-card';
import { ContactTable } from '@/components/real-estate/crm/contacts/contact-table';
import { ContactFormDialog } from '@/components/real-estate/crm/contacts/contact-form-dialog';
import { ContactFilters as ContactFiltersBar } from '@/components/real-estate/crm/contacts/contact-filters';
import { ContactSearch } from '@/components/real-estate/crm/contacts/contact-search';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Building2, UserX } from 'lucide-react';

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    view?: 'grid' | 'table';
  }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
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
  const filters: ContactFilters = {
    search: params.search,
    type: params.type as any,
    status: params.status as any,
    limit: 25,
    offset: (currentPage - 1) * 25,
    sort_order: 'desc',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and communication history
          </p>
        </div>
        <ContactFormDialog mode="create" organizationId={currentOrg.organization_id} />
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
              <ContactSearch />
              <ContactFiltersBar />
              <div className="flex gap-2 ml-auto">
                <a href={`?${new URLSearchParams({ ...params, view: 'grid' }).toString()}`}>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Grid
                  </Button>
                </a>
                <a href={`?${new URLSearchParams({ ...params, view: 'table' }).toString()}`}>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Table
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Contacts List */}
      <Suspense fallback={viewMode === 'grid' ? <ContactsGridSkeleton /> : <ContactsTableSkeleton />}>
        <ContactsList filters={filters} viewMode={viewMode} organizationId={currentOrg.organization_id} />
      </Suspense>
    </div>
  );
}

// Stats Cards Component
async function StatsCards() {
  const stats = await getContactStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="green" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="purple" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.clients}</div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="medium" neonBorder="orange" hoverEffect={true}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Past Clients</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pastClients}</div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}

// Contacts List Component
async function ContactsList({
  filters,
  viewMode,
  organizationId,
}: {
  filters: ContactFilters;
  viewMode: 'grid' | 'table';
  organizationId: string;
}) {
  const contacts = await getContacts(filters);

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p>No contacts found. Try adjusting your filters or create a new contact.</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <ContactTable contacts={contacts} organizationId={organizationId} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
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

function ContactsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <EnhancedCard key={i} glassEffect="medium" neonBorder="purple" hoverEffect={true}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
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

function ContactsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
