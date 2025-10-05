import ActivityFeed from '../transaction/activity-feed';

export default function ActivityFeedExample() {
  const activities = [
    {
      id: "1",
      type: "signature" as const,
      user: { name: "John Smith" },
      action: "signed",
      target: "Purchase Agreement",
      timestamp: "2 minutes ago",
    },
    {
      id: "2",
      type: "upload" as const,
      user: { name: "Sarah Johnson" },
      action: "uploaded",
      target: "Inspection Report",
      timestamp: "1 hour ago",
    },
    {
      id: "3",
      type: "party" as const,
      user: { name: "Mike Davis" },
      action: "added",
      target: "Title Company",
      timestamp: "3 hours ago",
    },
    {
      id: "4",
      type: "message" as const,
      user: { name: "Emily Chen" },
      action: "commented on",
      target: "Closing Disclosure",
      timestamp: "5 hours ago",
    },
    {
      id: "5",
      type: "status" as const,
      user: { name: "System" },
      action: "changed status to",
      target: "Under Contract",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="p-4 max-w-lg">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <ActivityFeed activities={activities} />
    </div>
  );
}
