import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  isOverdue?: boolean;
  priority?: "low" | "medium" | "high";
}

export interface TaskChecklistProps {
  title: string;
  tasks: Task[];
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

const priorityColors = {
  low: "bg-[hsl(142,71%,45%)] text-white",
  medium: "bg-[hsl(38,92%,50%)] text-white",
  high: "bg-[hsl(0,84%,60%)] text-white",
};

export default function TaskChecklist({ title, tasks, onToggleTask, onDeleteTask }: TaskChecklistProps) {
  const [taskStates, setTaskStates] = useState(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.completed }), {} as Record<string, boolean>)
  );

  useEffect(() => {
    setTaskStates(
      tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.completed }), {} as Record<string, boolean>)
    );
  }, [tasks]);

  const handleToggle = (taskId: string) => {
    onToggleTask?.(taskId);
  };

  const completedCount = Object.values(taskStates).filter(Boolean).length;
  const totalCount = tasks.length;

  return (
    <Card data-testid="card-task-checklist">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-sm text-muted-foreground" data-testid="text-task-progress">
            {completedCount}/{totalCount} completed
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex gap-3 p-3 rounded-md border ${
                taskStates[task.id] ? "bg-muted/30 opacity-60" : "bg-background"
              }`}
              data-testid={`task-item-${task.id}`}
            >
              <Checkbox
                checked={taskStates[task.id]}
                onCheckedChange={() => handleToggle(task.id)}
                data-testid={`checkbox-task-${task.id}`}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${taskStates[task.id] ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                  {task.priority && (
                    <Badge className={priorityColors[task.priority]} data-testid={`badge-priority-${task.priority}`}>
                      {task.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {task.assignee && (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${task.isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                      {task.isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      <span>{task.dueDate}</span>
                    </div>
                  )}
                  {onDeleteTask && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="ml-auto"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
