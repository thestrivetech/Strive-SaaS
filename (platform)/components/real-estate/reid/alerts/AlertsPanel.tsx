'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, Plus } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { AlertBadge } from '../shared/AlertBadge';
import { Button } from '@/components/ui/button';
import { CreateAlertDialog } from './CreateAlertDialog';
import { useState } from 'react';
import { AlertSeverity } from '@prisma/client';

export function AlertsPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['property-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    }
  });

  const activeAlerts = alerts?.alerts?.filter((a: any) => a.is_active) || [];

  return (
    <>
      <REIDCard>
        <REIDCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="reid-button-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Alert
            </Button>
          </div>
        </REIDCardHeader>

        <REIDCardContent>
          {isLoading ? (
            <div className="text-slate-400 text-center py-4">Loading alerts...</div>
          ) : activeAlerts.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              No active alerts. Create one to monitor market changes.
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert: any) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </REIDCardContent>
      </REIDCard>

      <CreateAlertDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}

function AlertItem({ alert }: { alert: any }) {
  const latestTrigger = alert.triggers?.[0];
  const severity = latestTrigger?.severity || 'MEDIUM';

  return (
    <AlertBadge severity={severity as AlertSeverity}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-white">{alert.name}</div>
          {alert.description && (
            <div className="text-sm text-slate-300 mt-1">{alert.description}</div>
          )}
          <div className="text-xs text-slate-400 mt-2">
            {alert.area_codes.length} areas • {alert.frequency} frequency
          </div>
        </div>
        {latestTrigger && (
          <div className="text-xs text-slate-400">
            Last triggered: {new Date(latestTrigger.triggered_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </AlertBadge>
  );
}
