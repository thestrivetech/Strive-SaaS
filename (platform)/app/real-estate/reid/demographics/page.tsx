import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DemographicsPanel } from '@/components/real-estate/reid/analytics/DemographicsPanel';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Demographics Analysis | REID Dashboard',
  description: 'Comprehensive demographic insights for target markets',
};

export default function DemographicsPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Demographics Analysis</h1>
            <p className="text-slate-400 mt-1">
              Population statistics, income levels, and household composition
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <DemographicsPanel />
      </Suspense>
    </div>
  );
}
