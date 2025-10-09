import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { REIDBreadcrumb } from '@/components/real-estate/reid/shared/REIDBreadcrumb';
import { SchoolsClient } from '@/components/real-estate/reid/schools/SchoolsClient';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Districts | REID Dashboard',
  description: 'School district ratings and analysis for property evaluation',
};

export default function SchoolsPage() {
  return (
    <div className="reid-theme min-h-screen p-6 space-y-6">
      <REIDBreadcrumb />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">School Districts</h1>
            <p className="text-slate-400 mt-1">
              Educational quality metrics and school district boundaries
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <SchoolsClient />
      </Suspense>
    </div>
  );
}
