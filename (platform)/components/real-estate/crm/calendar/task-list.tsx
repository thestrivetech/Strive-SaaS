'use client';

import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  userId: string;
}

export function TaskList({ userId }: TaskListProps) {
  // Placeholder for now - will be enhanced later
  const tasks = [
    { id: '1', title: 'Follow up with lead', completed: false, dueDate: new Date() },
    { id: '2', title: 'Prepare proposal', completed: false, dueDate: new Date() },
    { id: '3', title: 'Review contract', completed: true, dueDate: new Date() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 mt-0.5"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{format(task.dueDate, 'MMM d')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
