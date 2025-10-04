import TaskChecklist from '../transaction/task-checklist';

export default function TaskChecklistExample() {
  const tasks = [
    {
      id: "1",
      title: "Order home inspection",
      description: "Schedule and complete property inspection",
      completed: true,
      assignee: { name: "John Smith" },
      dueDate: "Dec 5, 2025",
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Submit loan application",
      description: "Complete and submit all required documentation",
      completed: true,
      assignee: { name: "Sarah Johnson" },
      dueDate: "Dec 8, 2025",
      priority: "high" as const,
    },
    {
      id: "3",
      title: "Review title report",
      completed: false,
      assignee: { name: "Mike Davis" },
      dueDate: "Dec 18, 2025",
      priority: "medium" as const,
    },
    {
      id: "4",
      title: "Schedule final walkthrough",
      completed: false,
      assignee: { name: "Emily Chen" },
      dueDate: "Dec 14, 2025",
      priority: "medium" as const,
    },
    {
      id: "5",
      title: "Wire transfer funds",
      completed: false,
      dueDate: "Dec 20, 2025",
      isOverdue: false,
      priority: "high" as const,
    },
  ];

  return (
    <div className="p-4 max-w-2xl">
      <TaskChecklist
        title="Purchase Checklist"
        tasks={tasks}
        onToggleTask={(id) => console.log('Toggle task:', id)}
      />
    </div>
  );
}
