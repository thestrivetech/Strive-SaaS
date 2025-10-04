import TaskChecklist from "@/components/transaction/task-checklist";
import MilestoneTimeline from "@/components/transaction/milestone-timeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useMilestones } from "@/lib/hooks/useMilestones";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Tasks & Milestones</h1>
          <p className="text-muted-foreground">Track transaction progress and deadlines</p>
        </div>
        <Button data-testid="button-create-task">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tasksLoading ? (
          <Skeleton className="h-96" data-testid="skeleton-tasks" />
        ) : tasks && tasks.length > 0 ? (
          <TaskChecklist
            title="Active Tasks"
            tasks={tasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || undefined,
              completed: task.completed,
              assignee: task.assigneeName ? { name: task.assigneeName } : undefined,
              dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
              priority: task.priority as any,
            }))}
            onToggleTask={(id) => console.log('Toggle task:', id)}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found
          </div>
        )}

        {milestonesLoading ? (
          <Skeleton className="h-96" data-testid="skeleton-milestones" />
        ) : milestones && milestones.length > 0 ? (
          <MilestoneTimeline 
            milestones={milestones.map(milestone => ({
              id: milestone.id,
              title: milestone.title,
              date: new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              completed: milestone.completed,
              description: milestone.description || undefined,
            }))}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No milestones found
          </div>
        )}
      </div>
    </div>
  );
}
