import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ROISimulator } from '@/components/real-estate/reid/analytics/ROISimulator';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ROI Simulator | REID Dashboard',
  description: 'Investment return calculator and financial projections',
};

export default function ROIPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Calculator className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">ROI Simulator</h1>
            <p className="text-slate-400 mt-1">
              Calculate investment returns and project cash flows
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <ROISimulator />
      </Suspense>
    </div>
  );
}
