'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowBuilder } from '@/components/real-estate/ai-hub/workflows/WorkflowBuilder';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, get from auth context
    // For now, use demo organization
    const demoOrgId = 'demo-org-id';
    setOrganizationId(demoOrgId);
    setIsLoading(false);
  }, []);

  const handleSave = (workflow: any) => {
    toast.success('Workflow created successfully');
    router.push(`/real-estate/ai-hub/workflows/${workflow.id}`);
  };

  if (isLoading || !organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <WorkflowBuilder organizationId={organizationId} onSave={handleSave} />
    </ReactFlowProvider>
  );
}
