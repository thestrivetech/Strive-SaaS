import TaskChecklist from "@/components/transaction/task-checklist";
import MilestoneTimeline from "@/components/transaction/milestone-timeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useMilestones } from "@/lib/hooks/useMilestones";
import { useLoops } from "@/lib/hooks/useLoops";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createTaskSchema = z.object({
  loopId: z.string().min(1, "Transaction is required"),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assigneeName: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  completed: z.boolean().default(false),
});

const createMilestoneSchema = z.object({
  loopId: z.string().min(1, "Transaction is required"),
  title: z.string().min(1, "Milestone title is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  completed: z.boolean().default(false),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;
type CreateMilestoneForm = z.infer<typeof createMilestoneSchema>;

export default function Tasks() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();
  const { data: loops } = useLoops();
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [createMilestoneDialogOpen, setCreateMilestoneDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const taskForm = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      loopId: "",
      title: "",
      description: "",
      assigneeName: "",
      dueDate: "",
      priority: "medium",
      completed: false,
    },
  });

  const milestoneForm = useForm<CreateMilestoneForm>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      loopId: "",
      title: "",
      date: "",
      description: "",
      completed: false,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskForm) => apiRequest('POST', '/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setCreateTaskDialogOpen(false);
      taskForm.reset();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: CreateMilestoneForm) => apiRequest('POST', '/api/milestones', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setCreateMilestoneDialogOpen(false);
      milestoneForm.reset();
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create milestone",
        variant: "destructive",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiRequest('PATCH', `/api/tasks/${id}`, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });
      const previousTasks = queryClient.getQueryData(['/api/tasks']);
      queryClient.setQueryData(['/api/tasks'], (old: any) => {
        if (!old) return old;
        return old.map((task: any) =>
          task.id === id ? { ...task, completed } : task
        );
      });
      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['/api/tasks'], context.previousTasks);
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiRequest('PATCH', `/api/milestones/${id}`, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/milestones'] });
      const previousMilestones = queryClient.getQueryData(['/api/milestones']);
      queryClient.setQueryData(['/api/milestones'], (old: any) => {
        if (!old) return old;
        return old.map((milestone: any) =>
          milestone.id === id ? { ...milestone, completed } : milestone
        );
      });
      return { previousMilestones };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMilestones) {
        queryClient.setQueryData(['/api/milestones'], context.previousMilestones);
      }
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      setDeleteDialogOpen(false);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = (id: string) => {
    const task = tasks?.find((t) => t.id === id);
    if (task) {
      toggleTaskMutation.mutate({ id, completed: !task.completed });
    }
  };

  const handleToggleMilestone = (id: string) => {
    const milestone = milestones?.find((m) => m.id === id);
    if (milestone) {
      toggleMilestoneMutation.mutate({ id, completed: !milestone.completed });
    }
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmitTask = (data: CreateTaskForm) => {
    createTaskMutation.mutate(data);
  };

  const handleSubmitMilestone = (data: CreateMilestoneForm) => {
    createMilestoneMutation.mutate(data);
  };

  const formattedMilestones = useMemo(() => {
    if (!milestones) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return milestones.map(milestone => {
      const milestoneDate = new Date(milestone.date);
      milestoneDate.setHours(0, 0, 0, 0);
      const isOverdue = !milestone.completed && milestoneDate < today;
      
      return {
        id: milestone.id,
        title: milestone.title,
        date: new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        completed: milestone.completed,
        isOverdue,
        description: milestone.description || undefined,
      };
    });
  }, [milestones]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Tasks & Milestones</h1>
          <p className="text-muted-foreground">Track transaction progress and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateTaskDialogOpen(true)} data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
          <Button onClick={() => setCreateMilestoneDialogOpen(true)} data-testid="button-create-milestone" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Milestone
          </Button>
        </div>
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
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found
          </div>
        )}

        {milestonesLoading ? (
          <Skeleton className="h-96" data-testid="skeleton-milestones" />
        ) : formattedMilestones.length > 0 ? (
          <MilestoneTimeline 
            milestones={formattedMilestones}
            onToggleMilestone={handleToggleMilestone}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No milestones found
          </div>
        )}
      </div>

      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent data-testid="dialog-create-task">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track transaction progress
            </DialogDescription>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(handleSubmitTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="loopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Loop</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-loop">
                          <SelectValue placeholder="Select transaction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loops?.map((loop) => (
                          <SelectItem key={loop.id} value={loop.id} data-testid={`option-loop-${loop.id}`}>
                            {loop.propertyAddress}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Schedule inspection" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add task details..." 
                        {...field} 
                        data-testid="input-description"
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="assigneeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} data-testid="input-assignee" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low" data-testid="option-priority-low">Low</SelectItem>
                        <SelectItem value="medium" data-testid="option-priority-medium">Medium</SelectItem>
                        <SelectItem value="high" data-testid="option-priority-high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateTaskDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit">
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={createMilestoneDialogOpen} onOpenChange={setCreateMilestoneDialogOpen}>
        <DialogContent data-testid="dialog-create-milestone">
          <DialogHeader>
            <DialogTitle>Create New Milestone</DialogTitle>
            <DialogDescription>
              Add a new milestone to track transaction timeline
            </DialogDescription>
          </DialogHeader>
          <Form {...milestoneForm}>
            <form onSubmit={milestoneForm.handleSubmit(handleSubmitMilestone)} className="space-y-4">
              <FormField
                control={milestoneForm.control}
                name="loopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Loop</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-milestone-loop">
                          <SelectValue placeholder="Select transaction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loops?.map((loop) => (
                          <SelectItem key={loop.id} value={loop.id} data-testid={`option-milestone-loop-${loop.id}`}>
                            {loop.propertyAddress}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Inspection scheduled" {...field} data-testid="input-milestone-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-milestone-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add milestone details..." 
                        {...field} 
                        data-testid="input-milestone-description"
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateMilestoneDialogOpen(false)} data-testid="button-cancel-milestone">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMilestoneMutation.isPending} data-testid="button-submit-milestone">
                  {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-task">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete && !deleteMutation.isPending) {
                  deleteMutation.mutate(taskToDelete);
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
