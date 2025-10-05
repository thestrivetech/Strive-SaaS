'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Phone, Mail, Calendar, UserCheck } from 'lucide-react';
import type { activities, users } from '@prisma/client';

type ActivityWithUser = activities & {
  created_by?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
};

interface LeadActivityTimelineProps {
  activities: ActivityWithUser[];
}

const ACTIVITY_ICONS = {
  NOTE: MessageSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  STATUS_CHANGE: UserCheck,
} as const;

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity yet</p>
            <p className="text-sm mt-1">Activities will appear here as you interact with this lead</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || MessageSquare;
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  {!isLast && <div className="w-px h-full bg-border mt-2" />}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{activity.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {activity.created_by && (
                          <>
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={activity.created_by.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {activity.created_by.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {activity.created_by.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
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
