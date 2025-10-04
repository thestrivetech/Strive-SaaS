'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, Calendar, FileText, DollarSign } from 'lucide-react';
import type { activities } from '@prisma/client';

/**
 * Recent Activity Feed Component
 *
 * Displays a timeline of recent CRM activities (calls, emails, meetings, etc.)
 *
 * @example
 * ```tsx
 * <RecentActivity activities={recentActivities} />
 * ```
 */

type ActivityWithRelations = activities & {
  created_by: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  lead: { id: string; name: string } | null;
  contact: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
  listing: { id: string; address: string } | null;
};

interface RecentActivityProps {
  activities: ActivityWithRelations[];
}

const activityIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
  TASK: FileText,
  DEAL: DollarSign,
};

const activityColors = {
  CALL: 'text-blue-600',
  EMAIL: 'text-purple-600',
  MEETING: 'text-green-600',
  NOTE: 'text-gray-600',
  TASK: 'text-orange-600',
  DEAL: 'text-emerald-600',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || FileText;
              const iconColor = activityColors[activity.type as keyof typeof activityColors] || 'text-gray-600';
              const userName = activity.created_by.name || 'Unknown User';
              const initials = userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              // Determine which entity is associated
              const relatedEntity = activity.lead?.name || activity.contact?.name || activity.deal?.title || activity.listing?.address;

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
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
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.created_by.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {userName} •{' '}
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {relatedEntity && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {relatedEntity}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
