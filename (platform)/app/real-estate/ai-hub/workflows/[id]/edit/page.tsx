'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowBuilder } from '@/components/real-estate/ai-hub/workflows/WorkflowBuilder';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkflowById } from '@/lib/modules/ai-hub/workflows';

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflow() {
      try {
        // In production, get from auth context
        const demoOrgId = 'demo-org-id';
        setOrganizationId(demoOrgId);

        const workflowData = await getWorkflowById(params.id, demoOrgId);
        if (!workflowData) {
          toast.error('Workflow not found');
          router.push('/real-estate/ai-hub/workflows');
          return;
        }

        setWorkflow(workflowData);
      } catch (error) {
        toast.error('Failed to load workflow');
        router.push('/real-estate/ai-hub/workflows');
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflow();
  }, [params.id, router]);

  const handleSave = (updatedWorkflow: any) => {
    toast.success('Workflow updated successfully');
    router.push(`/real-estate/ai-hub/workflows/${updatedWorkflow.id}`);
  };

  if (isLoading || !workflow || !organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <WorkflowBuilder
        workflow={workflow}
        organizationId={organizationId}
        onSave={handleSave}
      />
    </ReactFlowProvider>
  );
}
