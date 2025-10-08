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
import { Search, Download, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MOCK_SUBSCRIPTIONS, type MockSubscription } from '@/lib/data/admin/mock-subscriptions';

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search subscriptions
  const filteredSubs = useMemo(() => {
    return MOCK_SUBSCRIPTIONS.filter((sub) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = sub.organization_name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (tierFilter !== 'all' && sub.tier !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [search, tierFilter, statusFilter]);

  // Export to CSV
  const handleExport = () => {
    const csvHeaders =
      'Organization,Tier,Status,Billing Cycle,Amount,Seats,Start Date,Current Period Start,Current Period End\n';
    const csvData = filteredSubs
      .map(
        (sub) =>
          `"${sub.organization_name}","${sub.tier}","${sub.status}","${sub.billing_cycle}","$${(
            sub.amount / 100
          ).toFixed(2)}",${sub.seats},"${sub.start_date}","${sub.current_period_start}","${
            sub.current_period_end
          }"`
      )
      .join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredSubs.length} subscriptions to CSV`,
    });
  };

  const columns = [
    {
      header: 'Organization',
      accessor: 'organization_name',
      cell: (value: string) => (
        <div className="font-medium text-sm max-w-xs truncate">{value}</div>
      ),
    },
    {
      header: 'Tier',
      accessor: 'tier',
      cell: (value: string) => {
        const colors: Record<string, any> = {
          FREE: 'secondary',
          CUSTOM: 'outline',
          STARTER: 'default',
          GROWTH: 'default',
          ELITE: 'default',
          ENTERPRISE: 'default',
        };
        return <Badge variant={colors[value]}>{value}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value: string) => {
        const variant =
          value === 'ACTIVE'
            ? 'default'
            : value === 'PAST_DUE'
            ? 'destructive'
            : value === 'CANCELLED'
            ? 'destructive'
            : 'secondary';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Billing',
      accessor: 'billing_cycle',
      cell: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (value: number) => (
        <span className="font-medium">${(value / 100).toLocaleString()}</span>
      ),
    },
    {
      header: 'Seats',
      accessor: 'seats',
      cell: (value: number) => <span className="text-sm">{value}</span>,
    },
    {
      header: 'Current Period',
      accessor: 'current_period_end',
      cell: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (row: MockSubscription) => {
        toast({
          title: 'View Subscription',
          description: `Viewing details for ${row.organization_name}`,
        });
      },
    },
    {
      label: 'Manage',
      onClick: (row: MockSubscription) => {
        toast({
          title: 'Manage Subscription',
          description: `Managing subscription for ${row.organization_name}`,
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
              <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
              <p className="text-muted-foreground">
                Manage platform subscriptions and billing
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
                {filteredSubs.length} subscription{filteredSubs.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredSubs}
                actions={actions}
                loading={false}
                emptyMessage="No subscriptions found"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
