'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/features/admin/data-table';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  organization_members: Array<{
    organizations: {
      id: string;
      name: string;
    };
  }>;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', { role: roleFilter, tier: tierFilter, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);

      const response = await fetch(`/api/v1/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/v1/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason: 'Admin action',
        }),
      });
      if (!response.ok) throw new Error('Failed to suspend user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User suspended',
        description: 'The user has been successfully suspended.',
      });
      setShowSuspendDialog(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive',
      });
    },
  });

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value: string | null, row: User) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {value?.[0]?.toUpperCase() || row.email[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium">{value || 'No name'}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Organization',
      accessor: 'organization_members',
      cell: (value: User['organization_members']) => {
        if (!value || value.length === 0) {
          return <span className="text-muted-foreground text-sm">No organization</span>;
        }
        return (
          <span className="text-sm">{value[0]?.organizations?.name || 'Unknown'}</span>
        );
      },
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (value: string) => (
        <Badge variant={value === 'ADMIN' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      header: 'Tier',
      accessor: 'subscription_tier',
      cell: (value: string) => (
        <Badge variant="outline">{value || 'FREE'}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Active' : 'Suspended'}
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
      onClick: (row: User) => {
        console.log('View user:', row.id);
        toast({
          title: 'View User',
          description: `Viewing details for ${row.email}`,
        });
      },
    },
    {
      label: 'Suspend',
      onClick: (row: User) => {
        setSelectedUser(row);
        setShowSuspendDialog(true);
      },
      variant: 'destructive' as const,
    },
  ];

  const filteredUsers = usersData?.users?.filter((user: User) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage platform users and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>

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
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredUsers}
            actions={actions}
            loading={isLoading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend{' '}
              <strong>{selectedUser?.name || selectedUser?.email}</strong>? They will be unable to
              access the platform until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && suspendMutation.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
