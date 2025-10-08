'use client';

import React, { useState, useMemo } from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/features/admin/data-table';
import { Search, Building2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MOCK_ORGANIZATIONS, type MockOrganization } from '@/lib/data/admin/mock-organizations';

export default function AdminOrganizationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search organizations
  const filteredOrgs = useMemo(() => {
    return MOCK_ORGANIZATIONS.filter((org) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          org.name.toLowerCase().includes(searchLower) ||
          org.website.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (tierFilter !== 'all' && org.subscription_tier !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && org.subscription_status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [search, tierFilter, statusFilter]);

  // Export to CSV
  const handleExport = () => {
    const csvHeaders = 'Name,Website,Members,Tier,Status,Monthly Revenue,Created\n';
    const csvData = filteredOrgs
      .map(
        (org) =>
          `"${org.name}","${org.website}",${org.member_count},"${org.subscription_tier}","${org.subscription_status}","$${org.monthly_revenue}","${org.created_at}"`
      )
      .join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `organizations-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredOrgs.length} organizations to CSV`,
    });
  };

  const columns = [
    {
      header: 'Organization',
      accessor: 'name',
      cell: (value: string, row: MockOrganization) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.website}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Members',
      accessor: 'member_count',
      cell: (value: number) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Tier',
      accessor: 'subscription_tier',
      cell: (value: string) => {
        const colors: Record<string, string> = {
          FREE: 'secondary',
          CUSTOM: 'outline',
          STARTER: 'default',
          GROWTH: 'default',
          ELITE: 'default',
          ENTERPRISE: 'default',
        };
        return <Badge variant={colors[value] as any}>{value}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: 'subscription_status',
      cell: (value: string) => {
        const variant = value === 'ACTIVE' ? 'default' : 'destructive';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Revenue',
      accessor: 'monthly_revenue',
      cell: (value: number) => (
        <span className="font-medium">${value.toLocaleString()}/mo</span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (row: MockOrganization) => {
        toast({
          title: 'View Organization',
          description: `Viewing details for ${row.name}`,
        });
      },
    },
    {
      label: 'Manage',
      onClick: (row: MockOrganization) => {
        toast({
          title: 'Manage Organization',
          description: `Managing ${row.name}`,
        });
      },
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage platform organizations and subscriptions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tier Filter */}
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="ELITE">Elite</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredOrgs}
            actions={actions}
            loading={false}
            emptyMessage="No organizations found"
          />
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
