import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Phone, Mail, Calendar, FileText, DollarSign } from "lucide-react";

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "deal";
  title: string;
  description: string;
  timestamp: Date;
  agentName: string;
  agentAvatar?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  deal: DollarSign,
};

const activityColors = {
  call: "text-chart-1",
  email: "text-chart-2",
  meeting: "text-chart-3",
  note: "text-chart-4",
  deal: "text-chart-5",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card data-testid="card-recent-activity">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const iconColor = activityColors[activity.type];
            const initials = activity.agentName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg hover-elevate"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`mt-0.5 ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {activity.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.agentAvatar} />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.agentName} •{" "}
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
