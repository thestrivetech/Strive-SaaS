import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketHeatmap } from '@/components/real-estate/reid/maps/MarketHeatmap';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Market Heatmap | REID Dashboard',
  description: 'Interactive market heatmap with real-time pricing and inventory data',
};

export default function HeatmapPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <MapPin className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Market Heatmap</h1>
            <p className="text-slate-400 mt-1">
              Interactive geographical market analysis with pricing and inventory overlays
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <MarketHeatmap />
      </Suspense>
    </div>
  );
}
