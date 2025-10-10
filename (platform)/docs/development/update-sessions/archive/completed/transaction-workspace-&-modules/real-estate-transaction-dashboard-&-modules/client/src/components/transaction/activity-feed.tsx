import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, CheckCircle, MessageSquare, Upload, UserPlus, Clock, FolderOpen, ListTodo } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ActivityType = "document" | "signature" | "message" | "upload" | "party" | "status" | "loop" | "task";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxHeight?: string;
}

const activityIcons: Record<ActivityType, any> = {
  document: FileText,
  signature: CheckCircle,
  message: MessageSquare,
  upload: Upload,
  party: UserPlus,
  status: Clock,
  loop: FolderOpen,
  task: ListTodo,
};

const activityColors: Record<ActivityType, string> = {
  document: "text-blue-600",
  signature: "text-green-600",
  message: "text-purple-600",
  upload: "text-orange-600",
  party: "text-cyan-600",
  status: "text-yellow-600",
  loop: "text-indigo-600",
  task: "text-teal-600",
};

export default function ActivityFeed({ activities, maxHeight = "h-96" }: ActivityFeedProps) {
  return (
    <ScrollArea className={maxHeight}>
      <div className="space-y-4 pr-4">
        {activities.map((activity, idx) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div key={activity.id} className="flex gap-3" data-testid={`activity-item-${idx}`}>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {activity.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 p-1 bg-background rounded-full ${colorClass}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.target && (
                    <span className="font-medium"> {activity.target}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-timestamp-${idx}`}>
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
