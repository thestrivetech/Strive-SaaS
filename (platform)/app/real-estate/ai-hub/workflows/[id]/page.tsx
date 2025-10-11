import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { getWorkflowById } from '@/lib/modules/ai-hub/workflows';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Play, Power, PowerOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

async function WorkflowDetailsContent({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !canAccessAIHub(user)) {
    redirect('/real-estate/dashboard');
  }

  const workflow = await getWorkflowById(params.id, user.organizationId);
  if (!workflow) {
    notFound();
  }

  const nodes = workflow.nodes as any[] || [];
  const edges = workflow.edges as any[] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/real-estate/ai-hub/workflows">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workflows
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/real-estate/ai-hub/workflows/${workflow.id}/edit`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button className="bg-green-500 hover:bg-green-600">
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>

        {/* Main Info */}
        <EnhancedCard glassEffect="strong" neonBorder="cyan">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl text-white mb-2">{workflow.name}</CardTitle>
                {workflow.description && (
                  <p className="text-white/70">{workflow.description}</p>
                )}
              </div>
              <Badge
                className={`${
                  workflow.is_active
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                } border`}
              >
                {workflow.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-white/50 mb-1">Version</div>
                <div className="text-xl font-semibold text-white">{workflow.version}</div>
              </div>
              <div>
                <div className="text-sm text-white/50 mb-1">Nodes</div>
                <div className="text-xl font-semibold text-white">{nodes.length}</div>
              </div>
              <div>
                <div className="text-sm text-white/50 mb-1">Connections</div>
                <div className="text-xl font-semibold text-white">{edges.length}</div>
              </div>
              <div>
                <div className="text-sm text-white/50 mb-1">Executions</div>
                <div className="text-xl font-semibold text-white">{workflow.execution_count || 0}</div>
              </div>
            </div>

            {workflow.tags && workflow.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-white/50 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/5 text-white/70 border border-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </EnhancedCard>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedCard glassEffect="medium" neonBorder="purple">
            <CardHeader>
              <CardTitle className="text-white">Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/50">Created by:</span>
                <span className="text-white">{workflow.creator?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Created:</span>
                <span className="text-white">
                  {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Last updated:</span>
                <span className="text-white">
                  {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Workflow ID:</span>
                <span className="text-white font-mono text-xs">{workflow.id}</span>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard glassEffect="medium" neonBorder="green">
            <CardHeader>
              <CardTitle className="text-white">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.executions && workflow.executions.length > 0 ? (
                <div className="space-y-2">
                  {workflow.executions.slice(0, 5).map((execution: any) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-2 rounded bg-white/5"
                    >
                      <Badge
                        className={`${
                          execution.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400'
                            : execution.status === 'FAILED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {execution.status}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-4">No executions yet</p>
              )}
            </CardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <WorkflowDetailsContent params={params} />
    </Suspense>
  );
}
