import MilestoneTimeline from '../transaction/milestone-timeline';

export default function MilestoneTimelineExample() {
  const milestones = [
    {
      id: "1",
      title: "Contract Signed",
      date: "Dec 1, 2025",
      completed: true,
      description: "Purchase agreement executed by all parties",
    },
    {
      id: "2",
      title: "Inspection Period",
      date: "Dec 8, 2025",
      completed: true,
      description: "Complete home inspection and review report",
    },
    {
      id: "3",
      title: "Financing Contingency",
      date: "Dec 15, 2025",
      completed: false,
      description: "Obtain loan approval from lender",
    },
    {
      id: "4",
      title: "Appraisal Complete",
      date: "Dec 18, 2025",
      completed: false,
      description: "Property appraisal meets purchase price",
    },
    {
      id: "5",
      title: "Final Walkthrough",
      date: "Dec 28, 2025",
      completed: false,
      description: "Verify property condition before closing",
    },
    {
      id: "6",
      title: "Closing Date",
      date: "Dec 30, 2025",
      completed: false,
      description: "Sign final documents and transfer ownership",
    },
  ];

  return (
    <div className="p-4 max-w-2xl">
      <MilestoneTimeline milestones={milestones} />
    </div>
  );
}
