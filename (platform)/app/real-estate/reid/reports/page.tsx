import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { ReportsClient } from '@/components/real-estate/reid/reports/ReportsClient';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Market Reports | REID Dashboard',
  description: 'Generate comprehensive market analysis reports',
};

export default function ReportsPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Market Reports</h1>
            <p className="text-slate-400 mt-1">
              Generate and download comprehensive market analysis reports
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}
