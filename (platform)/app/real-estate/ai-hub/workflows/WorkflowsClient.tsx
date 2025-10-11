'use client';

import { useRouter } from 'next/navigation';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { WorkflowList } from '@/components/real-estate/ai-hub/workflows/WorkflowList';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';
import type { automation_workflows } from '@prisma/client';

interface WorkflowsClientProps {
  workflows: any[];
  stats: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
  };
  user: UserWithOrganization;
}

export function WorkflowsClient({ workflows, stats, user }: WorkflowsClientProps) {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/real-estate/ai-hub/workflows/new');
  };

  return (
    <>
      <ModuleHeroSection
        user={user}
        moduleName="NeuroFlow Hub"
        moduleDescription="Build and manage AI-powered automation workflows"
        stats={[
          {
            label: 'Total Workflows',
            value: stats.totalWorkflows,
            icon: 'projects',
          },
          {
            label: 'Active Workflows',
            value: stats.activeWorkflows,
            icon: 'check',
          },
          {
            label: 'Total Executions',
            value: stats.totalExecutions,
            icon: 'barchart3',
          },
          {
            label: 'Success Rate',
            value: '94%',
            icon: 'trend',
          },
        ]}
      />

      <div className="p-4 sm:p-6">
        <WorkflowList
          workflows={workflows}
          organizationId={user.organizationId}
          onCreateNew={handleCreateNew}
        />
      </div>
    </>
  );
}
