import { BuildProgress } from "../BuildProgress";

export default function BuildProgressExample() {
  const milestones = [
    { id: "1", label: "Requirements Analysis", completed: true, active: false },
    { id: "2", label: "Agent Design", completed: true, active: false },
    { id: "3", label: "Development", completed: false, active: true },
    { id: "4", label: "Testing", completed: false, active: false },
    { id: "5", label: "Deployment", completed: false, active: false },
  ];

  return (
    <div className="p-8 bg-background max-w-md">
      <BuildProgress milestones={milestones} />
    </div>
  );
}
