import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { AgentWizard } from '@/components/real-estate/ai-hub/agents/AgentWizard';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Create Agent | NeuroFlow Hub',
  description: 'Create a new AI agent for automated workflows',
};

export default async function NewAgentPage() {
  // Authentication check - returns EnhancedUser or redirects
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 cyber-grid p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<Skeleton className="h-[600px] w-full max-w-4xl mx-auto" />}>
        <AgentWizard user={user} />
      </Suspense>
    </div>
  );
}
