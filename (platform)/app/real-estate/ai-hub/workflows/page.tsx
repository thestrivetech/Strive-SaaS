import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { getWorkflows, getWorkflowStats } from '@/lib/modules/ai-hub/workflows';
import { WorkflowsClient } from './WorkflowsClient';
import { Loader2 } from 'lucide-react';

async function WorkflowsContent() {
  const user = await getCurrentUser();
  if (!user || !canAccessAIHub(user)) {
    redirect('/real-estate/dashboard');
  }

  const [workflows, stats] = await Promise.all([
    getWorkflows(user.organizationId),
    getWorkflowStats(user.organizationId),
  ]);

  return <WorkflowsClient workflows={workflows} stats={stats} user={user} />;
}

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <WorkflowsContent />
      </Suspense>
    </div>
  );
}
