'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Edit,
  Trash2,
  MoreVertical,
  Power,
  PowerOff,
  Calendar,
  User,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  toggleWorkflowStatus,
  deleteWorkflow,
  executeWorkflow,
} from '@/lib/modules/ai-hub/workflows';
import type { automation_workflows } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowWithDetails extends automation_workflows {
  creator?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  executions?: Array<{
    id: string;
    status: string;
    started_at: Date;
  }>;
}

interface WorkflowCardProps {
  workflow: WorkflowWithDetails;
  organizationId: string;
}

export function WorkflowCard({ workflow, organizationId }: WorkflowCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleView = () => {
    router.push(`/real-estate/ai-hub/workflows/${workflow.id}`);
  };

  const handleEdit = () => {
    router.push(`/real-estate/ai-hub/workflows/${workflow.id}/edit`);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeWorkflow({
        workflowId: workflow.id,
        input: {},
      });
      toast.success('Workflow executed successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await toggleWorkflowStatus(workflow.id);
      toast.success(
        workflow.is_active ? 'Workflow deactivated' : 'Workflow activated'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkflow(workflow.id);
      toast.success('Workflow deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const lastExecution = workflow.executions?.[0];
  const executionCount = workflow.execution_count || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-strong rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer"
      onClick={handleView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{workflow.name}</h3>
          {workflow.description && (
            <p className="text-sm text-white/60 mt-1 line-clamp-2">{workflow.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExecute(); }}>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(); }}>
              {workflow.is_active ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {workflow.tags && workflow.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {workflow.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-white/5 text-white/70 border border-white/10"
            >
              {tag}
            </Badge>
          ))}
          {workflow.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-white/5 text-white/70 border border-white/10"
            >
              +{workflow.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <Badge
          className={`${
            workflow.is_active
              ? 'bg-green-500/20 text-green-400 border-green-500/50'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
          } border`}
        >
          {workflow.is_active ? 'Active' : 'Inactive'}
        </Badge>

        {lastExecution && (
          <Badge
            className={`${
              lastExecution.status === 'COMPLETED'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : lastExecution.status === 'FAILED'
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
            } border`}
          >
            Last: {lastExecution.status}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          {workflow.creator && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{workflow.creator.name || 'Unknown'}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>{executionCount} runs</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}</span>
        </div>
      </div>
    </motion.div>
  );
}
