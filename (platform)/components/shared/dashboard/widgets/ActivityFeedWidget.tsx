'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  UserPlus,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  FileText,
  FolderKanban,
} from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  CUSTOMER_CREATED: UserPlus,
  PROJECT_COMPLETED: FolderKanban,
  TASK_COMPLETED: CheckCircle,
  DEAL_CLOSED: DollarSign,
  LEAD_ADDED: UserPlus,
  PAYMENT_RECEIVED: DollarSign,
  MEETING_SCHEDULED: Calendar,
  CAMPAIGN_UPDATE: TrendingUp,
  CONTRACT_SIGNED: FileText,
  USER: User,
};

const colorMap = {
  CUSTOMER_CREATED: '#00D2FF',
  PROJECT_COMPLETED: '#39FF14',
  TASK_COMPLETED: '#8B5CF6',
  DEAL_CLOSED: '#39FF14',
  LEAD_ADDED: '#00D2FF',
  PAYMENT_RECEIVED: '#39FF14',
  MEETING_SCHEDULED: '#8B5CF6',
  CAMPAIGN_UPDATE: '#00D2FF',
  CONTRACT_SIGNED: '#39FF14',
  USER: '#00D2FF',
};

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  created_at: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface ActivityFeedWidgetProps {
  organizationId: string;
}

export function ActivityFeedWidget({ organizationId }: ActivityFeedWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In development, use mock data from the query function
        // This will be replaced with real API call in Phase 5
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'CUSTOMER_CREATED',
            title: 'New customer added to CRM',
            description: 'John Smith',
            created_at: new Date(Date.now() - 3600000),
            user: {
              id: '1',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              avatar_url: null,
            },
          },
          {
            id: '2',
            type: 'PROJECT_COMPLETED',
            title: 'Transaction closed successfully',
            description: '123 Main St',
            created_at: new Date(Date.now() - 7200000),
            user: {
              id: '2',
              name: 'Mike Chen',
              email: 'mike@example.com',
              avatar_url: null,
            },
          },
          {
            id: '3',
            type: 'TASK_COMPLETED',
            title: 'Title search completed',
            description: '456 Oak Ave',
            created_at: new Date(Date.now() - 10800000),
            user: {
              id: '3',
              name: 'Lisa Anderson',
              email: 'lisa@example.com',
              avatar_url: null,
            },
          },
          {
            id: '4',
            type: 'DEAL_CLOSED',
            title: 'Deal won',
            description: '$450,000 sale',
            created_at: new Date(Date.now() - 14400000),
            user: {
              id: '4',
              name: 'David Brown',
              email: 'david@example.com',
              avatar_url: null,
            },
          },
          {
            id: '5',
            type: 'LEAD_ADDED',
            title: 'New lead captured',
            description: 'Emily Davis - Buyer',
            created_at: new Date(Date.now() - 18000000),
            user: {
              id: '5',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              avatar_url: null,
            },
          },
        ];
        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [organizationId]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div
      className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-purple"
      data-testid="activity-feed-widget"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="w-2 h-2 rounded-full bg-purple-400"
        />
        Activity Feed
      </h3>

      <div
        className="activity-feed space-y-3 max-h-96 overflow-y-auto pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.map((activity, index) => {
            const IconComponent =
              iconMap[activity.type as keyof typeof iconMap] || User;
            const color = colorMap[activity.type as keyof typeof colorMap] || '#00D2FF';

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                className="flex gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                data-testid={`activity-${activity.id}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}80)`,
                  }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-white">{activity.title}</span>
                    {activity.description && (
                      <>
                        {' - '}
                        <span className="text-muted-foreground">
                          {activity.description}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {activity.user?.name || 'System'}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(activity.created_at))}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        <Link href="/activity">
          <Button
            variant="ghost"
            className="w-full py-2 text-sm text-cyan-400 hover:text-purple-400 transition-colors mt-2"
            data-testid="view-all-activities"
          >
            View All Activities →
          </Button>
        </Link>
      </div>
    </div>
  );
}
