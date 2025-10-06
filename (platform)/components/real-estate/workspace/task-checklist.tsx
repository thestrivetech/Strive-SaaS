'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Loader2, Calendar, User } from 'lucide-react';
import { TaskCreateDialog } from './task-create-dialog';
import {
  getTasksByLoop,
  completeTransactionTask,
  type TaskWithDetails,
} from '@/lib/modules/transactions/tasks';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskChecklistProps {
  loopId: string;
}

export function TaskChecklist({ loopId }: TaskChecklistProps) {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getTasksByLoop({ loopId });
      setTasks(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load tasks',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [loopId]);

  async function handleCompleteTask(taskId: string) {
    try {
      setCompletingId(taskId);
      await completeTransactionTask(taskId);
      toast({
        title: 'Task completed',
        description: 'The task has been marked as completed',
      });
      loadTasks(); // Reload list
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete task',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setCompletingId(null);
    }
  }

  function getPriorityBadgeVariant(
    priority: TaskPriority
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  function getStatusBadgeVariant(
    status: TaskStatus
  ): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'DONE':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  function isOverdue(dueDate: Date | null, status: TaskStatus): boolean {
    if (!dueDate || status === 'DONE') return false;
    return new Date(dueDate) < new Date();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Tasks</CardTitle>
        <TaskCreateDialog loopId={loopId} onSuccess={loadTasks} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tasks yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create tasks to track transaction progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const overdue = isOverdue(task.due_date, task.status);

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                    task.status === 'DONE' && 'bg-muted/50 opacity-75',
                    overdue && 'border-destructive bg-destructive/5'
                  )}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status === 'DONE'}
                    disabled={task.status === 'DONE' || completingId === task.id}
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={cn(
                          'font-medium cursor-pointer',
                          task.status === 'DONE' && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </label>

                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {task.due_date && (
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            overdue && 'text-destructive font-medium'
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {overdue && <span className="text-xs">OVERDUE:</span>}
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      )}

                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {task.assignee.name}
                        </div>
                      )}

                      {!task.assignee && (
                        <div className="flex items-center gap-1 text-muted-foreground/60">
                          <User className="h-3.5 w-3.5" />
                          Unassigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
