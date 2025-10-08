import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AlertsPanel } from '@/components/real-estate/reid/alerts/AlertsPanel';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Market Alerts | REID Dashboard',
  description: 'Real-time market alerts and notifications',
};

export default function AlertsPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Market Alerts</h1>
            <p className="text-slate-400 mt-1">
              Configure and manage market condition alerts and notifications
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <AlertsPanel />
      </Suspense>
    </div>
  );
}
