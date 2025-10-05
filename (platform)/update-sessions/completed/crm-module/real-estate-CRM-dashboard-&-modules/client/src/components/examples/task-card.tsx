import { useState } from "react";
import { TaskCard } from "../crm/calendar/task-card";

export default function TaskCardExample() {
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
  ]);

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    console.log(`Task ${id} toggled`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 p-6">
      {tasks.map((task) => (
        <TaskCard key={task.id} {...task} onToggle={handleToggle} />
      ))}
    </div>
  );
}
