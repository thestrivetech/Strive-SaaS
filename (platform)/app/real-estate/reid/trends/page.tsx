import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrendsChart } from '@/components/real-estate/reid/charts/TrendsChart';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Market Trends | REID Dashboard',
  description: 'Historical and predictive market trend analysis',
};

export default function TrendsPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Market Trends</h1>
            <p className="text-slate-400 mt-1">
              Historical price movements and future market predictions
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <TrendsChart />
      </Suspense>
    </div>
  );
}
