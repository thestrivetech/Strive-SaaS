import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketHeatmap } from '@/components/real-estate/reid/maps/MarketHeatmap';
import { DemographicsPanel } from '@/components/real-estate/reid/analytics/DemographicsPanel';
import { ROISimulator } from '@/components/real-estate/reid/analytics/ROISimulator';
import { TrendsChart } from '@/components/real-estate/reid/charts/TrendsChart';
import { AlertsPanel } from '@/components/real-estate/reid/alerts/AlertsPanel';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { BarChart3, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'REID Dashboard | Strive Tech',
  description: 'Real Estate Intelligence Dashboard - Comprehensive market insights and analytics',
};

export default function REIDDashboardPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <REIDBreadcrumb />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Real Estate Intelligence Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered market insights, analytics, and investment tools
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid - 4 columns on xl screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Market Heatmap - Spans 2 columns */}
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <MarketHeatmap />
          </Suspense>
        </div>

        {/* Demographics Panel */}
        <div className="xl:col-span-1">
          <Suspense fallback={<ChartSkeleton />}>
            <DemographicsPanel />
          </Suspense>
        </div>

        {/* Market Trends Chart */}
        <div className="xl:col-span-1">
          <Suspense fallback={<ChartSkeleton />}>
            <TrendsChart />
          </Suspense>
        </div>

        {/* ROI Simulator - Spans 2 columns */}
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <ROISimulator />
          </Suspense>
        </div>

        {/* Alerts Panel - Spans 2 columns */}
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <AlertsPanel />
          </Suspense>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Markets</p>
              <p className="text-2xl font-bold text-white mt-1">24</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">AI Insights Generated</p>
              <p className="text-2xl font-bold text-white mt-1">156</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">8</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
