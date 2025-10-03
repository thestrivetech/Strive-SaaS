import { getActivityLogs } from '@/lib/modules/dashboard/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/(shared)/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/(shared)/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

interface ActivityTimelineProps {
  organizationId: string;
  resourceType?: string;
  resourceId?: string;
  limit?: number;
}

const actionLabels: Record<string, string> = {
  // Customer actions
  created_customer: 'created customer',
  updated_customer: 'updated customer',
  deleted_customer: 'deleted customer',

  // Project actions
  created_project: 'created project',
  updated_project: 'updated project',
  deleted_project: 'deleted project',

  // Task actions
  created_task: 'created task',
  updated_task: 'updated task',
  deleted_task: 'deleted task',
  updated_task_status: 'updated task status',
  assigned_task: 'assigned task',
};

function formatActivityDescription(activity: any): string {
  const action = actionLabels[activity.action] || activity.action.replace(/_/g, ' ');

  // Special formatting for specific actions
  if (activity.newData?.name) {
    return `${action} "${activity.newData.name}"`;
  }

  if (activity.newData?.title) {
    return `${action} "${activity.newData.title}"`;
  }

  // Status changes
  if (activity.action === 'updated_task_status' && activity.newData?.status) {
    return `updated task status to ${activity.newData.status.replace('_', ' ')}`;
  }

  if (activity.action === 'updated_customer' && activity.newData?.status) {
    return `updated customer status to ${activity.newData.status}`;
  }

  return action;
}

function groupActivitiesByDate(activities: any[]) {
  const groups: Record<string, any[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(activity);
  });

  return groups;
}

export async function ActivityTimeline({
  organizationId,
  resourceType,
  resourceId,
  limit = 50,
}: ActivityTimelineProps) {
  const activities = await getActivityLogs(organizationId, resourceType, resourceId, limit);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
        <div key={dateLabel} className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">{dateLabel}</h3>
          <div className="space-y-3">
            {dateActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start">
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={activity.user?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {activity.user?.name?.[0]?.toUpperCase() ||
                      activity.user?.email?.[0]?.toUpperCase() ||
                      '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.user?.name || activity.user?.email || 'Unknown user'}
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {formatActivityDescription(activity)}
                    </span>
                  </p>

                  {/* Changed Fields (for updates) */}
                  {activity.action.includes('updated') &&
                    activity.oldData &&
                    activity.newData && (
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(activity.newData).map((key) => {
                          if (
                            activity.oldData[key] !== undefined &&
                            activity.newData[key] !== activity.oldData[key]
                          ) {
                            return (
                              <div key={key} className="flex gap-2">
                                <span className="capitalize">{key}:</span>
                                <span className="line-through">{String(activity.oldData[key])}</span>
                                <span>→</span>
                                <span className="font-medium">{String(activity.newData[key])}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}