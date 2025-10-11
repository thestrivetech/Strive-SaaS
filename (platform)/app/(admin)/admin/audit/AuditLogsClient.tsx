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
import { Search, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Audit log type to match what the server returns
type AuditLog = {
  id: string;
  action: string;
  description: string;
  details: string;
  resource_type: string;
  resource_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  severity: string;
  ip_address: string;
  user_agent: string | null;
  timestamp: string;
  success: boolean;
  error: string | null;
  metadata: any;
};

interface AdminAuditLogsPageProps {
  initialLogs: AuditLog[];
}

export default function AdminAuditLogsClient({ initialLogs }: AdminAuditLogsPageProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Get unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(initialLogs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [initialLogs]);

  // Filter and search audit logs
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          log.user_name.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.resource_type.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Severity filter
      if (severityFilter !== 'all' && log.severity !== severityFilter) {
        return false;
      }

      // Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [search, severityFilter, actionFilter, initialLogs]);

  // Export to CSV
  const handleExport = () => {
    const csvHeaders = 'Timestamp,User,Action,Resource,Details,Severity,IP Address\n';
    const csvData = filteredLogs
      .map(
        (log) =>
          `"${log.timestamp}","${log.user_name}","${log.action}","${log.resource_type}","${log.details}","${log.severity}","${log.ip_address}"`
      )
      .join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredLogs.length} audit logs to CSV`,
    });
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      cell: (value: string) => (
        <span className="text-sm">{new Date(value).toLocaleString()}</span>
      ),
    },
    {
      header: 'User',
      accessor: 'user_name',
      cell: (value: string, row: AuditLog) => (
        <div>
          <p className="font-medium text-sm">{value}</p>
          <p className="text-xs text-muted-foreground">{row.user_email}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (value: string) => (
        <Badge variant="outline">{value.replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      header: 'Resource',
      accessor: 'resource_type',
      cell: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      header: 'Details',
      accessor: 'details',
      cell: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-md truncate block">
          {value}
        </span>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      cell: (value: string) => {
        const variant =
          value === 'CRITICAL'
            ? 'destructive'
            : value === 'ERROR'
            ? 'destructive'
            : value === 'WARNING'
            ? 'default'
            : 'secondary';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (row: AuditLog) => {
        toast({
          title: 'View Audit Log',
          description: `Viewing details for ${row.action}`,
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
              <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
              <p className="text-muted-foreground">
                Track all platform activities and system events
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
                    placeholder="Search by user, action, or details..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Severity Filter */}
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>

                {/* Action Filter */}
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>
                {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredLogs}
                actions={actions}
                loading={false}
                emptyMessage="No audit logs found"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
