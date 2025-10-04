'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Calendar, FileText, Home } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { activities, users } from '@prisma/client';
import type { ActivityType } from '@prisma/client';

type ActivityWithUser = activities & {
  created_by?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
};

interface ContactCommunicationsProps {
  activities: ActivityWithUser[];
}

// Activity type icons
const activityIcons: Record<ActivityType, React.ReactNode> = {
  CALL: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  MEETING: <Calendar className="h-4 w-4" />,
  NOTE: <MessageSquare className="h-4 w-4" />,
  TASK: <FileText className="h-4 w-4" />,
  SHOWING: <Home className="h-4 w-4" />,
  OPEN_HOUSE: <Home className="h-4 w-4" />,
  FOLLOW_UP: <MessageSquare className="h-4 w-4" />,
};

// Activity type labels
const activityLabels: Record<ActivityType, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  NOTE: 'Note',
  TASK: 'Task',
  SHOWING: 'Showing',
  OPEN_HOUSE: 'Open House',
  FOLLOW_UP: 'Follow Up',
};

// Activity type colors
const activityColors: Record<ActivityType, string> = {
  CALL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  EMAIL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  MEETING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  NOTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  TASK: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  SHOWING: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  OPEN_HOUSE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  FOLLOW_UP: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
};

export function ContactCommunications({ activities }: ContactCommunicationsProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            No communications recorded yet. Log your first interaction with this contact.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${activityColors[activity.type]}`}>
                  {activityIcons[activity.type]}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2" />
                )}
              </div>

              {/* Activity content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activityLabels[activity.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : 'N/A'}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1">{activity.title}</h4>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    )}
                    {activity.outcome && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Outcome:</span> {activity.outcome}
                      </p>
                    )}
                    {activity.duration_minutes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {activity.duration_minutes} minutes
                      </p>
                    )}
                  </div>
                </div>

                {/* Created by */}
                {activity.created_by && activity.created_by.name && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.created_by.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.created_by.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
