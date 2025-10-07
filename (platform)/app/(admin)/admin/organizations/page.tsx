'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/features/admin/data-table';
import { Search, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  website?: string | null;
  created_at: string;
  _count: {
    organization_members: number;
  };
  subscriptions: {
    tier: string;
    status: string;
  } | null;
}

export default function AdminOrganizationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Fetch organizations
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['admin-organizations', { tier: tierFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tierFilter !== 'all') params.append('tier', tierFilter);

      const response = await fetch(`/api/v1/admin/organizations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch organizations');
      return response.json();
    },
  });

  const columns = [
    {
      header: 'Organization',
      accessor: 'name',
      cell: (value: string, row: Organization) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            {row.website && (
              <p className="text-xs text-muted-foreground">{row.website}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Members',
      accessor: '_count.organization_members',
      cell: (value: any, row: Organization) => row._count?.organization_members || 0,
    },
    {
      header: 'Tier',
      accessor: 'subscriptions.tier',
      cell: (value: any, row: Organization) => (
        <Badge variant="outline">{row.subscriptions?.tier || 'FREE'}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'subscriptions.status',
      cell: (value: any, row: Organization) => (
        <Badge variant={row.subscriptions?.status === 'ACTIVE' ? 'default' : 'destructive'}>
          {row.subscriptions?.status || 'INACTIVE'}
        </Badge>
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
      onClick: (row: Organization) => {
        toast({
          title: 'View Organization',
          description: `Viewing details for ${row.name}`,
        });
        console.log('View org:', row.id);
      },
    },
    {
      label: 'Manage',
      onClick: (row: Organization) => {
        toast({
          title: 'Manage Organization',
          description: `Managing ${row.name}`,
        });
        console.log('Manage org:', row.id);
      },
    },
  ];

  const filteredOrgs = orgsData?.organizations?.filter((org: Organization) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return org.name?.toLowerCase().includes(searchLower);
  }) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage platform organizations and subscriptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="ELITE">Elite</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
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
            loading={isLoading}
            emptyMessage="No organizations found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
