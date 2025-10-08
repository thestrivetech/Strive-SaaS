'use client';

import React from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_PLATFORM_METRICS } from '@/lib/data/admin/mock-platform-metrics';
import { getRecentAuditLogs } from '@/lib/data/admin/mock-audit-logs';
import { getSubscriptionStats } from '@/lib/data/admin/mock-subscriptions';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Database,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const metrics = MOCK_PLATFORM_METRICS.overview;
  const subscriptionStats = getSubscriptionStats();
  const recentAuditLogs = getRecentAuditLogs(5);

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and system management
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalOrganizations}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+2 this week</span>
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+27 this month</span>
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(metrics.monthlyRevenue / 100).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+7.4% from last month</span>
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStats.active}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <span className="text-muted-foreground">{subscriptionStats.retentionRate}% retention</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health & Database */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge variant="default">{metrics.systemHealth}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Alerts</span>
                  <Badge variant={metrics.securityAlerts > 0 ? 'destructive' : 'secondary'}>
                    {metrics.securityAlerts}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Super Admins</span>
                  <span className="text-sm text-muted-foreground">{metrics.superAdminCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Size</span>
                  <span className="text-sm text-muted-foreground">{MOCK_PLATFORM_METRICS.database.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Records</span>
                  <span className="text-sm text-muted-foreground">
                    {MOCK_PLATFORM_METRICS.database.totalRecords.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Growth</span>
                  <Badge variant="secondary">{MOCK_PLATFORM_METRICS.database.dailyGrowth}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user_name} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        log.severity === 'CRITICAL'
                          ? 'destructive'
                          : log.severity === 'ERROR'
                          ? 'destructive'
                          : log.severity === 'WARNING'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {log.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
