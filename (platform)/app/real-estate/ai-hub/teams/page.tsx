import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { TeamsList } from '@/components/real-estate/ai-hub/teams/TeamsList';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Agent Teams | NeuroFlow Hub',
  description: 'Manage multi-agent teams for collaborative workflows',
};

export default async function TeamsPage() {
  // Authentication check - returns EnhancedUser or redirects
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 cyber-grid">
      <Suspense
        fallback={
          <div className="p-8">
            <Skeleton className="h-64 w-full mb-6" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        }
      >
        <TeamsList user={user} />
      </Suspense>
    </div>
  );
}
