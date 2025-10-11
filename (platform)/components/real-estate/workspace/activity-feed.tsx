'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/lib/modules/workspace/activity';
import {
  formatActivityDescription,
  getActivityIcon,
  getActivityColor,
} from '@/lib/modules/workspace/activity';
import * as Icons from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  description?: string;
  maxHeight?: string;
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  description,
  maxHeight = '400px',
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const iconName = getActivityIcon(activity);
  const colorClass = getActivityColor(activity);
  const description = formatActivityDescription(activity);

  // Get the icon component dynamically
  const Icon = (Icons as any)[toPascalCase(iconName)] || Icons.Activity;

  // Get initials from user name
  const initials = activity.user.name
    ? activity.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : activity.user.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.user.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
          <div className="flex-1">
            <p className="text-sm">{description}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Convert kebab-case to PascalCase
 * Example: 'user-plus' -> 'UserPlus'
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
