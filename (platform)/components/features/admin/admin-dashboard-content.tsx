'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './stat-card';
import { SubscriptionChart } from './subscription-chart';
import { RevenueChart } from './revenue-chart';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AdminDashboardContentProps {
  activeTab: string;
}

export function AdminDashboardContent({ activeTab }: AdminDashboardContentProps) {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  if (activeTab !== 'dashboard') {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} content coming soon
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and system management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Organizations"
            value={metrics?.total_orgs || 0}
            change={`+${metrics?.new_orgs || 0} today`}
            icon={Building2}
            loading={metricsLoading}
          />
          <StatCard
            title="Total Users"
            value={metrics?.total_users || 0}
            change={`${metrics?.active_users || 0} active`}
            icon={Users}
            loading={metricsLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${((metrics?.mrr_cents || 0) / 100).toLocaleString()}`}
            change="+12.5% from last month"
            icon={DollarSign}
            loading={metricsLoading}
          />
          <StatCard
            title="Active Subscriptions"
            value={metrics?.total_orgs || 0}
            change="95.2% retention rate"
            icon={Activity}
            loading={metricsLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionChart data={metrics} loading={metricsLoading} />
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={metrics} loading={metricsLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section (placeholder) */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organizations table will be implemented in Session 8
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
