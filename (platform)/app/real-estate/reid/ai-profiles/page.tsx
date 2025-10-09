import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { AIProfilesClient } from '@/components/real-estate/reid/ai-profiles/AIProfilesClient';
import { Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Market Profiles | REID Dashboard',
  description: 'AI-generated market profiles and insights',
};

export default function AIProfilesPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Market Profiles</h1>
            <p className="text-slate-400 mt-1">
              AI-generated comprehensive market analysis and recommendations
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <AIProfilesClient />
      </Suspense>
    </div>
  );
}
