import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getCustomers, getCustomerStats } from '@/lib/modules/crm/queries';
import { CreateCustomerDialog } from '@/components/(platform)/real-estate/crm/create-customer-dialog';
import { CustomerActionsMenu } from '@/components/(platform)/real-estate/crm/customer-actions-menu';
import { CustomerSearch } from '@/components/(platform)/real-estate/crm/customer-search';
import { CustomerFilters } from '@/components/(platform)/real-estate/crm/customer-filters';
import { CustomerListSkeleton } from '@/components/(platform)/real-estate/crm/customer-list-skeleton';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { getCustomersCount } from '@/lib/modules/crm/queries';
import { ExportButton } from '@/components/(platform)/features/export/export-button';
import { formatDateForCSV, type CSVColumn } from '@/lib/export/csv';
import type { CustomerStatus, CustomerSource, Customer } from '@prisma/client';
import type { CRMFilters } from '@/lib/types/platform';

export default async function CRMPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    source?: string;
    page?: string;
    limit?: string;
    createdFrom?: string;
    createdTo?: string;
  };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">
            Create an organization first to manage customers.
          </p>
        </div>
      </div>
    );
  }

  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.limit || '25');

  const filters: CRMFilters = {
    search: searchParams.search,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  };

  // Handle filters
  if (searchParams.status) {
    filters.status = searchParams.status as CustomerStatus;
  }
  if (searchParams.source) {
    filters.source = searchParams.source as CustomerSource;
  }
  if (searchParams.createdFrom) {
    filters.createdFrom = new Date(searchParams.createdFrom);
  }
  if (searchParams.createdTo) {
    filters.createdTo = new Date(searchParams.createdTo);
  }

  return (
    <Suspense fallback={<CustomerListSkeleton />}>
      <CustomerListContent
        organizationId={currentOrg.organizationId}
        filters={filters}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </Suspense>
  );
}

async function CustomerListContent({
  organizationId,
  filters,
  currentPage,
  pageSize,
}: {
  organizationId: string;
  filters: CRMFilters;
  currentPage: number;
  pageSize: number;
}) {
  const [customers, stats, totalCount] = await Promise.all([
    getCustomers(filters),
    getCustomerStats(),
    getCustomersCount(filters),
  ]);

  // CSV Export columns
  const exportColumns: CSVColumn<Customer>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    { key: 'createdAt', label: 'Created Date', format: (value) => formatDateForCSV(value as Date | string | null) },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-700 hover:bg-green-500/20';
      case 'PROSPECT':
        return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20';
      case 'LEAD':
        return 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20';
      case 'CHURNED':
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
    }
  };

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">
            Manage your customers and sales pipeline
          </p>
        </div>
        <CreateCustomerDialog organizationId={organizationId} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">All customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadCount}</div>
            <p className="text-xs text-muted-foreground">New leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospectCount}</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers</CardTitle>
            <div className="flex items-center gap-2">
              <ExportButton
                data={customers}
                columns={exportColumns}
                filename="customers"
              />
              <CustomerSearch />
              <CustomerFilters />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Company / Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="text-muted-foreground">
                      <p>No customers yet.</p>
                      <p className="text-sm">Click &quot;Add Customer&quot; to create your first customer.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.assignedTo?.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.company || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.assignedTo?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimeAgo(new Date(customer.createdAt))}
                    </TableCell>
                    <TableCell>
                      <CustomerActionsMenu customer={customer} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={pageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}