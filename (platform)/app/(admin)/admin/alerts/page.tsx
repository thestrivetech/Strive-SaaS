'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bell, Plus, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemAlertForm } from '@/components/features/admin/system-alert-form';

const ALERT_ICONS = {
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  SUCCESS: CheckCircle,
};

const ALERT_COLORS = {
  INFO: 'text-blue-500',
  WARNING: 'text-orange-500',
  ERROR: 'text-red-500',
  SUCCESS: 'text-green-500',
};

export default function SystemAlertsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-muted-foreground">
            Manage platform-wide notifications and announcements
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create System Alert</DialogTitle>
            </DialogHeader>
            <SystemAlertForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          alerts?.map((alert: any) => {
            const Icon = ALERT_ICONS[alert.level as keyof typeof ALERT_ICONS];
            const iconColor = ALERT_COLORS[alert.level as keyof typeof ALERT_COLORS];

            return (
              <Card key={alert.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{alert.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Starts</p>
                      <p className="font-medium">
                        {new Date(alert.startsAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ends</p>
                      <p className="font-medium">
                        {alert.endsAt
                          ? new Date(alert.endsAt).toLocaleDateString()
                          : 'No end date'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium">{alert.viewCount}</p>
                    </div>
                  </div>

                  {alert.isGlobal && (
                    <div className="mt-4">
                      <Badge variant="secondary">Global Alert</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
