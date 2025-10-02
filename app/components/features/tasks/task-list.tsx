'use client';

import { useState } from 'react';
import { TaskCard } from './task-card';
import { EditTaskDialog } from './edit-task-dialog';
import { TaskStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, CheckCircle2, Clock, Users } from 'lucide-react';
import { updateTaskStatus, deleteTask } from '@/lib/modules/tasks/actions';
import { bulkUpdateTaskStatus, bulkDeleteTasks, bulkAssignTasks } from '@/lib/modules/tasks/bulk-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BulkSelector, BulkSelectCheckbox, type BulkAction } from '@/components/ui/bulk-selector';
import { useRealtimeTaskUpdates } from '@/lib/realtime/use-realtime';
import type { TaskWithAssignee } from '@/lib/modules/tasks/queries';

interface TaskListProps {
  tasks: TaskWithAssignee[];
  projectId: string;
  teamMembers?: Array<{ id: string; name: string | null }>;
  groupByStatus?: boolean;
}

export function TaskList({
  tasks: initialTasks,
  projectId,
  teamMembers = [],
  groupByStatus = true,
}: TaskListProps) {
  // Realtime integration
  const { tasks, isConnected, setTasks } = useRealtimeTaskUpdates(projectId, initialTasks);

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete);
      toast.success('Task deleted successfully');
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (taskId: string) => {
    setSelectedTask(taskId);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  // Bulk operations handler
  const handleBulkAction = async (actionId: string, ids: string[]) => {
    setIsBulkProcessing(true);
    try {
      if (actionId === 'delete') {
        if (!confirm(`Delete ${ids.length} task${ids.length > 1 ? 's' : ''}?`)) {
          setIsBulkProcessing(false);
          return;
        }
        const result = await bulkDeleteTasks({ taskIds: ids });
        if (result.success) {
          toast.success(`Deleted ${result.data?.count} task${result.data?.count !== 1 ? 's' : ''}`);
          setSelectedIds([]);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to delete tasks');
        }
      } else if (actionId.startsWith('status-')) {
        const statusMap: Record<string, TaskStatus> = {
          'status-todo': TaskStatus.TODO,
          'status-in-progress': TaskStatus.IN_PROGRESS,
          'status-review': TaskStatus.REVIEW,
          'status-done': TaskStatus.DONE,
        };
        const status = statusMap[actionId];
        if (status) {
          const result = await bulkUpdateTaskStatus({ taskIds: ids, status });
          if (result.success) {
            toast.success(`Updated ${result.data?.count} task${result.data?.count !== 1 ? 's' : ''}`);
            setSelectedIds([]);
            router.refresh();
          } else {
            toast.error(result.error || 'Failed to update tasks');
          }
        }
      } else if (actionId.startsWith('assign-')) {
        const assigneeId = actionId.replace('assign-', '');
        const result = await bulkAssignTasks({ taskIds: ids, assigneeId });
        if (result.success) {
          toast.success(`Assigned ${result.data?.count} task${result.data?.count !== 1 ? 's' : ''}`);
          setSelectedIds([]);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to assign tasks');
        }
      }
    } catch (error) {
      toast.error('An error occurred during bulk operation');
      console.error('Bulk operation error:', error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    { id: 'status-todo', label: 'Mark as To Do', icon: <Clock className="h-4 w-4" /> },
    { id: 'status-in-progress', label: 'Mark as In Progress', icon: <Clock className="h-4 w-4" /> },
    { id: 'status-review', label: 'Mark as In Review', icon: <Clock className="h-4 w-4" /> },
    { id: 'status-done', label: 'Mark as Done', icon: <CheckCircle2 className="h-4 w-4" /> },
    ...(teamMembers.length > 0
      ? teamMembers.slice(0, 5).map((member) => ({
          id: `assign-${member.id}`,
          label: `Assign to ${member.name || 'User'}`,
          icon: <Users className="h-4 w-4" />,
        }))
      : []),
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'destructive' as const },
  ];

  // Group tasks by status
  const groupedTasks: Record<TaskStatus, typeof tasks> = {
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: [],
    [TaskStatus.CANCELLED]: [],
  };

  tasks.forEach((task) => {
    groupedTasks[task.status].push(task);
  });

  const statusLabels: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.REVIEW]: 'In Review',
    [TaskStatus.DONE]: 'Done',
    [TaskStatus.CANCELLED]: 'Cancelled',
  };

  const renderTaskCard = (task: typeof tasks[0]) => {
    const isSelected = selectedIds.includes(task.id);

    return (
      <div key={task.id} className="relative group">
        <div className="flex items-start gap-3">
          {/* Bulk select checkbox */}
          <div className="pt-4">
            <BulkSelectCheckbox
              id={task.id}
              checked={isSelected}
              onCheckedChange={() => {
                setSelectedIds((prev) =>
                  prev.includes(task.id)
                    ? prev.filter((id) => id !== task.id)
                    : [...prev, task.id]
                );
              }}
            />
          </div>

          <div className="flex-1">
            <TaskCard task={task} />
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(task.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              {/* Quick Status Changes */}
              {task.status !== TaskStatus.DONE && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, TaskStatus.DONE)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Done
                </DropdownMenuItem>
              )}

              {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.DONE && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Start Task
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteDialog(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  if (!groupByStatus) {
    return (
      <>
        {/* Connection Status & Bulk Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <BulkSelector
              items={tasks}
              actions={bulkActions}
              onBulkAction={handleBulkAction}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live updates' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {tasks.map((task) => renderTaskCard(task))}
        </div>

        {/* Edit Dialog */}
        {selectedTask && (
          <EditTaskDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            task={tasks.find((t) => t.id === selectedTask)!}
            teamMembers={teamMembers}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Render grouped by status
  return (
    <>
      {/* Connection Status & Bulk Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BulkSelector
            items={tasks}
            actions={bulkActions}
            onBulkAction={handleBulkAction}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live updates' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => {
          if (statusTasks.length === 0) return null;

          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{statusLabels[status as TaskStatus]}</h3>
                <span className="text-xs text-muted-foreground">({statusTasks.length})</span>
              </div>
              <div className="grid gap-3">
                {statusTasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {selectedTask && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={tasks.find((t) => t.id === selectedTask)!}
          teamMembers={teamMembers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}