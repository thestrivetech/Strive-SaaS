'use client';

import { TaskStatus, Priority } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TaskWithAssignee } from '@/lib/modules/tasks/queries';

interface TaskCardProps {
  task: TaskWithAssignee;
  onClick?: () => void;
  className?: string;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-slate-100 text-slate-700 border-slate-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-300',
  [TaskStatus.REVIEW]: 'bg-purple-100 text-purple-700 border-purple-300',
  [TaskStatus.DONE]: 'bg-green-100 text-green-700 border-green-300',
  [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-700 border-gray-300',
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-700 border-gray-300',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-300',
  [Priority.CRITICAL]: 'bg-red-100 text-red-700 border-red-300',
};

export function TaskCard({ task, onClick, className }: TaskCardProps) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== TaskStatus.DONE;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer',
        isOverdue && 'border-red-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <Badge variant="outline" className={cn('text-xs', statusColors[task.status])}>
            {statusLabels[task.status]}
          </Badge>

          {/* Due Date */}
          {task.due_date && (
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-600 font-medium'
              )}
            >
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Number(task.estimated_hours)}h</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignedTo.avatar_url || undefined} />
            <AvatarFallback className="text-[10px]">
              {task.assignedTo.name?.[0]?.toUpperCase() || task.assignedTo.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}