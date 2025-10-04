import { TaskCard } from "@/components/crm/calendar/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Calendar() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Follow up with Sarah Johnson",
      description: "Discuss property requirements and schedule showing",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "high" as const,
      completed: false,
    },
    {
      id: "2",
      title: "Prepare listing presentation",
      description: "Create marketing materials for 1234 Luxury Lane",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "medium" as const,
      completed: false,
    },
    {
      id: "3",
      title: "Send contract to David Martinez",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: "high" as const,
      completed: true,
    },
    {
      id: "4",
      title: "Review inspection report",
      description: "890 Suburban Drive inspection results",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: "low" as const,
      completed: false,
    },
    {
      id: "5",
      title: "Property showing at 567 Downtown Plaza",
      description: "Emily Rodriguez - 2:00 PM appointment",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "high" as const,
      completed: false,
    },
    {
      id: "6",
      title: "Update MLS listings",
      description: "Add new photos for Maple Court property",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: "medium" as const,
      completed: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    console.log(`Task ${id} toggled`);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar & Tasks</h1>
          <p className="text-muted-foreground">
            Manage your schedule and track tasks
          </p>
        </div>
        <Button data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Calendar component placeholder - Ready for integration
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks ({pendingTasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} {...task} onToggle={handleToggle} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} {...task} onToggle={handleToggle} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
